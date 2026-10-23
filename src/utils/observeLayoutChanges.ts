/** Batch document, portal, font and geometry changes into animation-frame checks. */
export function observeLayoutChanges(
  ownerDocument: Document,
  selector: string,
  checkLayout: (elements: Element[], schedule: () => void) => void,
): () => void {
  const view = ownerDocument.defaultView;
  if (!view) return () => {};

  let isConnected = true;
  let frame: number | undefined;
  let needsRefresh = true;
  let guarded: Element[] = [];
  const observed = new Set<Element>();
  const schedule = (): void => {
    if (!isConnected) return;
    frame ??= view.requestAnimationFrame(check);
  };
  const resizeObserver = new view.ResizeObserver(schedule);

  const refresh = (): void => {
    guarded = [...ownerDocument.querySelectorAll(selector)];
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
    checkLayout(guarded, schedule);
  };

  const mutations = new view.MutationObserver((records) => {
    needsRefresh ||= records.some((record) => record.type === "childList" || record.type === "attributes");
    schedule();
  });
  mutations.observe(ownerDocument.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
  });
  view.addEventListener("resize", schedule);
  ownerDocument.addEventListener("scroll", schedule, true);
  ownerDocument.addEventListener("load", schedule, true);
  ownerDocument.addEventListener("transitionend", schedule, true);
  ownerDocument.addEventListener("animationend", schedule, true);
  ownerDocument.fonts.addEventListener("loadingdone", schedule);
  schedule();

  return () => {
    isConnected = false;
    mutations.disconnect();
    resizeObserver.disconnect();
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    view.removeEventListener("resize", schedule);
    ownerDocument.removeEventListener("scroll", schedule, true);
    ownerDocument.removeEventListener("load", schedule, true);
    ownerDocument.removeEventListener("transitionend", schedule, true);
    ownerDocument.removeEventListener("animationend", schedule, true);
    ownerDocument.fonts.removeEventListener("loadingdone", schedule);
  };
}
