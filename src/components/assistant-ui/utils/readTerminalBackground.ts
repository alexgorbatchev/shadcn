/** Resolves layered CSS backgrounds with the browser's native color compositor. */
export function readTerminalBackground(element: HTMLElement): string | undefined {
  const backgrounds: string[] = [];
  let current: Element | null = element;
  while (current) {
    backgrounds.push(getComputedStyle(current).backgroundColor);
    const root = current.getRootNode();
    current = current.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
  }
  const canvas = element.ownerDocument.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return undefined;
  for (const background of backgrounds.reverse()) {
    context.fillStyle = background;
    context.fillRect(0, 0, 1, 1);
  }
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  if (alpha !== 255) return undefined;
  return `rgb(${red}, ${green}, ${blue})`;
}
