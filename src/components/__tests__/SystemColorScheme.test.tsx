import { expect, onTestFinished, test } from "vitest";
import { commands } from "vitest/browser";
import "../../../.storybook/preview.css";

/** The page before any script has set `data-theme`, as a visitor sees it while the bundle loads. */
function clearTheme(): void {
  const root = document.documentElement;
  const saved = { theme: root.dataset.theme, preset: root.dataset.themePreset, scheme: root.style.colorScheme };
  delete root.dataset.theme;
  delete root.dataset.themePreset;
  root.style.colorScheme = "";
  onTestFinished(() => {
    if (saved.theme) root.dataset.theme = saved.theme;
    if (saved.preset) root.dataset.themePreset = saved.preset;
    root.style.colorScheme = saved.scheme;
  });
}

test.each([
  ["light", "#fcfcfd"],
  ["dark", "#121417"],
] as const)(
  "before data-theme is set, the page paints the %s palette of the system scheme",
  async (scheme, background) => {
    await commands.emulateColorScheme(scheme);
    onTestFinished(() => commands.emulateColorScheme(null));
    clearTheme();
    const style = getComputedStyle(document.documentElement);
    expect(style.getPropertyValue("--background").trim()).toBe(background);
    expect(style.colorScheme).toBe(scheme);
  },
);

test("data-theme overrides the system scheme", async () => {
  await commands.emulateColorScheme("light");
  onTestFinished(() => commands.emulateColorScheme(null));
  clearTheme();
  document.documentElement.dataset.theme = "dark";
  expect(getComputedStyle(document.documentElement).getPropertyValue("--background").trim()).toBe("#121417");
});
