export interface IMermaidThemeVariables {
  darkMode: boolean;
  fontFamily: string;
  background: string;
  primaryColor: string;
  primaryTextColor: string;
  primaryBorderColor: string;
  secondaryColor: string;
  secondaryTextColor: string;
  secondaryBorderColor: string;
  tertiaryColor: string;
  tertiaryTextColor: string;
  tertiaryBorderColor: string;
  mainBkg: string;
  nodeBorder: string;
  nodeTextColor: string;
  textColor: string;
  titleColor: string;
  lineColor: string;
  defaultLinkColor: string;
  edgeLabelBackground: string;
  clusterBkg: string;
  clusterBorder: string;
  actorBkg: string;
  actorBorder: string;
  actorTextColor: string;
  actorLineColor: string;
  signalColor: string;
  signalTextColor: string;
  labelBoxBkgColor: string;
  labelBoxBorderColor: string;
  labelTextColor: string;
  loopTextColor: string;
  noteBkgColor: string;
  noteBorderColor: string;
  noteTextColor: string;
  activationBkgColor: string;
  activationBorderColor: string;
  sequenceNumberColor: string;
  errorBkgColor: string;
  errorTextColor: string;
}

export interface IMermaidThemeConfig {
  theme: "base";
  darkMode: boolean;
  fontFamily: string;
  themeVariables: IMermaidThemeVariables;
}

interface IPalette {
  card: string;
  foreground: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  primaryForeground: string;
  fontFamily: string;
}

const DARK_FALLBACK: IPalette = {
  card: "#121417",
  foreground: "#eceff3",
  secondary: "#1c1f24",
  muted: "#282c33",
  mutedForeground: "#a3abb6",
  border: "#353b44",
  input: "#6f7783",
  primaryForeground: "#1a0014",
  fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

const LIGHT_FALLBACK: IPalette = {
  card: "#fcfcfd",
  foreground: "#0c0e11",
  secondary: "#eef0f3",
  muted: "#e0e4ea",
  mutedForeground: "#4b535e",
  border: "#c7ccd4",
  input: "#747c88",
  primaryForeground: "#ffffff",
  fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function toHexByte(channel: number): string {
  return Math.max(0, Math.min(255, Math.round(channel)))
    .toString(16)
    .padStart(2, "0");
}

function normalizeHex(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(trimmed);
  if (short) {
    const [, r, g, b] = short;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(trimmed);
  if (rgb) return `#${toHexByte(Number(rgb[1]))}${toHexByte(Number(rgb[2]))}${toHexByte(Number(rgb[3]))}`;
  return undefined;
}

/**
 * Resolves any CSS color string (including `oklch(...)` or custom properties) to `#rrggbb` so Mermaid's internal
 * color functions never fail on modern color spaces.
 */
export function resolveCssColorToHex(raw: string, fallback: string): string {
  const direct = normalizeHex(raw);
  if (direct) return direct;
  const trimmed = raw.trim();
  if (!trimmed || typeof document === "undefined") return fallback;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return fallback;
  context.fillStyle = fallback;
  context.fillRect(0, 0, 1, 1);
  context.fillStyle = trimmed;
  context.fillRect(0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  if (pixel[3] === 0) return fallback;
  return `#${toHexByte(pixel[0] ?? 0)}${toHexByte(pixel[1] ?? 0)}${toHexByte(pixel[2] ?? 0)}`;
}

function detectDarkMode(element: Element | undefined): boolean {
  const themed =
    element?.closest("[data-theme]") ?? (typeof document !== "undefined" ? document.documentElement : null);
  const attr = themed?.getAttribute("data-theme");
  if (attr === "light") return false;
  if (attr === "dark") return true;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return true;
}

/**
 * Maps the active theme tokens onto Mermaid's `base` theme variables so diagrams render on the card surface in the
 * library's font with accessible label contrast in both dark and light appearances.
 */
export function getMermaidThemeConfig(element?: Element): IMermaidThemeConfig {
  const darkMode = detectDarkMode(element);
  const fallback = darkMode ? DARK_FALLBACK : LIGHT_FALLBACK;
  const target = element ?? (typeof document !== "undefined" ? document.documentElement : undefined);
  const style = target && typeof getComputedStyle === "function" ? getComputedStyle(target) : undefined;
  const color = (token: string, defaultHex: string): string =>
    resolveCssColorToHex(style?.getPropertyValue(token) ?? "", defaultHex);

  const card = color("--card", fallback.card);
  const foreground = color("--foreground", fallback.foreground);
  const secondary = color("--secondary", fallback.secondary);
  const muted = color("--muted", fallback.muted);
  const mutedForeground = color("--muted-foreground", fallback.mutedForeground);
  const border = color("--border", fallback.border);
  const input = color("--input", fallback.input);
  const primaryForeground = color("--primary-foreground", fallback.primaryForeground);
  const fontFamily = style?.getPropertyValue("--ag-font").trim() || style?.fontFamily.trim() || fallback.fontFamily;

  return {
    theme: "base",
    darkMode,
    fontFamily,
    themeVariables: {
      darkMode,
      fontFamily,
      background: card,
      primaryColor: secondary,
      primaryTextColor: foreground,
      primaryBorderColor: input,
      secondaryColor: muted,
      secondaryTextColor: foreground,
      secondaryBorderColor: input,
      tertiaryColor: card,
      tertiaryTextColor: foreground,
      tertiaryBorderColor: border,
      mainBkg: secondary,
      nodeBorder: input,
      nodeTextColor: foreground,
      textColor: foreground,
      titleColor: foreground,
      lineColor: mutedForeground,
      defaultLinkColor: mutedForeground,
      edgeLabelBackground: card,
      clusterBkg: card,
      clusterBorder: input,
      actorBkg: secondary,
      actorBorder: input,
      actorTextColor: foreground,
      actorLineColor: input,
      signalColor: mutedForeground,
      signalTextColor: foreground,
      labelBoxBkgColor: secondary,
      labelBoxBorderColor: input,
      labelTextColor: foreground,
      loopTextColor: foreground,
      noteBkgColor: muted,
      noteBorderColor: input,
      noteTextColor: foreground,
      activationBkgColor: muted,
      activationBorderColor: mutedForeground,
      sequenceNumberColor: primaryForeground,
      errorBkgColor: muted,
      errorTextColor: foreground,
    },
  };
}
