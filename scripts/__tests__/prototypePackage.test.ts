import type { Subprocess } from "bun";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, type Browser, type Page } from "playwright";
import manifest from "../../package.json";
import { runConsumerCommand } from "./helpers";

const root = resolve(".tmp/prototype-consumer", crypto.randomUUID());
const workspace = `${root}/workspace`;
let browser: Browser;
let page: Page;
let server: Subprocess<"ignore", "pipe", "pipe">;
let origin: string;
let outputDrain: Promise<string[]>;
const errors: string[] = [];

beforeAll(async () => {
  await mkdir(root, { recursive: true });
  await runConsumerCommand(["npm", "pack", "--ignore-scripts", "--pack-destination", root], process.cwd());
  const archivePath = `${root}/alexgorbatchev-shadcn-${manifest.version}.tgz`;
  await Bun.write(
    `${root}/launcher/package.json`,
    JSON.stringify({ private: true, dependencies: { [manifest.name]: archivePath } }),
  );
  await runConsumerCommand([process.execPath, "install", "--ignore-scripts"], `${root}/launcher`);
  const cli = `${root}/launcher/node_modules/.bin/shadcn-prototype`;
  await runConsumerCommand([process.execPath, cli, "workspace", "create", workspace], root);
  await runConsumerCommand(["git", "init", "--quiet"], workspace);
  await runConsumerCommand(["git", "check-ignore", "node_modules/test", "dist/index.html", ".env.local"], workspace);
  const generated = await Bun.file(`${workspace}/package.json`).json();
  expect(generated.dependencies[manifest.name]).toBe(manifest.version);
  generated.dependencies[manifest.name] = archivePath;
  await Bun.write(`${workspace}/package.json`, JSON.stringify(generated));
  await runConsumerCommand([process.execPath, "install", "--ignore-scripts"], workspace);
  await runConsumerCommand([process.execPath, "node_modules/.bin/tsc", "--noEmit"], workspace);
  await runConsumerCommand([process.execPath, "node_modules/.bin/shadcn-prototype", "workspace", "build"], workspace);
  server = Bun.spawn(
    [process.execPath, "node_modules/.bin/shadcn-prototype", "workspace", "start", ".", "--port", "0"],
    { cwd: workspace, stdout: "pipe", stderr: "pipe" },
  );
  const reader = server.stdout.getReader();
  let output = "";
  const ready = async () => {
    for (;;) {
      const part = await reader.read();
      if (part.done) throw new Error(`Preview exited before ready: ${output}`);
      output += new TextDecoder().decode(part.value);
      const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) {
        origin = match[0];
        break;
      }
    }
  };
  let startupTimer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      ready(),
      new Promise<never>((_, reject) => {
        startupTimer = setTimeout(() => reject(new Error(`Preview startup timeout: ${output}`)), 30_000);
      }),
    ]);
  } finally {
    clearTimeout(startupTimer);
    reader.releaseLock();
  }
  outputDrain = Promise.all([
    Array.fromAsync(server.stdout).then((chunks) => Buffer.concat(chunks).toString()),
    new Response(server.stderr).text(),
  ]);
  browser = await chromium.launch();
  page = await browser.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
}, 120_000);

afterAll(async () => {
  await browser?.close();
  server?.kill("SIGTERM");
  await server?.exited;
  await outputDrain;
  await rm(root, { recursive: true, force: true });
}, 30_000);

