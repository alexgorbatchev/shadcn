import { observeLayoutChanges } from "./observeLayoutChanges.js";

type ReportViolation = (error: Error) => void;

function throwViolation(error: Error): never {
  throw error;
}

function getViolation(element: Element, view: Window): string | undefined {
  if (!element.getClientRects().length) return undefined;
  const style = view.getComputedStyle(element);
  if (style.visibility !== "visible") return undefined;
  const axes: string[] = [];
  if (["auto", "scroll"].includes(style.overflowX) && element.scrollWidth > element.clientWidth) {
    axes.push(`horizontal: ${element.scrollWidth}px > ${element.clientWidth}px`);
  }
  if (["auto", "scroll"].includes(style.overflowY) && element.scrollHeight > element.clientHeight) {
    axes.push(`vertical: ${element.scrollHeight}px > ${element.clientHeight}px`);
  }
  if (!axes.length) return undefined;
  const slot = element.getAttribute("data-slot");
  const identity = element.id ? ` id="${element.id}"` : slot ? ` data-slot="${slot}"` : "";
  return `<${element.localName}${identity}> (${axes.join(", ")})`;
}

export function observeScrollGuards(
  ownerDocument: Document,
  reportViolation: ReportViolation = throwViolation,
): () => void {
  const reported = new WeakSet<Element>();
  return observeLayoutChanges(ownerDocument, '[data-scroll="none"]', (guarded) => {
    const view = ownerDocument.defaultView!;
    const violations: string[] = [];
    for (const element of guarded) {
      const violation = getViolation(element, view);
      if (!violation) reported.delete(element);
      else if (!reported.has(element)) {
        reported.add(element);
        violations.push(violation);
      }
    }
    if (violations.length)
      reportViolation(
        new Error(
          '[shadcn] Scrolling is forbidden by data-scroll="none": ' +
            violations.join("; ") +
            ". " +
            "Move scrolling content into a nested ScrollArea or another explicit scroll viewport.",
        ),
      );
  });
}
