import { mkdir, mkdtemp } from "node:fs/promises";
import { resolve } from "node:path";

export async function createTestDirectory(name: string): Promise<string> {
  const root = process.env.SHADCN_TEST_ROOT ?? resolve(".tmp");
  await mkdir(root, { recursive: true });
  return await mkdtemp(`${root}/${name}-`);
}
