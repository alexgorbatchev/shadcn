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
  await checkStory("shadcn-alexgorbatchev-components-navigationmenu--with-icons", async (page) => {
    await page.getByRole("status", { name: "Navigation destination" }).filter({ hasText: "Settings" }).waitFor();
    expect(new URL(page.url()).hash).toBe("#navigation-settings");
  });
}, 30_000);

test("standalone native thread renders and accepts its composer draft", async () => {
  await checkStory("shadcn-alexgorbatchev-assistant-ui-native-thread--bottom-composer", async (page) => {
    const input = page.getByRole("textbox", { name: "Message input" });
    await input.waitFor();
    await page.waitForFunction(() => document.querySelector("textarea")?.value === "Keep the composer docked");
    expect(await input.inputValue()).toBe("Keep the composer docked");
    await page.getByRole("button", { name: "Send message" }).click();
    await page.getByText("Ready to help.", { exact: true }).waitFor();
  });
}, 30_000);

test("standalone audio preview plays and pauses after browser input", async () => {
  await checkStory("shadcn-alexgorbatchev-assistant-ui-elements-audioplayer--playback", async (page) => {
    await page.getByRole("button", { name: "Play Narration" }).click();
    await page.getByRole("button", { name: "Pause Narration" }).click();
    await page.getByRole("button", { name: "Play Narration" }).waitFor();
  });
}, 30_000);

test("standalone voice orb preview renders its accessible GPU surface", async () => {
  await checkStory("shadcn-alexgorbatchev-assistant-ui-elements-voiceorb--default", async (page) => {
    await page.getByRole("img", { name: "Voice activity: idle" }).waitFor();
  });
}, 30_000);
