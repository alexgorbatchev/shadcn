import { afterAll, beforeAll, expect, test } from "bun:test";
import { chromium, type Browser, type Page } from "playwright";
import { preview, type PreviewServer } from "vite";

let server: PreviewServer | undefined;
let browser: Browser | undefined;
let origin: string;

beforeAll(async () => {
  server = await preview({
    configFile: false,
    build: { outDir: "storybook-static" },
    preview: { host: "127.0.0.1", port: 0, open: false },
  });
  const address = server.httpServer.address();
  if (!address || typeof address === "string") throw new Error("Preview did not bind a TCP port");
  origin = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function checkStory(id: string, check: (page: Page) => Promise<void>): Promise<void> {
  if (!browser) throw new Error("Preview browser was not started");
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.setDefaultTimeout(10_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story`);
    await check(page);
    expect(errors).toEqual([]);
  } finally {
    await page.close();
  }
}

test("standalone navigation preview completes its interactions", async () => {
  await checkStory("alexgorbatchev-shadcn-components-navigation-navigationmenu--with-icons", async (page) => {
    await page.getByRole("status", { name: "Navigation destination" }).filter({ hasText: "Settings" }).waitFor();
    expect(new URL(page.url()).hash).toBe("#navigation-settings");
  });
}, 30_000);

test("sidebar groups open their relocated component stories", async () => {
  if (!browser) throw new Error("Preview browser was not started");
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.setDefaultTimeout(10_000);
  try {
    await page.goto(`${origin}/?path=/story/alexgorbatchev-shadcn-components-layout-scrollarea--native-scrollbars`);
    const sidebar = page.getByRole("navigation", { name: "Stories" });
    const actions = sidebar.getByRole("button", { name: "actions", exact: true });
    await actions.click();
    expect(await actions.getAttribute("aria-expanded")).toBe("true");
    await sidebar.getByRole("button", { name: "Button", exact: true }).click();
    await sidebar.getByRole("link", { name: "Outline", exact: true }).click();
    await page
      .frameLocator("#storybook-preview-iframe")
      .getByRole("button", { name: "Save changes", exact: true })
      .waitFor();
  } finally {
    await page.close();
  }
}, 30_000);

test("native scrollbars preserve keyboard scrolling in both directions", async () => {
  await checkStory("alexgorbatchev-shadcn-components-layout-scrollarea--native-scrollbars", async (page) => {
    const viewport = page.getByRole("region", { name: "Native release history" });
    await page.waitForFunction(() => {
      const region = document.querySelector<HTMLElement>('[aria-label="Native release history"]');
      return region && region.scrollTop > region.clientHeight;
    });
    await viewport.evaluate((element) => element.scrollTo({ top: 0, left: 0 }));
    await viewport.press("PageDown");
    await page.waitForFunction(
      () => (document.querySelector('[aria-label="Native release history"]')?.scrollTop ?? 0) > 0,
    );
    await viewport.press("ArrowRight");
    await page.waitForFunction(
      () => (document.querySelector('[aria-label="Native release history"]')?.scrollLeft ?? 0) > 0,
    );
    expect(await viewport.evaluate((element) => element === document.activeElement)).toBe(true);
  });
}, 30_000);

test("standalone native thread renders and accepts its composer draft", async () => {
  await checkStory(
    "alexgorbatchev-shadcn-components-assistant-ui-native-conversations-thread--bottom-composer",
    async (page) => {
      const input = page.getByRole("textbox", { name: "Message input" });
      await input.waitFor();
      await page.waitForFunction(() => document.querySelector("textarea")?.value === "Keep the composer docked");
      expect(await input.inputValue()).toBe("Keep the composer docked");
      await page.getByRole("button", { name: "Send Message" }).click();
      await page.getByText("Ready to help.", { exact: true }).waitFor();
    },
  );
}, 30_000);

test("standalone audio preview plays and pauses after browser input", async () => {
  await checkStory(
    "alexgorbatchev-shadcn-components-assistant-ui-elements-media-voice-audioplayer--playback",
    async (page) => {
      await page.getByRole("button", { name: "Play Narration" }).click();
      await page.getByRole("button", { name: "Pause Narration" }).click();
      await page.getByRole("button", { name: "Play Narration" }).waitFor();
    },
  );
}, 30_000);

test("standalone voice orb preview renders its accessible GPU surface", async () => {
  await checkStory(
    "alexgorbatchev-shadcn-components-assistant-ui-elements-media-voice-voiceorb--default",
    async (page) => {
      await page.getByRole("img", { name: "Voice activity: idle" }).waitFor();
    },
  );
}, 30_000);
