import { afterAll, beforeAll, expect, test } from "bun:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { preview, type PreviewServer } from "vite";
import { chromium, type Browser } from "playwright";
import { createTestDirectory } from "../createTestDirectory";
import { runTestCommand } from "../runTestCommand";

const root = await createTestDirectory("gallery-build");
const output = `${root}/dist`;
const controller = new AbortController();
let command: ReturnType<typeof runTestCommand> | undefined;
let server: PreviewServer;
let browser: Browser;
let origin: string;
let scripts: string[];

beforeAll(async () => {
  // Vite's build and development server share NODE_ENV when run in one process.
  command = runTestCommand(
    [
      process.execPath,
      "run",
      "vite",
      "build",
      "--config",
      "scripts/snapshot-gallery/vite.config.ts",
      "--outDir",
      output,
    ],
    { env: { NODE_ENV: "production" }, cancelSignal: controller.signal, timeout: 30_000 },
  );
  await command;
  scripts = await Array.fromAsync(new Bun.Glob("assets/*.js").scan(output));
  server = await preview({
    configFile: "scripts/snapshot-gallery/vite.config.ts",
    cacheDir: `${root}/cache`,
    build: { outDir: output },
    preview: { host: "127.0.0.1", port: 0, open: false },
  });
  const url = server.resolvedUrls?.local[0];
  assert(url);
  origin = url;
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  controller.abort();
  await Promise.allSettled([command]);
  try {
    await browser?.close();
  } finally {
    try {
      await server?.close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("production JavaScript stays below the build's chunk warning limit", async () => {
  expect(scripts.length).toBeGreaterThan(0);
  for (const script of scripts) {
    expect(Bun.file(`${output}/${script}`).size, script).toBeLessThanOrEqual(
      server.config.build.chunkSizeWarningLimit * 1000,
    );
  }
});

test("production chunks load and preserve virtual scrolling and keyboard filters", async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(5_000);
  const errors: string[] = [];
  const requests: string[] = [];
  const failures: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfinished", (request) => requests.push(new URL(request.url()).pathname.slice(1)));
  page.on("requestfailed", (request) => failures.push(request.url()));
  try {
    await page.goto(origin);
    const firstHeading = page.getByRole("heading", { name: "src/components/Badge.tsx", exact: true });
    await firstHeading.waitFor();
    const paths = await Array.fromAsync(new Bun.Glob("src/components/stories/**/__screenshots__/**/*.png").scan("."));
    expect(await page.locator("figure").count()).toBeGreaterThan(0);
    expect(await page.locator("figure").count()).toBeLessThan(paths.length);
    const viewport = page.getByRole("region", { name: "Snapshot gallery", exact: true });
    await viewport.evaluate((element) => element.scrollTo(0, element.scrollHeight));
    await firstHeading.waitFor({ state: "detached" });
    expect(await page.locator("figure").count()).toBeGreaterThan(0);
    expect(await page.locator("figure").count()).toBeLessThan(paths.length);

    const component = page.getByRole("combobox", { name: "Component", exact: true });
    const filter = page.getByRole("searchbox", { name: "Filter snapshots", exact: true });
    await component.fill("Button");
    await page.getByRole("option", { name: "src/components/Button.tsx", exact: true }).waitFor();
    await component.press("ArrowDown");
    await component.press("Enter");
    await page.getByRole("heading", { name: "src/components/Button.tsx", exact: true }).waitFor();
    expect(await viewport.evaluate((element) => element.scrollTop)).toBe(0);
    await filter.fill("dark");
    const buttonDark = paths.filter((path) => path.includes("/Button.stories.tsx/") && path.includes("visual-dark-"));
    await page
      .getByText(`${buttonDark.length} / ${paths.length} snapshots · 1 components · click an image for full size`, {
        exact: true,
      })
      .waitFor();
    await page.getByRole("button", { name: "Show all components", exact: true }).click();
    const dark = paths.filter((path) => path.includes("visual-dark-"));
    const groups = new Set(dark.map((path) => path.slice(0, path.lastIndexOf("/"))));
    await page
      .getByText(
        `${dark.length} / ${paths.length} snapshots · ${groups.size} components · click an image for full size`,
        {
          exact: true,
        },
      )
      .waitFor();
    expect(await filter.inputValue()).toBe("dark");
    expect(await component.inputValue()).toBe("");
    await filter.fill("");
    await firstHeading.waitFor();
    expect([...new Set(requests.filter((path) => scripts.includes(path)))].sort()).toEqual(scripts.toSorted());
    expect(failures).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await page.close();
  }
}, 30_000);

test("production previews preserve full-frame dimensions and original PNG access", async () => {
  const page = await browser.newPage();
  page.setDefaultTimeout(5_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(origin);
    const canvas = page.locator("canvas").first();
    await page.waitForFunction(() => (document.querySelector("canvas")?.width ?? 300) < 300);
    const trimmedWidth = await canvas.evaluate((element) => (element as HTMLCanvasElement).width);
    const link = page.locator("figure a").first();
    expect(await link.getAttribute("target")).toBe("_blank");
    const href = await link.getAttribute("href");
    assert(href);
    const response = await fetch(new URL(href, origin));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(bytes.subarray(0, 8)).toEqual(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(bytes).toEqual(await Bun.file(`${output}${new URL(href, origin).pathname}`).bytes());
    const originalWidth = await link.evaluate(async (element) => {
      const response = await fetch(element.getAttribute("href") ?? "");
      const image = await createImageBitmap(await response.blob());
      const width = image.width;
      image.close();
      return width;
    });
    expect(trimmedWidth).toBeLessThan(originalWidth);
    await page.getByRole("combobox", { name: "Preview", exact: true }).selectOption("frame");
    await page.waitForFunction((width) => document.querySelector("canvas")?.width === width, originalWidth);
    await page.getByRole("combobox", { name: "Preview", exact: true }).selectOption("content");
    await page.waitForFunction((width) => document.querySelector("canvas")?.width === width, trimmedWidth);
    expect(errors).toEqual([]);
  } finally {
    await page.close();
  }
}, 30_000);
