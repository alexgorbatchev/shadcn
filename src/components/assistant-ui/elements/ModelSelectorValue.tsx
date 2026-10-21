import type { ReactElement, ReactNode } from "react";
import { useModelSelectorContext } from "../hooks/useModelSelectorContext.js";
export interface IModelSelectorValueProps {
  placeholder?: ReactNode;
  showEffort?: boolean;
}
export function ModelSelectorValue({
  placeholder = "Select model",
  showEffort = true,
}: IModelSelectorValueProps): ReactElement {
  const { selectedModel, efforts, effort } = useModelSelectorContext();
  if (!selectedModel)
    return (
      <span data-testid="ModelSelectorValue" data-slot="model-selector-value" className="text-muted-foreground">
        {placeholder}
      </span>
    );
  const effortName =
    showEffort && effort !== undefined ? efforts?.find((option) => option.id === effort)?.name : undefined;
  return (
    <span
      data-testid="ModelSelectorValue"
      data-slot="model-selector-value"
      className="flex min-w-0 items-center gap-1.5"
    >
      {selectedModel.icon}
      <span className="truncate font-medium">{selectedModel.name}</span>
      {effortName && <span className="truncate text-muted-foreground">{effortName}</span>}
    </span>
  );
}
