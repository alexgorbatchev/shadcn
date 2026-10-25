import { afterAll, beforeAll, expect, test } from "bun:test";
import { createServer, type ViteDevServer } from "vite";
import { chromium, type Browser } from "playwright";

let server: ViteDevServer;
let browser: Browser;
let origin: string;

beforeAll(async () => {
  server = await createServer({
    configFile: "scripts/snapshot-gallery/vite.config.ts",
    cacheDir: "../../.cache/snapshot-gallery/tests",
    server: { port: 0, open: false },
  });
  await server.listen();
  origin = server.resolvedUrls?.local[0] ?? "";
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

test("gallery virtualizes every baseline and serves complete images", async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(origin);
    await page.getByRole("heading", { name: "src/components/Badge.tsx", exact: true }).waitFor();
    const baselinePaths = await Array.fromAsync(
      new Bun.Glob("src/components/stories/**/__screenshots__/**/*.png").scan("."),
    );
    const seen = new Set<string>();
    const viewport = page.getByRole("region", { name: "Snapshot gallery", exact: true });
    const height = await viewport.evaluate((element) => element.scrollHeight);
    for (let top = 0; top < height + 800; top += 400) {
      await viewport.evaluate((element, offset) => element.scrollTo(0, offset), top);
      await page.waitForTimeout(50);
      const links = await page
        .locator("figure a")
        .evaluateAll((elements) => elements.map((element) => element.getAttribute("href") ?? ""));
      for (const link of links) seen.add(decodeURIComponent(link).split("?")[0]);
    }
    expect([...seen].map((path) => path.slice(path.indexOf("/src/components/stories/"))).sort()).toEqual(
      baselinePaths.map((path) => `/${path}`).sort(),
    );
    expect(await page.locator("figure").count()).toBeLessThan(baselinePaths.length);
    for (const imagePath of seen) {
      const response = await fetch(new URL(imagePath, origin));
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/png");
    }
    expect(errors).toEqual([]);
  } finally {
    await page.close();
  }
}, 30_000);

test("filter resets scroll, narrows snapshots, and recovers from an empty result on mobile", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(origin);
    const filter = page.getByRole("searchbox", { name: "Filter snapshots", exact: true });
    const component = page.getByRole("combobox", { name: "Component", exact: true });
    await page.getByRole("heading", { name: "src/components/Badge.tsx", exact: true }).waitFor();
    await page
      .getByRole("region", { name: "Snapshot gallery", exact: true })
      .evaluate((element) => element.scrollTo(0, 1000));
    await component.fill("ScrollArea");
    await page.getByRole("option", { name: "src/components/ScrollArea.tsx", exact: true }).click();
    await page.getByRole("heading", { name: "src/components/ScrollArea.tsx", exact: true }).waitFor();
    expect(await page.locator("figure").count()).toBeGreaterThan(0);
    expect(await page.locator("body").evaluate((element) => element.scrollWidth <= innerWidth)).toBe(true);
    await filter.fill("no-matching-snapshot");
    await page.getByText("No snapshots match your filter.", { exact: true }).waitFor();
    expect(await page.locator("figure").count()).toBe(0);
    await filter.fill("");
    await component.fill("Input");
    await page.getByRole("option", { name: "src/components/Input.tsx", exact: true }).click();
    await page.getByRole("heading", { name: "src/components/Input.tsx", exact: true }).waitFor();
    await page.waitForFunction(() => (document.querySelector("canvas")?.width ?? 300) !== 300);
    expect(await page.locator("figure a").first().getAttribute("target")).toBe("_blank");
  } finally {
    await page.close();
  }
}, 30_000);

test("component autocomplete supports keyboard selection and combines with the snapshot filter", async () => {
  const page = await browser.newPage();
  page.setDefaultTimeout(5_000);
  try {
    await page.goto(origin);
    const component = page.getByRole("combobox", { name: "Component", exact: true });
    const filter = page.getByRole("searchbox", { name: "Filter snapshots", exact: true });
    await component.fill("Button");
    await page.getByRole("option", { name: "src/components/Button.tsx", exact: true }).waitFor();
    expect(await page.getByRole("option").allTextContents()).toEqual(["src/components/Button.tsx"]);
    await component.press("ArrowDown");
    await component.press("Enter");
    await page.getByRole("heading", { name: "src/components/Button.tsx", exact: true }).waitFor();
    expect(await page.getByRole("heading", { level: 2 }).allTextContents()).toEqual(["src/components/Button.tsx"]);
    await filter.fill("dark");
    const paths = await Array.fromAsync(new Bun.Glob("src/components/stories/**/__screenshots__/**/*.png").scan("."));
    const buttonDark = paths.filter((path) => path.includes("/Button.stories.tsx/") && path.includes("visual-dark-"));
    await page
      .getByText(`${buttonDark.length} / ${paths.length} snapshots · 1 components · click an image for full size`, {
        exact: true,
      })
      .waitFor();
    await component.fill("no-such-component");
    await page.getByText("No components found.", { exact: true }).waitFor();
    expect(await page.locator("figure").count()).toBeGreaterThan(0);
    await component.press("Escape");
    await page.getByRole("button", { name: "Show all components", exact: true }).click();
    const dark = paths.filter((path) => path.includes("visual-dark-"));
    const groups = new Set(dark.map((path) => path.slice(0, path.lastIndexOf("/"))));
    await page
      .getByText(
        `${dark.length} / ${paths.length} snapshots · ${groups.size} components · click an image for full size`,
        { exact: true },
      )
      .waitFor();
    expect(await filter.inputValue()).toBe("dark");
    expect(await component.inputValue()).toBe("");
    await filter.fill("");
    await page.getByRole("heading", { name: "src/components/Badge.tsx", exact: true }).waitFor();
  } finally {
    await page.close();
  }
}, 30_000);

test("content previews trim margins while full frame preserves original dimensions", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(origin);
    const canvas = page.locator("canvas").first();
    await canvas.waitFor();
    await page.waitForFunction(() => (document.querySelector("canvas")?.width ?? 300) < 300);
    const trimmedWidth = await canvas.evaluate((element) => (element as HTMLCanvasElement).width);
    const originalWidth = await page
      .locator("figure a")
      .first()
      .evaluate(async (element) => {
        const response = await fetch(element.getAttribute("href") ?? "");
        const image = await createImageBitmap(await response.blob());
        const width = image.width;
        image.close();
        return width;
      });
    expect(trimmedWidth).toBeLessThan(originalWidth);
    await page.getByRole("combobox", { name: "Preview", exact: true }).selectOption("frame");
    await page.waitForFunction((width) => document.querySelector("canvas")?.width === width, originalWidth);
    expect(await canvas.evaluate((element) => (element as HTMLCanvasElement).width)).toBe(originalWidth);
    await page.getByRole("combobox", { name: "Preview", exact: true }).selectOption("content");
    await page.waitForFunction((width) => document.querySelector("canvas")?.width === width, trimmedWidth);
  } finally {
    await page.close();
  }
}, 30_000);
