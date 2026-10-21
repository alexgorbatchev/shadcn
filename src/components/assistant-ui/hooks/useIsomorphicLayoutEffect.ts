import { useEffect, useLayoutEffect, type DependencyList, type EffectCallback } from "react";

const useCommitEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useIsomorphicLayoutEffect(effect: EffectCallback, dependencies?: DependencyList): void {
  useCommitEffect(effect, dependencies);
}
