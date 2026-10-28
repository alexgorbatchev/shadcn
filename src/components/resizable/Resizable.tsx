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
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex items-center justify-center bg-border outline-none focus-visible:ring-1 focus-visible:ring-ring aria-[orientation=horizontal]:w-full [&[aria-orientation=horizontal]>div]:rotate-90",
        thickness === "strong"
          ? "w-0.5 aria-[orientation=horizontal]:h-0.5"
          : "w-px aria-[orientation=horizontal]:h-px",
        className,
      )}
      {...props}
    >
      {withHandle && <div aria-hidden="true" className="flex h-control-sm w-1 shrink-0 bg-border" />}
      {children}
    </Separator>
  );
}

export { Resizable, Resizable as ResizablePanelGroup, ResizablePanel, ResizableHandle };
