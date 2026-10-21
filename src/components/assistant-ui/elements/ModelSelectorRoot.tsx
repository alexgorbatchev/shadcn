import { useMemo, type ReactElement, type ReactNode } from "react";
import { Popover } from "../../Popover.js";
import { getModelEfforts, ModelSelectorContext, resolveEffort, type ModelOption } from "../utils/modelSelection.js";
import { useControllableState } from "../hooks/useControllableState.js";
export interface IModelSelectorRootProps {
  models: readonly ModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  effort?: string;
  defaultEffort?: string;
  onEffortChange?: (effort: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}
export function ModelSelectorRoot({
  models,
  value: controlledValue,
  defaultValue,
  onValueChange,
  effort: controlledEffort,
  defaultEffort,
  onEffortChange,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children,
}: IModelSelectorRootProps): ReactElement {
  const [value, setValue] = useControllableState({
    prop: controlledValue,
    defaultProp: defaultValue ?? models[0]?.id,
    onChange: onValueChange,
  });
  const [effort, setEffort] = useControllableState({
    prop: controlledEffort,
    defaultProp: defaultEffort,
    onChange: onEffortChange,
  });
  const [open, setOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const selectedModel = models.find((model) => model.id === value);
  const efforts = getModelEfforts(selectedModel);
  const activeEffort = resolveEffort(efforts, effort);
  const context = useMemo(
    () => ({
      models,
      value,
      setValue,
      selectedModel,
      efforts,
      effort: activeEffort,
      setEffort,
      open: open ?? false,
      setOpen,
    }),
    [models, value, setValue, selectedModel, efforts, activeEffort, setEffort, open, setOpen],
  );
  return (
    <ModelSelectorContext.Provider value={context}>
      <Popover open={open ?? false} onOpenChange={setOpen}>
        {children}
      </Popover>
    </ModelSelectorContext.Provider>
  );
}
