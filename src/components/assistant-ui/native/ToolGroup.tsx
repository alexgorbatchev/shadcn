import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import type { ReactElement } from "react";
import { toolGroupVariants } from "./constants.js";
import { type ComponentProps } from "react";
import { memo, useCallback, useRef, useState, type PropsWithChildren } from "react";
import { ChevronDownIcon, LoaderIcon } from "lucide-react";
import { type VariantProps } from "class-variance-authority";
import { useScrollLock } from "@assistant-ui/react";
import { cn } from "../../../utils/cn.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../Collapsible.js";

type ToolGroupTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
  active?: boolean;
};

type ToolGroupContract = {
  startIndex: number;
  endIndex: number;
};

const ANIMATION_DURATION = 200;

export type ToolGroupRootProps = Omit<ComponentProps<typeof Collapsible>, "open" | "onOpenChange"> &
  VariantProps<typeof toolGroupVariants> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
  };
export function ToolGroupRoot({
  variant,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  children,
  ...props
}: ToolGroupRootProps): ReactElement {
  const collapsibleRef = useRef<HTMLDivElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const lockScroll = useScrollLock(collapsibleRef, ANIMATION_DURATION);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const handleOpenChange = useCallback(
    (open: boolean) => {
      lockScroll();
      if (!isControlled) {
        setUncontrolledOpen(open);
      }
      controlledOnOpenChange?.(open);
    },
    [lockScroll, isControlled, controlledOnOpenChange],
  );
  return (
    <Collapsible
      data-testid="ToolGroupRoot"
      ref={collapsibleRef}
      data-slot="tool-group-root"
      data-variant={variant ?? "outline"}
      open={isOpen}
      onOpenChange={handleOpenChange}
      {...props}
      render={
        <div
          className={cn(cn(toolGroupVariants({ variant }), "group/tool-group-root"), "[--animation-duration:200ms]")}
        />
      }
    >
      {children}
    </Collapsible>
  );
}
export function ToolGroupTrigger({ count, active = false, ...props }: ToolGroupTriggerProps): ReactElement {
  const label = `${count} tool ${count === 1 ? "call" : "calls"}`;
  return (
    <CollapsibleTrigger
      data-testid="ToolGroupTrigger"
      data-slot="tool-group-trigger"
      {...props}
      render={
        <AnalyticsButton
          component="ToolGroupTrigger"
          className={cn(
            "aui-tool-group-trigger group/trigger flex origin-left items-center gap-2 text-sm transition-colors ",
            "group-data-[variant=ghost]/tool-group-root:text-muted-foreground group-data-[variant=ghost]/tool-group-root:hover:text-foreground group-data-[variant=ghost]/tool-group-root:py-1.5",
            "group-data-[variant=outline]/tool-group-root:w-full group-data-[variant=outline]/tool-group-root:px-4",
            "group-data-[variant=muted]/tool-group-root:w-full group-data-[variant=muted]/tool-group-root:px-4",
          )}
        />
      }
    >
      {active && (
        <LoaderIcon aria-hidden="true" className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none" />
      )}
      <span
        data-slot="tool-group-trigger-label"
        className={cn(
          "aui-tool-group-trigger-label-wrapper inline-block text-start text-sm leading-none font-medium",
          "group-data-[variant=ghost]/tool-group-root:font-normal",
          "group-data-[variant=outline]/tool-group-root:grow",
          "group-data-[variant=muted]/tool-group-root:grow",
          active && "shimmer motion-reduce:animate-none",
        )}
      >
        {label}
      </span>
      <ChevronDownIcon
        aria-hidden="true"
        className="size-3.5 shrink-0 transition-transform group-data-open:rotate-180 motion-reduce:transition-none"
      />
    </CollapsibleTrigger>
  );
}
export function ToolGroupContent({ children, ...props }: ComponentProps<typeof CollapsibleContent>): ReactElement {
  return (
    <CollapsibleContent
      data-testid="ToolGroupContent"
      data-slot="tool-group-content"
      {...props}
      render={
        <div
          className={cn(
            "aui-tool-group-content relative overflow-hidden text-sm outline-none",
            "group/collapsible-content ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none",
            "data-closed:animate-collapsible-up",
            "data-open:animate-collapsible-down",
            "data-closed:fill-mode-forwards",
            "data-closed:pointer-events-none",
            "[--tw-duration:var(--animation-duration)]",
          )}
        />
      }
    >
      <div
        className={cn(
          "mt-2 flex flex-col gap-2",
          "group-data-[variant=ghost]/tool-group-root:mt-1 group-data-[variant=ghost]/tool-group-root:gap-1",
          "group-data-[variant=outline]/tool-group-root:mt-3 group-data-[variant=outline]/tool-group-root:border-t group-data-[variant=outline]/tool-group-root:px-4 group-data-[variant=outline]/tool-group-root:pt-3",
          "group-data-[variant=muted]/tool-group-root:mt-3 group-data-[variant=muted]/tool-group-root:border-t group-data-[variant=muted]/tool-group-root:px-4 group-data-[variant=muted]/tool-group-root:pt-3",
          "group-data-open/collapsible-content:animate-in group-data-open/collapsible-content:fade-in-0 group-data-open/collapsible-content:slide-in-from-top-1 motion-reduce:animate-none",
        )}
      >
        {children}
      </div>
    </CollapsibleContent>
  );
}

/**
 * @deprecated This wrapper targets the legacy `components.ToolGroup` prop
 * on `<MessagePrimitive.Parts>`. Use `<MessagePrimitive.GroupedParts>` with
 * a `groupBy` returning `"group-tool"` and compose `ToolGroupRoot` /
 * `ToolGroupTrigger` / `ToolGroupContent` directly. See `thread.tsx`.
 */
export const ToolGroup = Object.assign(
  memo(function ToolGroup({ children, startIndex, endIndex }: PropsWithChildren<ToolGroupContract>): ReactElement {
    const toolCount = endIndex - startIndex + 1;
    return (
      <ToolGroupRoot>
        <ToolGroupTrigger count={toolCount} />
        <ToolGroupContent>{children}</ToolGroupContent>
      </ToolGroupRoot>
    );
  }),
  { Root: ToolGroupRoot, Trigger: ToolGroupTrigger, Content: ToolGroupContent },
);
