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

/** Observe the current document, including portals. Descendant scroll viewports remain independent. */
export function observeScrollGuards(
  ownerDocument: Document,
  reportViolation: ReportViolation = throwViolation,
): () => void {
  const view = ownerDocument.defaultView;
  if (!view) return () => {};

  let frame: number | undefined;
  let needsRefresh = true;
  let guarded: Element[] = [];
  const observed = new Set<Element>();
  const reported = new WeakSet<Element>();
  const schedule = (): void => {
    frame ??= view.requestAnimationFrame(check);
  };
  const resizeObserver = new view.ResizeObserver(schedule);

  const refresh = (): void => {
    guarded = [...ownerDocument.querySelectorAll('[data-scroll="none"]')];
    const targets = new Set(guarded.flatMap((element) => [element, ...element.querySelectorAll("*")]));
    for (const element of observed) {
      if (!targets.has(element)) {
        resizeObserver.unobserve(element);
        observed.delete(element);
      }
    }
    for (const element of targets) {
      if (!observed.has(element)) {
        resizeObserver.observe(element);
        observed.add(element);
      }
    }
    needsRefresh = false;
  };

  const check = (): void => {
    frame = undefined;
    if (needsRefresh) refresh();
    const violations: string[] = [];
    for (const element of guarded) {
      const violation = getViolation(element, view);
      if (!violation) {
        reported.delete(element);
      } else if (!reported.has(element)) {
        reported.add(element);
        violations.push(violation);
      }
    }
    if (violations.length) {
      reportViolation(
        new Error(
          `[shadcn] Scrolling is forbidden by data-scroll="none": ${violations.join("; ")}. ` +
            "Move scrolling content into a nested ScrollArea or another explicit scroll viewport.",
        ),
      );
    }
  };

  const mutations = new view.MutationObserver((records) => {
    needsRefresh ||= records.some((record) => record.type === "childList" || record.attributeName === "data-scroll");
    schedule();
  });
  mutations.observe(ownerDocument.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
  });
  view.addEventListener("resize", schedule);
  ownerDocument.addEventListener("load", schedule, true);
  ownerDocument.addEventListener("transitionend", schedule, true);
  ownerDocument.addEventListener("animationend", schedule, true);
  ownerDocument.fonts.addEventListener("loadingdone", schedule);
  schedule();

  return () => {
    mutations.disconnect();
    resizeObserver.disconnect();
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    view.removeEventListener("resize", schedule);
    ownerDocument.removeEventListener("load", schedule, true);
    ownerDocument.removeEventListener("transitionend", schedule, true);
    ownerDocument.removeEventListener("animationend", schedule, true);
    ownerDocument.fonts.removeEventListener("loadingdone", schedule);
  };
}
