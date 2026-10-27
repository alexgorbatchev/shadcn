import { mkdir, rm } from "node:fs/promises";
import { basename, resolve } from "node:path";
import manifest from "../package.json";

export async function createWorkspace(directory: string, templateDirectory: string): Promise<string> {
  const destination = resolve(directory);
  const files = await Array.fromAsync(
    new Bun.Glob("**/*").scan({ cwd: templateDirectory, dot: true, onlyFiles: true }),
  );
  if (!files.length) throw new Error("Prototype templates are missing. Reinstall @alexgorbatchev/shadcn.");
  await mkdir(resolve(destination, ".."), { recursive: true });
  // Exclusive creation rejects existing directories and symlinks before writing anything.
  await mkdir(destination);
  try {
    for (const file of files) {
      await Bun.write(
        resolve(destination, file === "gitignore" ? ".gitignore" : file),
        Bun.file(resolve(templateDirectory, file)),
      );
    }
    const peers = manifest.peerDependencies;
    const development = manifest.devDependencies;
    await Bun.write(
      resolve(destination, "package.json"),
      JSON.stringify(
        {
          name: basename(destination)
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-"),
          private: true,
          type: "module",
          packageManager: manifest.packageManager,
          dependencies: {
            [manifest.name]: manifest.version,
            react: peers.react,
            "react-dom": peers["react-dom"],
            "@base-ui/react": peers["@base-ui/react"],
            "@base-ui/utils": peers["@base-ui/utils"],
            "class-variance-authority": peers["class-variance-authority"],
            clsx: peers.clsx,
            "lucide-react": peers["lucide-react"],
            "tailwind-merge": peers["tailwind-merge"],
            "tw-animate-css": peers["tw-animate-css"],
            "usehooks-ts": peers["usehooks-ts"],
          },
          devDependencies: {
            vite: development.vite,
            "@vitejs/plugin-react": development["@vitejs/plugin-react"],
            "@tailwindcss/vite": development["@tailwindcss/vite"],
            tailwindcss: development.tailwindcss,
            "@types/react": development["@types/react"],
            "@types/react-dom": development["@types/react-dom"],
            "@types/bun": development["@types/bun"],
            "@typescript/native": development["@typescript/native"],
          },
        },
        null,
        2,
      ) + "\n",
    );
  } catch (error) {
    await rm(destination, { recursive: true, force: true });
    throw error;
  }
  return destination;
}
