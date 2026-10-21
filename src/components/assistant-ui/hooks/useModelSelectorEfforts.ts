import { type ModelSelectorEffortOption } from "../utils/modelSelection.js";
import { useModelSelectorContext } from "./useModelSelectorContext.js";

type UseModelSelectorEffortsResult = {
  efforts: readonly ModelSelectorEffortOption[] | undefined;
  effort: string | undefined;
  setEffort: (effort: string) => void;
};

export function useModelSelectorEfforts(): UseModelSelectorEffortsResult {
  const { efforts, effort, setEffort } = useModelSelectorContext();
  return { efforts, effort, setEffort };
}
