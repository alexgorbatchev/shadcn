import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalyticsCallback } from "../../hooks/useAnalyticsCallback.js";
import type { ReactElement } from "react";
import type { GroupProps, PanelProps, SeparatorProps } from "react-resizable-panels";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "../../utils/cn.js";

function Resizable({ analytics, className, ...props }: GroupProps & IAnalyticsProps): ReactElement {
  const trackedOnLayoutChanged = useAnalyticsCallback(
    "Resizable",
    analytics,
    { name: "ui.commit" },
    props.onLayoutChanged,
  );

  return (
    <Group
      data-slot="resizable-panel-group"
      resizeTargetMinimumSize={{ coarse: 24, fine: 10 }}
      className={cn("size-full", className)}
      {...props}
      onLayoutChanged={trackedOnLayoutChanged}
    />
  );
}

function ResizablePanel({ style, ...props }: PanelProps): ReactElement {
  return <Panel data-slot="resizable-panel" data-scroll="none" style={{ overflow: "clip", ...style }} {...props} />;
}

type ResizableHandleProps = SeparatorProps & { withHandle?: boolean; thickness?: "default" | "strong" };

function ResizableHandle({
  withHandle,
  thickness = "default",
  className,
  children,
  ...props
}: ResizableHandleProps): ReactElement {
  const isStrong = thickness === "strong";
  return (
    <Separator
      data-slot="resizable-handle"
      data-thickness={thickness}
      className={cn(
        "group/handle relative z-10 flex items-center justify-center bg-transparent outline-none focus-visible:ring-1 focus-visible:ring-ring",
        // Keep a 24px separator box for touch-target sizing while occupying only the 1–2px hairline in layout flow
        // and clipping pointer hits to the centered 8px rail so adjacent panel scrollbars stay reachable.
        "w-6 [clip-path:inset(0_8px)] aria-[orientation=horizontal]:h-6 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:[clip-path:inset(8px_0)]",
        isStrong
          ? "-mx-[11px] aria-[orientation=horizontal]:mx-0 aria-[orientation=horizontal]:-my-[11px]"
          : "-mx-[11.5px] aria-[orientation=horizontal]:mx-0 aria-[orientation=horizontal]:-my-[11.5px]",
        "before:pointer-events-none before:absolute before:bg-border before:content-[''] group-hover/handle:before:bg-input group-data-[separator=active]/handle:before:bg-primary",
        isStrong
          ? "before:inset-y-0 before:left-1/2 before:w-0.5 before:-translate-x-1/2 aria-[orientation=horizontal]:before:inset-x-0 aria-[orientation=horizontal]:before:inset-y-auto aria-[orientation=horizontal]:before:top-1/2 aria-[orientation=horizontal]:before:left-0 aria-[orientation=horizontal]:before:h-0.5 aria-[orientation=horizontal]:before:w-full aria-[orientation=horizontal]:before:translate-x-0 aria-[orientation=horizontal]:before:-translate-y-1/2"
          : "before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 aria-[orientation=horizontal]:before:inset-x-0 aria-[orientation=horizontal]:before:inset-y-auto aria-[orientation=horizontal]:before:top-1/2 aria-[orientation=horizontal]:before:left-0 aria-[orientation=horizontal]:before:h-px aria-[orientation=horizontal]:before:w-full aria-[orientation=horizontal]:before:translate-x-0 aria-[orientation=horizontal]:before:-translate-y-1/2",
        "[&[aria-orientation=horizontal]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div
          aria-hidden="true"
          data-slot="resizable-handle-grip"
          className="relative z-10 flex h-8 w-1.5 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors group-hover/handle:border-primary group-hover/handle:bg-primary/15 group-data-[separator=active]/handle:border-primary group-data-[separator=active]/handle:bg-primary/20"
        />
      )}
      {children}
    </Separator>
  );
}

export { Resizable, Resizable as ResizablePanelGroup, ResizablePanel, ResizableHandle };
