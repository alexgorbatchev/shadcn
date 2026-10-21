import type { ComponentProps, ReactElement } from "react";
import { CommandItem } from "../../command/Command.js";
import { useModelSelectorContext } from "../hooks/useModelSelectorContext.js";
import type { ModelOption } from "../utils/modelSelection.js";
export interface IModelSelectorItemProps extends Omit<ComponentProps<typeof CommandItem>, "value" | "isChecked"> {
  model: ModelOption;
}
export function ModelSelectorItem({ model, children, onSelect, ...props }: IModelSelectorItemProps): ReactElement {
  const { value, setValue, setOpen } = useModelSelectorContext();
  return (
    <CommandItem
      {...props}
      data-slot="model-selector-item"
      value={model.id}
      data-checked={value === model.id}
      keywords={[model.name, ...(model.keywords ?? [])]}
      disabled={model.disabled}
      onSelect={(selectedValue) => {
        setValue(model.id);
        setOpen(false);
        onSelect?.(selectedValue);
      }}
    >
      {children ?? (
        <>
          {model.icon}
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{model.name}</span>
            {model.description && <span className="truncate text-sm text-muted-foreground">{model.description}</span>}
          </span>
        </>
      )}
    </CommandItem>
  );
}
