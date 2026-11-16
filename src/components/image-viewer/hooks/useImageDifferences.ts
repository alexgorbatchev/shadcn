import { useEffect, useRef, useState, type RefObject } from "react";
import { describeImageReadError, getImageReadFailure, measureImageDifferences } from "../measureImageDifferences.js";
import type { ImageDifferenceState } from "../types.js";

interface IUseImageDifferencesOptions {
  /** Identifies the image pair; results are cached per pair for the component's lifetime. */
  pairKey: string;
  /** Compute differences once this becomes true for a pair. */
  enabled: boolean;
  /** Both images have loaded. */
  loaded: boolean;
  /** Why an image failed to load, which makes its pixels unavailable. */
  loadFailure?: string;
  beforeRef: RefObject<HTMLImageElement | null>;
  afterRef: RefObject<HTMLImageElement | null>;
}

type DifferenceEntries = ReadonlyMap<string, ImageDifferenceState>;

function withEntry(
  entries: DifferenceEntries,
  key: string,
  state: ImageDifferenceState | undefined,
): DifferenceEntries {
  const next = new Map(entries);
  if (state) next.set(key, state);
  else next.delete(key);
  return next;
}

/**
 * Probes pixel readability once both images load, then measures differences the first time highlighting is enabled
 * for an image pair. Pending work is cancelled when the pair changes or the component unmounts.
 */
export function useImageDifferences({
  pairKey,
  enabled,
  loaded,
  loadFailure,
  beforeRef,
  afterRef,
}: IUseImageDifferencesOptions): ImageDifferenceState {
  const [entries, setEntries] = useState<DifferenceEntries>(() => new Map());
  const startedRef = useRef(new Set<string>());
  const controllerRef = useRef<AbortController>(undefined);

  useEffect(() => () => controllerRef.current?.abort(), [pairKey]);

  useEffect(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!loaded || !before || !after) return undefined;
    let isCurrent = true;
    void Promise.all([getImageReadFailure(before), getImageReadFailure(after)]).then((failures) => {
      const reason = failures.find((failure) => failure !== undefined);
      if (isCurrent && reason) setEntries((current) => withEntry(current, pairKey, { status: "unavailable", reason }));
    });
    return () => {
      isCurrent = false;
    };
  }, [afterRef, beforeRef, loaded, pairKey]);

  useEffect(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!enabled || !loaded || !before || !after || startedRef.current.has(pairKey)) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    startedRef.current.add(pairKey);
    setEntries((current) => withEntry(current, pairKey, { status: "measuring" }));
    measureImageDifferences(before, after, { signal: controller.signal }).then(
      (diff) => setEntries((current) => withEntry(current, pairKey, { status: "ready", diff })),
      (error: unknown) => {
        const reason = describeImageReadError(error);
        // A cancelled measurement can restart when the pair returns.
        if (!reason) startedRef.current.delete(pairKey);
        setEntries((current) => withEntry(current, pairKey, reason ? { status: "unavailable", reason } : undefined));
      },
    );
  }, [afterRef, beforeRef, enabled, loaded, pairKey]);

  if (loadFailure) return { status: "unavailable", reason: loadFailure };
  return entries.get(pairKey) ?? { status: "idle" };
}
