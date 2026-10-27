import { afterAll, expect, test } from "bun:test";
import { mkdir, rm, symlink } from "node:fs/promises";
import { resolve } from "node:path";
import { createWorkspace } from "../createWorkspace";
import { runWorkspace } from "../runWorkspace";

const root = resolve(".tmp/prototype-unit", crypto.randomUUID());
afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

test("creates an editable workspace including nested source and dotfiles", async () => {
  const destination = await createWorkspace(`${root}/app`, resolve("templates/prototype"));
  expect(destination).toBe(`${root}/app`);
  expect(await Bun.file(`${destination}/src/prototypes/projects/components/Projects.tsx`).text()).toBe(
    await Bun.file("templates/prototype/src/prototypes/projects/components/Projects.tsx").text(),
  );
  expect(await Bun.file(`${destination}/.gitignore`).exists()).toBe(true);
  await expect(createWorkspace(destination, resolve("templates/prototype"))).rejects.toMatchObject({ code: "EEXIST" });
  expect(await Bun.file(`${destination}/src/main.tsx`).exists()).toBe(true);
});

test("rejects symlink destinations without modifying their targets", async () => {
  await mkdir(`${root}/target`, { recursive: true });
  await symlink(`${root}/target`, `${root}/link`);
  await expect(createWorkspace(`${root}/link`, resolve("templates/prototype"))).rejects.toMatchObject({
    code: "EEXIST",
  });
  expect(await Bun.file(`${root}/target/package.json`).exists()).toBe(false);
});

test("rejects an absent template before creating the destination", async () => {
  await expect(createWorkspace(`${root}/absent`, `${root}/no-template`)).rejects.toThrow();
  expect(await Bun.file(`${root}/absent/package.json`).exists()).toBe(false);
});

test("removes only the new workspace when template copying cannot finish", async () => {
  const template = `${root}/unwritable-manifest`;
  await Bun.write(`${template}/package.json/entry`, "directory blocks the manifest write");
  await Bun.write(`${root}/keep`, "existing sibling");
  await expect(createWorkspace(`${root}/failed-copy`, template)).rejects.toThrow();
  expect(await Bun.file(`${root}/failed-copy/package.json/entry`).exists()).toBe(false);
  expect(await Bun.file(`${root}/keep`).text()).toBe("existing sibling");
});

test("reports missing workspaces and dependencies", async () => {
  await expect(runWorkspace(`${root}/missing`, "build", 0)).rejects.toThrow(
    `No prototype workspace at ${root}/missing. Create one with shadcn-prototype workspace create <directory>.`,
  );
  await mkdir(`${root}/incomplete`, { recursive: true });
  await Bun.write(`${root}/incomplete/vite.config.ts`, "export default {};");
  await expect(runWorkspace(`${root}/incomplete`, "start", 0)).rejects.toThrow(
    `Dependencies are missing in ${root}/incomplete. Run bun install in that directory first.`,
  );
});
