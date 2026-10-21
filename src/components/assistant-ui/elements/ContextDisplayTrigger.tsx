import type { ComponentProps, ReactElement } from "react";
import { PopoverTrigger } from "../../Popover.js";

type ContextDisplayTriggerProps = Omit<ComponentProps<"button">, "className" | "style">;

export function ContextDisplayTrigger(props: ContextDisplayTriggerProps): ReactElement {
  return (
    <PopoverTrigger
      openOnHover
      render={
        <button
          type="button"
          data-slot="context-display-trigger"
          className="inline-flex h-control-sm items-center gap-control-gap rounded-sm px-control-x text-sm text-muted-foreground tabular-nums outline-none hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        />
      }
      {...props}
    />
  );
}
