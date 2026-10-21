import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { reasoningPreviewContext } from "../utils/reasoningPreviewContext.js";
import { forwardRef, useCallback, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect.js";
import { cva, type VariantProps } from "class-variance-authority";
import { Collapsible } from "../../Collapsible.js";
const reasoningVariants = cva("aui-reasoning-root mb-4 w-full", {
  variants: {
    variant: {
      outline: "rounded-lg border px-3 py-2",
      ghost: "",
      muted: "bg-muted/50 rounded-lg px-3 py-2",
    },
  },
  defaultVariants: {
    variant: "outline",
  },
});
export type ReasoningRootProps = Omit<ComponentProps<typeof Collapsible>, "open" | "onOpenChange"> &
  VariantProps<typeof reasoningVariants> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    /**
     * Whether the reasoning is currently streaming. While `true` the
     * disclosure is held open with a bottom-pinned live preview; when
     * streaming ends it returns to `defaultOpen`, and the first manual
     * toggle takes over the open/close state permanently. The live preview
     * keeps following the newest tokens while the disclosure is open during
     * streaming, even after a manual toggle, and pauses while the reader is
     * scrolled up.
     */
    streaming?: boolean;
    /** Called right before the disclosure animates, on toggle and on streaming transitions. */
    onAnimationStart?: () => void;
  };
export const ReasoningRoot = forwardRef<HTMLDivElement, Omit<ReasoningRootProps, "ref">>(function ReasoningRoot(
  {
    variant,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    defaultOpen = false,
    streaming,
    onAnimationStart,
    children,
    className,
    ...props
  },
  ref,
) {
  const [initialOpen] = useState(defaultOpen);
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : (userOpen ?? (streaming || initialOpen));
  const isPreview = streaming === true && isOpen;
  const prevStreamingRef = useRef(streaming);
  useIsomorphicLayoutEffect(() => {
    if (prevStreamingRef.current === streaming) return;
    prevStreamingRef.current = streaming;
    // A streaming transition only animates the panel when the resting state
    // is collapsed; with `defaultOpen` the disclosure stays open across it.
    if (!isControlled && userOpen === null && !initialOpen) {
      onAnimationStart?.();
    }
  }, [streaming, isControlled, userOpen, initialOpen, onAnimationStart]);
  const handleOpenChange = useCallback(
    (open: boolean) => {
      onAnimationStart?.();
      if (!isControlled) {
        setUserOpen(open);
      }
      controlledOnOpenChange?.(open);
    },
    [onAnimationStart, isControlled, controlledOnOpenChange],
  );
  return (
    <reasoningPreviewContext.Provider value={isPreview}>
      <Collapsible
        data-testid="ReasoningRoot"
        role="group"
        aria-label="Reasoning"
        ref={ref}
        data-slot="reasoning-root"
        data-variant={variant}
        open={isOpen}
        onOpenChange={handleOpenChange}
        {...props}
        className={(state) =>
          cn(
            "group/reasoning-root [--animation-duration:200ms]",
            reasoningVariants({ variant }),
            typeof className === "function" ? className(state) : className,
          )
        }
      >
        {children}
      </Collapsible>
    </reasoningPreviewContext.Provider>
  );
});
