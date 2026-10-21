import type { ComponentProps, ReactElement } from "react";
import { ChevronDownIcon } from "lucide-react";
import { PopoverTrigger } from "../../Popover.js";
import { cn } from "../../../utils/cn.js";
import { useModelSelectorContext } from "../hooks/useModelSelectorContext.js";
import { ModelSelectorValue } from "./ModelSelectorValue.js";
export interface IModelSelectorTriggerProps extends Omit<ComponentProps<"button">, "className" | "style"> {
  variant?: "outline" | "ghost" | "muted";
  size?: "default" | "sm" | "lg";
}
export function ModelSelectorTrigger({
  variant = "outline",
  size = "default",
  children,
  onKeyDown,
  ...props
}: IModelSelectorTriggerProps): ReactElement {
  const { setOpen } = useModelSelectorContext();
  return (
    <PopoverTrigger
      render={
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          data-slot="model-selector-trigger"
          className={cn(
            "inline-flex w-fit items-center justify-between gap-1.5 overflow-hidden rounded-sm text-sm whitespace-nowrap outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            size === "sm"
              ? "h-control-sm px-control-x"
              : size === "lg"
                ? "h-control-lg px-control-x"
                : "h-control px-control-x",
            variant === "outline"
              ? "border border-frame-edge bg-transparent hover:bg-muted"
              : variant === "muted"
                ? "bg-secondary text-secondary-foreground hover:bg-muted"
                : "hover:bg-muted",
          )}
        />
      }
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
        }
      }}
      {...props}
    >
      {children ?? <ModelSelectorValue />}
      <ChevronDownIcon aria-hidden="true" />
    </PopoverTrigger>
  );
}
