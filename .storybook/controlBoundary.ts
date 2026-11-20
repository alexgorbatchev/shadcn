type Rgb = readonly [number, number, number];

/** WCAG 1.4.11: the visual boundary that identifies an interactive control needs 3:1 against the surface around it. */
export const minimumBoundaryContrast = 3;

// Below this a border or fill is indistinguishable from the surface, so the control has no boundary at all.
const invisibleContrast = 1.1;

const textButtonSelector = '[data-slot="button"], [data-slot="toolbar-button"], [data-slot="toolbar-link"]';

// Resolves any CSS colour, including translucent and color-mix() values, to the sRGB pixel it paints over `under`.
function paint(color: string, under: Rgb): Rgb {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("A 2D canvas context is required to measure colours.");
  context.fillStyle = `rgb(${under.join(" ")})`;
  context.fillRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
}

function luminance([red, green, blue]: Rgb): number {
  const channel = (value: number): number => {
    const srgb = value / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function contrast(first: Rgb, second: Rgb): number {
  const [lighter = 0, darker = 0] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

// The surface a control sits on: the ancestors' backgrounds, composited down to the first opaque one.
function surfaceBehind(element: Element): Rgb {
  const layers: string[] = [];
  for (let node = element.parentElement; node; node = node.parentElement) {
    const background = getComputedStyle(node).backgroundColor;
    layers.push(background);
    if (paint(background, [0, 0, 0]).join() === paint(background, [255, 255, 255]).join()) break;
  }
  return layers.reduceRight<Rgb>((under, layer) => paint(layer, under), [255, 255, 255]);
}

/** The stronger of a control's border and fill contrast against the surface behind it. */
export function boundaryContrast(element: Element): number {
  const style = getComputedStyle(element);
  const surface = surfaceBehind(element);
  // Any drawn side counts: grouped buttons drop the edge they share with a neighbour.
  const border = (["top", "right", "bottom", "left"] as const).reduce((strongest, side) => {
    const isDrawn =
      Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
      style.getPropertyValue(`border-${side}-style`) !== "none";
    if (!isDrawn) return strongest;
    return Math.max(strongest, contrast(paint(style.getPropertyValue(`border-${side}-color`), surface), surface));
  }, 1);
  const fill = contrast(paint(style.backgroundColor, surface), surface);
  return Math.max(border, fill);
}

// Visible text, as opposed to an icon with an accessible name or a visually hidden label.
function hasVisibleText(element: Element): boolean {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) return true;
  }
  return false;
}

// A borderless text action is allowed only when it is styled as a link: underlined or in the link colour.
function looksLikeLink(element: Element): boolean {
  const style = getComputedStyle(element);
  if (style.textDecorationLine.includes("underline")) return true;
  const probe = document.createElement("span");
  probe.className = "text-primary";
  element.append(probe);
  const linkColor = getComputedStyle(probe).color;
  probe.remove();
  return style.color === linkColor;
}

/**
 * Lists the labels of rendered text buttons that read as plain text: no visible border, no fill distinct from the
 * surface, and no link styling. Icon-only buttons are exempt; their icon identifies them as controls.
 */
export function findBorderlessTextButtons(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll(textButtonSelector))
    .filter((element) => element.checkVisibility({ visibilityProperty: true, opacityProperty: true }))
    .filter((element) => !element.matches("[data-disabled], :disabled"))
    .filter(hasVisibleText)
    .filter((element) => boundaryContrast(element) < invisibleContrast && !looksLikeLink(element))
    .map((element) => element.textContent?.trim() ?? "");
}
