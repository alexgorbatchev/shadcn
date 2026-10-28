import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { useModelSelectorEfforts } from "../hooks/useModelSelectorEfforts.js";
export interface IModelSelectorEffortProps extends Omit<ComponentProps<"div">, "className" | "style"> {
  label?: ReactNode;
}
export function ModelSelectorEffort({
  label = "Thinking",
  onKeyDown,
  ...props
}: IModelSelectorEffortProps): ReactElement | null {
  const { efforts, effort, setEffort } = useModelSelectorEfforts();
  if (!efforts?.length) return null;
  return (
    <div
      {...props}
      data-testid="ModelSelectorEffort"
      data-slot="model-selector-effort"
      className="flex items-center justify-between gap-2 border-t border-frame-edge px-2 py-1.5"
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Home" || event.key === "End") event.stopPropagation();
        if (event.key === "ArrowUp" || event.key === "ArrowDown")
          event.currentTarget.closest("[cmdk-root]")?.querySelector<HTMLInputElement>("[cmdk-input]")?.focus();
      }}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <RadioGroup
        value={effort ?? ""}
        onValueChange={setEffort}
        aria-label={typeof label === "string" ? label : "Reasoning effort"}
        render={<div className="flex items-center gap-0.5" />}
      >
        {efforts.map((option) => (
          <Radio.Root
            key={option.id}
            value={option.id}
            nativeButton
            render={
              <AnalyticsButton
                component="ModelSelectorEffort"
                type="button"
                className="h-control-sm rounded-sm px-control-x text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring data-checked:bg-accent data-checked:font-medium data-checked:text-accent-foreground"
              />
            }
          >
            {option.name}
          </Radio.Root>
        ))}
      </RadioGroup>
    </div>
  );
}
