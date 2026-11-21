/** A control whose height differs from a sibling's on the same row. */
export interface IMismatchedControl {
  label: string;
  height: number;
  siblingLabel: string;
  siblingHeight: number;
}

// Buttons of the standard sizes: a content-sized button grows with its text and an inline one sits in a sentence, so
// neither is a sibling control of fixed height.
const controlSelector = ["xs", "sm", "default", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"]
  // Any button-like element of a standard size, including a menu or tooltip trigger rendered as a Button, whose slot
  // the trigger replaces.
  .flatMap((size) => [`button[data-size="${size}"]`, `a[data-size="${size}"]`, `[role="button"][data-size="${size}"]`])
  .join(", ");

// Heights within half a pixel are the same control size after subpixel layout.
const tolerance = 0.5;

function label(element: Element): string {
  return (element.getAttribute("aria-label") ?? element.textContent ?? "").trim().slice(0, 60) || element.tagName;
}

function isVisible(element: Element): boolean {
  // A pointer-only target hidden from assistive technology, such as a tree's disclosure, is not a sibling control.
  if (element.closest("[aria-hidden='true']")) return false;
  const box = element.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return false;
  const style = getComputedStyle(element);
  return style.visibility !== "hidden" && style.display !== "none";
}

// Two boxes share a row when each one's vertical centre lies inside the other.
function isSameRow(first: DOMRect, second: DOMRect): boolean {
  const firstCentre = first.top + first.height / 2;
  const secondCentre = second.top + second.height / 2;
  return (
    firstCentre >= second.top &&
    firstCentre <= second.bottom &&
    secondCentre >= first.top &&
    secondCentre <= first.bottom
  );
}

// The controls laid out directly in one container: its children, or a control that is the only child of a wrapper
// such as a tooltip or menu trigger. A control deeper inside another box, such as a button in an input, is that box's.
function rowControls(container: Element): Element[] {
  return [...container.children].flatMap((child) => {
    if (child.matches(controlSelector)) return [child];
    const only = child.children.length === 1 ? child.firstElementChild : null;
    return only?.matches(controlSelector) ? [only] : [];
  });
}

/**
 * Sibling controls on one row that differ in height (visual QA "sizing"): text, outline, filled and icon buttons
 * placed side by side share one height. A container marked `data-size-showcase` (a story that demonstrates every
 * size together) is exempt.
 */
export function findMismatchedSiblingHeights(root: Element): IMismatchedControl[] {
  const mismatches: IMismatchedControl[] = [];
  const containers = new Set<Element>();
  for (const control of root.querySelectorAll(controlSelector)) {
    if (control.parentElement) containers.add(control.parentElement);
    if (control.parentElement?.parentElement) containers.add(control.parentElement.parentElement);
  }
  for (const container of containers) {
    if (container.closest("[data-size-showcase]")) continue;
    const controls = rowControls(container).filter(isVisible);
    for (let index = 1; index < controls.length; index++) {
      const previous = controls[index - 1];
      const current = controls[index];
      if (!previous || !current) continue;
      const first = previous.getBoundingClientRect();
      const second = current.getBoundingClientRect();
      if (!isSameRow(first, second) || Math.abs(first.height - second.height) <= tolerance) continue;
      mismatches.push({
        label: label(current),
        height: second.height,
        siblingLabel: label(previous),
        siblingHeight: first.height,
      });
    }
  }
  return mismatches;
}
