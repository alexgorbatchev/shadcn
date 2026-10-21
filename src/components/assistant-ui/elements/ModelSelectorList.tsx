import type { ComponentProps, ReactElement } from "react";
import { CommandList, CommandGroup } from "../../command/Command.js";
import { useModelSelectorContext } from "../hooks/useModelSelectorContext.js";
import { ModelSelectorEmpty } from "./ModelSelectorEmpty.js";
import { ModelSelectorItem } from "./ModelSelectorItem.js";
export function ModelSelectorList({ children, ...props }: ComponentProps<typeof CommandList>): ReactElement {
  const { models } = useModelSelectorContext();
  return (
    <CommandList data-slot="model-selector-list" {...props}>
      {children ?? (
        <>
          <ModelSelectorEmpty />
          <CommandGroup>
            {models.map((model) => (
              <ModelSelectorItem key={model.id} model={model} />
            ))}
          </CommandGroup>
        </>
      )}
    </CommandList>
  );
}