test("packed recipes run, edit data, reset, and use an actual mobile viewport", async () => {
  await page.goto(origin);
  const canvas = page.frameLocator('iframe[title="Prototype preview"]');
  await canvas.getByRole("heading", { name: "Delivery overview" }).waitFor();
  await canvas.getByLabel("Team", { exact: true }).selectOption("Engineering");
  expect(await canvas.getByRole("row").count()).toBe(2);
  await page.getByLabel("Prototype", { exact: true }).selectOption("projects");
  await canvas.getByRole("button", { name: "Edit Onboarding redesign", exact: true }).click();
  await canvas.getByLabel("Project name", { exact: true }).fill("New onboarding");
  await canvas.getByRole("button", { name: "Save project", exact: true }).click();
  await canvas.getByRole("status").filter({ hasText: "Saved New onboarding" }).waitFor();
  expect(await canvas.getByRole("cell", { name: "New onboarding", exact: true }).count()).toBe(1);
  await page.getByRole("button", { name: "Reset data", exact: true }).click();
  await canvas.getByRole("cell", { name: "Onboarding redesign", exact: true }).waitFor();
  await canvas.getByRole("button", { name: "Edit Onboarding redesign", exact: true }).click();
  await canvas.getByLabel("Project name", { exact: true }).fill("Discard this draft");
  await canvas.getByLabel("Project name", { exact: true }).press("Escape");
  await canvas.getByRole("dialog").waitFor({ state: "hidden" });
  expect(await canvas.getByRole("cell", { name: "Onboarding redesign", exact: true }).count()).toBe(1);
  await canvas.getByLabel("Search projects", { exact: true }).fill("no match");
  await canvas.getByText("No matching projects", { exact: true }).waitFor();
  await page.getByLabel("Prototype", { exact: true }).selectOption("settings");
  await canvas.getByLabel("Contact email", { exact: true }).fill("invalid");
  await canvas.getByRole("button", { name: "Save settings", exact: true }).click();
  expect(await canvas.getByRole("status").textContent()).toBe("");
  expect(
    await canvas
      .getByLabel("Contact email", { exact: true })
      .evaluate((input: HTMLInputElement) => input.validity.typeMismatch),
  ).toBe(true);
  await canvas.getByLabel("Contact email", { exact: true }).fill("team@example.com");
  await canvas.getByLabel("Workspace name", { exact: true }).fill("Orbit");
  await canvas.getByRole("switch", { name: "Email updates", exact: true }).click();
  await canvas.getByRole("button", { name: "Save settings", exact: true }).click();
  await canvas
    .getByRole("status")
    .filter({ hasText: "Saved Orbit. Email updates disabled for team@example.com." })
    .waitFor();
  await page.getByLabel("Viewport", { exact: true }).selectOption("390");
  expect(await canvas.locator("html").evaluate(() => window.innerWidth)).toBe(390);
  await page.getByLabel("Theme", { exact: true }).selectOption("light");
  await canvas.locator('html[data-theme="light"]').waitFor();
  await page.getByLabel("Density", { exact: true }).selectOption("compact");
  await canvas.locator('[data-density="compact"]').first().waitFor();
  await page.screenshot({ path: resolve(".tmp/prototype-validation/workbench.png") });
  expect(errors).toEqual([]);
}, 60_000);

test.each(["dashboard", "projects", "settings"])(
  "%s exposes populated, empty, loading, and error scenarios",
  async (prototype) => {
    await page.goto(`${origin}/?canvas=1&prototype=${prototype}&scenario=empty`);
    await page.getByText("No data yet", { exact: true }).waitFor();
    await page.goto(`${origin}/?canvas=1&prototype=${prototype}&scenario=loading`);
    await page.getByRole("status").filter({ hasText: "Loading sample data…" }).waitFor();
    await page.goto(`${origin}/?canvas=1&prototype=${prototype}&scenario=error`);
    await page.getByText("Unable to load data", { exact: true }).waitFor();
    expect(errors).toEqual([]);
  },
  30_000,
);

test("direct links reject unknown screens and live edits update the preview", async () => {
  await page.goto(`${origin}/?canvas=1&prototype=missing`);
  expect(await page.getByRole("alert").textContent()).toBe("Unknown prototype: missing");
  await page.goto(`${origin}/?canvas=1&prototype=dashboard`);
  await page.getByRole("heading", { name: "Delivery overview", exact: true }).waitFor();
  const path = `${workspace}/src/prototypes/dashboard/components/Dashboard.tsx`;
  await Bun.write(path, (await Bun.file(path).text()).replace("Delivery overview", "Live delivery overview"));
  await page.getByRole("heading", { name: "Live delivery overview", exact: true }).waitFor();
  expect(errors).toEqual([]);
}, 30_000);

test("copying a recipe discovers a new screen without host changes", async () => {
  await page.goto(origin);
  await cp(`${workspace}/src/prototypes/dashboard`, `${workspace}/src/prototypes/copied`, { recursive: true });
  const definition = `${workspace}/src/prototypes/copied/prototype.ts`;
  await Bun.write(
    definition,
    (await Bun.file(definition).text()).replace('title: "Dashboard"', 'title: "Copied dashboard"'),
  );
  await page.getByRole("option", { name: "Copied dashboard", exact: true }).waitFor({ state: "attached" });
  await page.getByLabel("Prototype", { exact: true }).selectOption("copied");
  await page
    .frameLocator('iframe[title="Prototype preview"]')
    .getByRole("heading", { name: "Live delivery overview", exact: true })
    .waitFor();
  expect(errors).toEqual([]);
}, 30_000);
