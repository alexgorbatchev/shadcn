import ts from "typescript";
import type { PackageMetadata, PublicImports, StoryDoc } from "./types";

function resolveNode(node: ts.Node, checker: ts.TypeChecker, seen = new Set<ts.Node>()): ts.Node {
  if (seen.has(node)) throw new Error("Circular story metadata");
  seen.add(node);
  if (ts.isSatisfiesExpression(node) || ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) {
    return resolveNode(node.expression, checker, seen);
  }
  if (ts.isIdentifier(node)) {
    const declaration = checker.getSymbolAtLocation(node)?.valueDeclaration;
    if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer) {
      return resolveNode(declaration.initializer, checker, seen);
    }
  }
  if (ts.isPropertyAccessExpression(node)) {
    const value = objectFields(node.expression, checker).get(node.name.text);
    if (value) return resolveNode(value, checker, seen);
  }
  return node;
}

function objectFields(node: ts.Node, checker: ts.TypeChecker, seen = new Set<ts.Node>()): Map<string, ts.Node> {
  const object = resolveNode(node, checker);
  if (!ts.isObjectLiteralExpression(object)) throw new Error(`Expected static story object: ${node.getText()}`);
  if (seen.has(object)) throw new Error("Circular story spread");
  const ancestors = new Set(seen).add(object);
  const fields = new Map<string, ts.Node>();
  for (const property of object.properties) {
    if (ts.isSpreadAssignment(property)) {
      for (const [name, value] of objectFields(property.expression, checker, ancestors)) fields.set(name, value);
    } else if (ts.isPropertyAssignment(property) || ts.isMethodDeclaration(property)) {
      const name = property.name;
      const key = ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : name.getText();
      fields.set(key, ts.isPropertyAssignment(property) ? property.initializer : property);
    } else if (ts.isShorthandPropertyAssignment(property)) {
      fields.set(property.name.text, property.name);
    }
  }
  return fields;
}

function textValue(node: ts.Node | undefined, checker: ts.TypeChecker): string | undefined {
  if (!node) return undefined;
  const value = resolveNode(node, checker);
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  if (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = textValue(value.left, checker);
    const right = textValue(value.right, checker);
    return left === undefined || right === undefined ? undefined : left + right;
  }
  return undefined;
}

function description(fields: Map<string, ts.Node>, kind: string, checker: ts.TypeChecker): string {
  let node = fields.get("parameters");
  for (const key of ["docs", "description", kind]) {
    if (!node) return "";
    node = objectFields(node, checker).get(key);
  }
  return textValue(node, checker) ?? "";
}

function codeBlock(node: ts.Node, source: ts.SourceFile): string {
  const code = ts.createPrinter().printNode(ts.EmitHint.Unspecified, node, source);
  const fence = "`".repeat(Math.max(3, ...Array.from(code.matchAll(/`+/g), (match) => match[0].length + 1)));
  return `${fence}tsx\n${code}\n${fence}`;
}

function resolveSymbol(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

export function extractStoryDoc(
  source: ts.SourceFile,
  sourcePath: string,
  storyPath: string,
  checker: ts.TypeChecker,
  imports: PublicImports,
  manifest: PackageMetadata,
): StoryDoc {
  const defaultExport = source.statements.find(ts.isExportAssignment);
  if (!defaultExport) throw new Error(`Missing story metadata: ${sourcePath}`);
  const meta = objectFields(defaultExport.expression, checker);
  const title = textValue(meta.get("title"), checker);
  if (!title) throw new Error(`Cannot resolve story title: ${sourcePath}`);
  const name = title.split("/").at(-1) ?? title;
  const category = storyPath.split("/").slice(0, -1).join("/");
  const summary = description(meta, "component", checker);
  const lines = [`# ${name}`, ""];
  if (summary) lines.push(summary, "");
  lines.push(`Story: ${title}`, `Source: ${sourcePath}`, "");
  if (manifest.repository) {
    const repository = manifest.repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
    lines.push(`[Full source and local helpers](${repository}/blob/main/${sourcePath})`, "");
  }
  const groupedImports = new Map<string, Set<string>>();
  const supportingImports: string[] = [];
  for (const statement of source.statements.filter(ts.isImportDeclaration)) {
    const moduleName = ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : "";
    if (
      moduleName &&
      !moduleName.startsWith(".") &&
      !moduleName.startsWith("@/") &&
      !moduleName.startsWith("storybook") &&
      !moduleName.startsWith("@storybook/")
    ) {
      supportingImports.push(statement.getText(source));
    }
    const clause = statement.importClause;
    const bindings = clause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const binding of bindings.elements) {
      const symbol = checker.getSymbolAtLocation(binding.name);
      const candidates = symbol && imports.get(resolveSymbol(symbol, checker));
      const importedName = binding.propertyName?.text ?? binding.name.text;
      const entry = candidates?.find((candidate) => candidate.name === importedName) ?? candidates?.[0];
      if (!entry) continue;
      const names = groupedImports.get(entry.path) ?? new Set<string>();
      const name = entry.name === binding.name.text ? entry.name : `${entry.name} as ${binding.name.text}`;
      names.add(`${clause?.isTypeOnly || binding.isTypeOnly ? "type " : ""}${name}`);
      groupedImports.set(entry.path, names);
    }
  }
  if (groupedImports.size > 0) {
    lines.push("## Public imports", "", "```tsx");
    for (const [path, names] of groupedImports) lines.push(`import { ${[...names].join(", ")} } from "${path}";`);
    lines.push("```", "");
  }
  if (supportingImports.length > 0) {
    lines.push("## Supporting imports", "", "```tsx", ...supportingImports, "```", "");
  }
  for (const [key, heading] of [
    ["component", "Default component"],
    ["argTypes", "Story controls"],
    ["args", "Default args"],
    ["render", "Default render"],
  ]) {
    const value = meta.get(key);
    if (value) lines.push(`## ${heading}`, "", codeBlock(value, source), "");
  }
  lines.push(
    "## Examples",
    "",
    "Storybook CSF excerpts. Default args and render apply unless overridden. Local helpers, fixtures, decorators, and providers may be required; these are reference excerpts, not standalone consumer modules. Interaction tests are omitted.",
    "",
  );
  for (const statement of source.statements.filter(ts.isVariableStatement)) {
    if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!declaration.initializer || !ts.isIdentifier(declaration.name)) continue;
      const fields = objectFields(declaration.initializer, checker);
      const exampleName = textValue(fields.get("name"), checker) || declaration.name.text;
      const properties: ts.ObjectLiteralElementLike[] = [];
      for (const [key, value] of fields) {
        if (["play", "parameters", "tags", "name"].includes(key)) continue;
        if (ts.isMethodDeclaration(value)) properties.push(value);
        else if (ts.isExpression(value)) properties.push(ts.factory.createPropertyAssignment(key, value));
      }
      lines.push(`### ${exampleName}`, "");
      const exampleDescription = description(fields, "story", checker);
      if (exampleDescription) lines.push(exampleDescription, "");
      lines.push(codeBlock(ts.factory.createObjectLiteralExpression(properties, true), source), "");
    }
  }
  return {
    name,
    category,
    path: `components/${storyPath.replace(/\.stories\.tsx$/, ".md")}`,
    description: summary,
    content: `${lines.join("\n").trim()}\n`,
  };
}
