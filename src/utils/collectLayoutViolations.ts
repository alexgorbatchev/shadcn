export interface ILayoutViolation {
  boundary: Element;
  element: Element;
  edge: "left" | "right" | "top" | "bottom";
  overflow: number;
  message: string;
}

function identify(element: Element): string {
  const slot = element.getAttribute("data-slot");
  const name = element.getAttribute("aria-label") ?? element.textContent?.trim().slice(0, 60);
  return `${element.localName}${element.id ? `#${element.id}` : slot ? `[data-slot="${slot}"]` : ""}${name ? ` "${name}"` : ""}`;
}

function isHidden(element: Element, view: Window): boolean {
  if (element.closest('[inert], [data-layout-exclude]:not([data-layout-exclude=""])')) return true;
  if (!element.checkVisibility({ visibilityProperty: true, opacityProperty: true })) return true;
  const style = view.getComputedStyle(element);
  return style.clip === "rect(0px, 0px, 0px, 0px)" || style.clipPath === "inset(50%)";
}

/** Checks marked boundaries in the supplied root, including the root itself.
 * data-layout-boundary="x" or "y" checks only that axis; an empty value checks both.
 * Native scroll viewports permit displacement along their scrolling axes.
 * data-layout-exclude requires a descriptive reason and excludes an intentional escape.
 */
export function collectLayoutViolations(root: Document | Element, tolerance = 1): ILayoutViolation[] {
  const document = root.nodeType === Node.DOCUMENT_NODE ? (root as Document) : root.ownerDocument!;
  const view = document.defaultView;
  if (!view) return [];
  const boundaries = [...root.querySelectorAll("[data-layout-boundary]")];
  if (root instanceof view.Element && root.hasAttribute("data-layout-boundary")) boundaries.unshift(root);
  const violations: ILayoutViolation[] = [];
  for (const boundary of boundaries) {
    if (isHidden(boundary, view)) continue;
    const bounds = boundary.getBoundingClientRect();
    const axis = boundary.getAttribute("data-layout-boundary");
    for (const element of [boundary, ...boundary.querySelectorAll("*")]) {
      if (isHidden(element, view) || element.parentElement?.closest("svg")) continue;
      let checkX = axis !== "y";
      let checkY = axis !== "x";
      const isControl = element.matches("button, a[href], input, select, textarea, [tabindex], [role=button]");
      const elementBounds = element.getBoundingClientRect();
      const limits = { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom };
      if (isControl) {
        limits.left = Math.max(limits.left, elementBounds.left);
        limits.right = Math.min(limits.right, elementBounds.right);
        limits.top = Math.max(limits.top, elementBounds.top);
        limits.bottom = Math.min(limits.bottom, elementBounds.bottom);
      }
      let ancestor = element === boundary ? null : element.parentElement;
      let hidden = false;
      while (ancestor && ancestor !== boundary) {
        if (isHidden(ancestor, view)) {
          hidden = true;
          break;
        }
        const style = view.getComputedStyle(ancestor);
        if (isControl) {
          const clip = ancestor.getBoundingClientRect();
          if (["hidden", "clip"].includes(style.overflowX)) {
            limits.left = Math.max(limits.left, clip.left);
            limits.right = Math.min(limits.right, clip.right);
          }
          if (["hidden", "clip"].includes(style.overflowY)) {
            limits.top = Math.max(limits.top, clip.top);
            limits.bottom = Math.min(limits.bottom, clip.bottom);
          }
        }
        if (["auto", "scroll"].includes(style.overflowX)) checkX = false;
        if (["auto", "scroll"].includes(style.overflowY)) checkY = false;
        ancestor = ancestor.parentElement;
      }
      if (hidden) continue;
      const rectangles = [...element.getClientRects()];
      // Text can escape a fitting element (or be silently clipped inside a button).
      const style = view.getComputedStyle(element);
      if (style.textOverflow !== "ellipsis") {
        for (const child of element.childNodes) {
          if (child.nodeType !== Node.TEXT_NODE || !child.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(child);
          rectangles.push(...range.getClientRects());
        }
      }
      for (const edge of ["left", "right", "top", "bottom"] as const) {
        if (edge === "left" || edge === "right" ? !checkX : !checkY) continue;
        const overflow = Math.max(
          0,
          ...rectangles.map((rect) =>
            edge === "left" || edge === "top" ? limits[edge] - rect[edge] : rect[edge] - limits[edge],
          ),
        );
        if (overflow <= tolerance) continue;
        violations.push({
          boundary,
          element,
          edge,
          overflow,
          message: `${identify(element)} exceeds ${identify(boundary)} ${edge} edge by ${Math.round(overflow * 100) / 100}px`,
        });
      }
    }
  }
  return violations;
}
