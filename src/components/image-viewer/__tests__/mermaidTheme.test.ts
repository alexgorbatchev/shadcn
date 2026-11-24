import { describe, expect, test } from "vitest";
import { getMermaidThemeConfig, resolveCssColorToHex } from "../mermaidTheme";
import "../../../../.storybook/preview.css";

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

describe("resolveCssColorToHex", () => {
  test("normalizes 3-digit, 6-digit, rgb(), and oklch() colors to lowercase hex", () => {
    expect(resolveCssColorToHex("#ABC", "#000000")).toBe("#aabbcc");
    expect(resolveCssColorToHex("#121417", "#000000")).toBe("#121417");
    expect(resolveCssColorToHex("rgb(236, 239, 243)", "#000000")).toBe("#eceff3");
    expect(resolveCssColorToHex("oklch(0.985 0 0)", "#000000")).toMatch(/^#[0-9a-f]{6}$/);
    expect(resolveCssColorToHex("", "#123456")).toBe("#123456");
  });
});

describe("getMermaidThemeConfig", () => {
  test("maps dark and light tokens onto accessible Mermaid base theme variables", () => {
    const darkHost = document.createElement("div");
    darkHost.setAttribute("data-theme", "dark");
    document.body.append(darkHost);

    const lightHost = document.createElement("div");
    lightHost.setAttribute("data-theme", "light");
    document.body.append(lightHost);

    try {
      const dark = getMermaidThemeConfig(darkHost);
      const light = getMermaidThemeConfig(lightHost);

      expect(dark.theme).toBe("base");
      expect(dark.darkMode).toBe(true);
      expect(light.darkMode).toBe(false);
      expect(dark.themeVariables.background).not.toBe(light.themeVariables.background);
      expect(dark.themeVariables.primaryTextColor).not.toBe(light.themeVariables.primaryTextColor);
      expect(dark.fontFamily).toContain("JetBrains Mono");

      for (const config of [dark, light]) {
        const { themeVariables: vars } = config;
        expect(contrastRatio(vars.textColor, vars.background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(vars.primaryTextColor, vars.primaryColor)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(vars.actorTextColor, vars.actorBkg)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(vars.noteTextColor, vars.noteBkgColor)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(vars.signalTextColor, vars.background)).toBeGreaterThanOrEqual(4.5);
      }
    } finally {
      darkHost.remove();
      lightHost.remove();
    }
  });
});
