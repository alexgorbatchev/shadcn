import { mkdir, rm } from "node:fs/promises";
import { resolve, relative } from "node:path";
import ts from "typescript";
import { extractStoryDoc } from "./llm-docs/extractStoryDoc";
import type { PackageMetadata, PublicImports } from "./llm-docs/types";

export async function buildLlmDocs(rootDirectory: string): Promise<number> {
  const manifest: PackageMetadata = await Bun.file(resolve(rootDirectory, "package.json")).json();
  const config = await Bun.file(resolve(rootDirectory, "tsconfig.json")).json();
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, rootDirectory);
  if (parsed.errors.length) throw new Error(ts.flattenDiagnosticMessageText(parsed.errors[0].messageText, "\n"));
  const storyDirectory = resolve(rootDirectory, "src/components/stories");
  const storyPaths = (await Array.fromAsync(new Bun.Glob("**/*.stories.tsx").scan(storyDirectory))).sort();
  if (!storyPaths.length) throw new Error("No Storybook stories found");
  const entrypoints = await Promise.all(
    Object.entries(manifest.exports).flatMap(([path, target]) => {
      if (typeof target === "string") return [];
      return [
        (async () => {
          const sourcePath = resolve(
            rootDirectory,
            target.import.replace(/^\.\/dist\//, "src/").replace(/\.js$/, ".ts"),
          );
          return {
            path: path === "." ? manifest.name : `${manifest.name}/${path.slice(2)}`,
            sourcePath: (await Bun.file(sourcePath).exists()) ? sourcePath : sourcePath.replace(/\.ts$/, ".tsx"),
          };
        })(),
      ];
    }),
  );
  const program = ts.createProgram(
    [...entrypoints.map((entry) => entry.sourcePath), ...storyPaths.map((path) => resolve(storyDirectory, path))],
    parsed.options,
  );
  const diagnostics = program.getSyntacticDiagnostics();
  if (diagnostics.length) throw new Error(ts.flattenDiagnosticMessageText(diagnostics[0].messageText, "\n"));
  const checker = program.getTypeChecker();
  const imports: PublicImports = new Map();
  for (const entry of entrypoints) {
    const source = program.getSourceFile(entry.sourcePath);
    const symbol = source && checker.getSymbolAtLocation(source);
    if (!symbol) throw new Error(`Missing public entrypoint: ${relative(rootDirectory, entry.sourcePath)}`);
    for (const exported of checker.getExportsOfModule(symbol)) {
      const original = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const entries = imports.get(original) ?? [];
      entries.push({ name: exported.name, path: entry.path });
      imports.set(original, entries);
    }
  }
  const docs = storyPaths.map((path) => {
    const sourcePath = resolve(storyDirectory, path);
    const source = program.getSourceFile(sourcePath);
    if (!source) throw new Error(`Missing story: ${path}`);
    return extractStoryDoc(source, relative(rootDirectory, sourcePath), path, checker, imports, manifest);
  });
  const index = [
    `# ${manifest.name}`,
    "",
    `> ${manifest.description}`,
    "",
    "Generated from the public package exports and Storybook sources.",
    "",
    "## Guide",
    "",
    "- [Setup and usage](./llms/setup.md)",
  ];
  for (const category of [...new Set(docs.map((doc) => doc.category))].sort()) {
    index.push("", `## ${category}`, "");
    for (const doc of docs.filter((doc) => doc.category === category)) {
      const summary = doc.description.split("\n")[0];
      index.push(`- [${doc.name}](./llms/${doc.path})${summary ? `: ${summary}` : ""}`);
    }
  }
  const readme = await Bun.file(resolve(rootDirectory, "README.md")).text();
  const repository = manifest.repository?.url.replace(/^git\+/, "").replace(/\.git$/, "");
  const setup = repository ? readme.replace(/\]\(\.\/([^)]*)\)/g, `](${repository}/blob/main/$1)`) : readme;
  const outputDirectory = resolve(rootDirectory, "llms");
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  const indexContent = `${index.join("\n")}\n`;
  await Promise.all([
    Bun.write(resolve(rootDirectory, "llms.txt"), indexContent),
    Bun.write(resolve(rootDirectory, ".tmp/llm-docs-public/llms.txt"), indexContent),
    Bun.write(`${outputDirectory}/setup.md`, setup),
    ...docs.map((doc) => Bun.write(`${outputDirectory}/${doc.path}`, doc.content)),
  ]);
  return docs.length;
}

if (import.meta.main) {
  const count = await buildLlmDocs(resolve(import.meta.dirname, ".."));
  console.log(`Generated llms.txt and ${count} Storybook reference pages.`);
}
