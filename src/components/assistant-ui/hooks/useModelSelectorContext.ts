import { useContext } from "react";
import { ModelSelectorContext, type ModelSelectorContextValue } from "../utils/modelSelection.js";
export function useModelSelectorContext(): ModelSelectorContextValue {
  const ctx = useContext(ModelSelectorContext);
  if (!ctx) {
    throw new Error("ModelSelector sub-components must be used within ModelSelector.Root");
  }
  return ctx;
}
