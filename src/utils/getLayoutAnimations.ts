/** Finite animations affecting marked boundaries, including animated ancestors. */
export function getLayoutAnimations(root: Document | Element): Animation[] {
  const document = root.ownerDocument ?? (root as Document);
  const view = document.defaultView;
  if (!view) return [];
  const boundaries = [...root.querySelectorAll("[data-layout-boundary]")];
  if (root instanceof view.Element && root.hasAttribute("data-layout-boundary")) boundaries.push(root);
  return document.getAnimations().filter((animation) => {
    if (animation.playState !== "running" || animation.effect?.getComputedTiming().iterations === Infinity)
      return false;
    const target = animation.effect instanceof view.KeyframeEffect ? animation.effect.target : null;
    return (
      target instanceof view.Element &&
      boundaries.some((boundary) => boundary.contains(target) || target.contains(boundary))
    );
  });
}
