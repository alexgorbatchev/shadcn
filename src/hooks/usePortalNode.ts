import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useRef, type Ref, type RefCallback, type RefObject } from "react";

export interface IPortalNode {
  /** Attaches to the Base UI portal element, together with the consumer's own ref. */
  ref: RefCallback<HTMLDivElement> | null;
  /** The portal element. Popups opened inside the portaled content portal into it. */
  node: RefObject<HTMLDivElement | null>;
}

/**
 * Tracks a popup's portal element. A provided container applies to the outermost popup only: popups opened inside it
 * portal into its portal element, where Base UI nests them without a container and where a modal popup counts them as
 * inside it. Placed beside a modal popup instead, a popup that is already mounted when it opens is hidden from
 * assistive technology and pointer input.
 */
export function usePortalNode(ref?: Ref<HTMLDivElement>): IPortalNode {
  const node = useRef<HTMLDivElement | null>(null);
  return { node, ref: useMergedRefs(ref, node) };
}
