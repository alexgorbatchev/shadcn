import { resolve } from "node:path";
import { homedir } from "node:os";
import type { Writable } from "node:stream";
import { formatOutput } from "./formatOutput";

export async function runWorkspace(directory: string, action: "start" | "build", port: number): Promise<number> {
  const cwd = resolve(directory);
  const vite = resolve(cwd, "node_modules/vite/bin/vite.js");
  if (!(await Bun.file(resolve(cwd, "vite.config.ts")).exists())) {
    throw new Error(`No prototype workspace at ${cwd}. Create one with shadcn-prototype workspace create <directory>.`);
  }
  if (!(await Bun.file(vite).exists())) {
    throw new Error(`Dependencies are missing in ${cwd}. Run bun install in that directory first.`);
  }
  const args = action === "build" ? ["build"] : ["--host", "127.0.0.1", "--port", String(port), "--strictPort"];
  const child = Bun.spawn([process.execPath, vite, ...args], { cwd, stdin: "inherit", stdout: "pipe", stderr: "pipe" });
  const stop = () => child.kill("SIGTERM");
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    const forward = async (stream: ReadableStream<Uint8Array>, output: Writable) => {
      const decoder = new TextDecoder();
      let pending = "";
      for await (const bytes of stream) {
        pending += decoder.decode(bytes, { stream: true });
        const end = pending.lastIndexOf("\n");
        if (end >= 0) {
          output.write(formatOutput(pending.slice(0, end + 1), homedir()));
          pending = pending.slice(end + 1);
        }
      }
      output.write(formatOutput(pending + decoder.decode(), homedir()));
    };
    await Promise.all([forward(child.stdout, process.stdout), forward(child.stderr, process.stderr)]);
    return await child.exited;
  } finally {
    child.kill("SIGTERM");
    await child.exited;
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
  }
}
