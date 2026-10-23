import { getLayoutAnimations } from "./getLayoutAnimations.js";
import { collectLayoutViolations } from "./collectLayoutViolations.js";
import { observeLayoutChanges } from "./observeLayoutChanges.js";

function throwViolation(error: Error): never {
  throw error;
}

/** Observe marked boundaries, including portals, after finite animations settle. */
export function observeLayoutGuards(document: Document, report: (error: Error) => void = throwViolation): () => void {
  const pending = new WeakSet<Animation>();
  let previous = "";
  return observeLayoutChanges(document, "[data-layout-boundary]", (_elements, schedule) => {
    const animations = getLayoutAnimations(document);
    for (const animation of animations) {
      if (pending.has(animation)) continue;
      pending.add(animation);
      const settled = (): void => {
        pending.delete(animation);
        schedule();
      };
      void animation.finished.then(settled, settled);
    }
    if (animations.length) return;
    const message = collectLayoutViolations(document)
      .map((violation) => violation.message)
      .join("; ");
    const hasChanged = message !== previous;
    previous = message;
    if (message && hasChanged) report(new Error(`[shadcn] Layout containment: ${message}`));
  });
}
