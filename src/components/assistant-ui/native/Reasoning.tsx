import type { ReactElement } from "react";
import { type ComponentProps } from "react";
import { forwardRef, memo, useCallback, useRef } from "react";
import {
  useScrollLock,
  useAuiState,
  type ReasoningMessagePartComponent,
  type ReasoningGroupComponent,
} from "@assistant-ui/react";
import { MarkdownText } from "../elements/MarkdownText.js";
import { ReasoningRoot as ReasoningRootBase, type ReasoningRootProps } from "../elements/ReasoningRoot.js";
import { ReasoningTrigger } from "../elements/ReasoningTrigger.js";
import { ReasoningContent } from "../elements/ReasoningContent.js";
import { ReasoningText } from "../elements/ReasoningText.js";
import { ReasoningFade } from "../elements/ReasoningFade.js";
import { REASONING_ANIMATION_DURATION } from "../elements/constants.js";

export type { ReasoningRootProps } from "../elements/ReasoningRoot.js";
/** `ReasoningRoot` with the thread viewport scroll locked during disclosure animations. */
export const ReasoningRoot = forwardRef<HTMLDivElement, Omit<ReasoningRootProps, "ref">>(function ReasoningRoot(
  { onAnimationStart, ...props },
  ref,
) {
  const collapsibleRef = useRef<HTMLDivElement | null>(null);
  const lockScroll = useScrollLock(collapsibleRef, REASONING_ANIMATION_DURATION);
  const handleAnimationStart = useCallback(() => {
    lockScroll();
    onAnimationStart?.();
  }, [lockScroll, onAnimationStart]);
  const composedRef = useCallback(
    (node: HTMLDivElement | null) => {
      collapsibleRef.current = node;
      if (typeof ref === "function") {
        const setForwardedRef: (node: HTMLDivElement | null) => unknown = ref;
        const cleanup = setForwardedRef(node);
        if (typeof cleanup === "function") {
          return () => {
            collapsibleRef.current = null;
            cleanup();
          };
        }
      } else if (ref) {
        ref.current = node;
      }
      return undefined;
    },
    [ref],
  );
  return <ReasoningRootBase ref={composedRef} onAnimationStart={handleAnimationStart} {...props} />;
});
export const Reasoning = Object.assign(
  memo(function Reasoning(_props: ComponentProps<ReasoningMessagePartComponent>): ReactElement {
    return <MarkdownText />;
  }),
  {
    Root: ReasoningRoot,
    Trigger: ReasoningTrigger,
    Content: ReasoningContent,
    Text: ReasoningText,
    Fade: ReasoningFade,
  },
);
/**
 * @deprecated This wrapper targets the legacy `components.ReasoningGroup`
 * prop on `<MessagePrimitive.Parts>`. Use `<MessagePrimitive.GroupedParts>`
 * with a `groupBy` returning `"group-reasoning"` and compose `ReasoningRoot`
 * / `ReasoningTrigger` / `ReasoningContent` / `ReasoningText` directly.
 * See `thread.aui.tsx` for an example.
 */
export const ReasoningGroup = memo(function ReasoningGroup({
  children,
  startIndex,
  endIndex,
}: ComponentProps<ReasoningGroupComponent>): ReactElement {
  const isReasoningStreaming = useAuiState((s) => {
    if (s.message.status?.type !== "running") return false;
    for (let index = startIndex; index <= endIndex; index++) {
      if (s.message.parts[index]?.status.type === "running") return true;
    }
    return false;
  });
  return (
    <ReasoningRoot streaming={isReasoningStreaming}>
      <ReasoningTrigger active={isReasoningStreaming} />
      <ReasoningContent aria-busy={isReasoningStreaming}>
        <ReasoningText>{children}</ReasoningText>
      </ReasoningContent>
    </ReasoningRoot>
  );
});
ReasoningGroup.displayName = "ReasoningGroup";
