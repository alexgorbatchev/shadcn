import { memo, useEffect, type ReactElement } from "react";
import { useAui } from "@assistant-ui/react";
import { useModelSelectorContext } from "../hooks/useModelSelectorContext.js";
import type { IModelSelectorProps } from "../elements/ModelSelector.js";
import { ModelSelectorRoot } from "../elements/ModelSelectorRoot.js";
import { ModelSelectorTrigger } from "../elements/ModelSelectorTrigger.js";
import { ModelSelectorValue } from "../elements/ModelSelectorValue.js";
import { ModelSelectorContent } from "../elements/ModelSelectorContent.js";
import { ModelSelectorSearch } from "../elements/ModelSelectorSearch.js";
import { ModelSelectorFocusAnchor } from "../elements/ModelSelectorFocusAnchor.js";
import { ModelSelectorList } from "../elements/ModelSelectorList.js";
import { ModelSelectorEmpty } from "../elements/ModelSelectorEmpty.js";
import { ModelSelectorGroup } from "../elements/ModelSelectorGroup.js";
import { ModelSelectorSeparator } from "../elements/ModelSelectorSeparator.js";
import { ModelSelectorItem } from "../elements/ModelSelectorItem.js";
import { ModelSelectorEffort } from "../elements/ModelSelectorEffort.js";

function ModelSelectorModelContext(): null {
  const { value, effort } = useModelSelectorContext();
  const api = useAui();
  useEffect(() => {
    if (value === undefined) return undefined;
    const config = {
      config: { modelName: value, ...(effort !== undefined ? { reasoningEffort: effort } : undefined) },
    };
    return api.modelContext.register({ getModelContext: () => config });
  }, [api, value, effort]);
  return null;
}

export const ModelSelector = Object.assign(
  memo(function ModelSelector({ searchable, variant, size, align, ...rootProps }: IModelSelectorProps): ReactElement {
    return (
      <ModelSelectorRoot {...rootProps}>
        <ModelSelectorModelContext />
        <ModelSelectorTrigger variant={variant} size={size} />
        <ModelSelectorContent align={align} searchable={searchable ?? false} />
      </ModelSelectorRoot>
    );
  }),
  {
    Root: ModelSelectorRoot,
    Trigger: ModelSelectorTrigger,
    Value: ModelSelectorValue,
    Content: ModelSelectorContent,
    Search: ModelSelectorSearch,
    FocusAnchor: ModelSelectorFocusAnchor,
    List: ModelSelectorList,
    Empty: ModelSelectorEmpty,
    Group: ModelSelectorGroup,
    Separator: ModelSelectorSeparator,
    Item: ModelSelectorItem,
    Effort: ModelSelectorEffort,
  },
);
