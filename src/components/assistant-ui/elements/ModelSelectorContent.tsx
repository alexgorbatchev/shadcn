import type { ComponentProps, ReactElement } from "react";
import { PopoverContent, PopoverTitle } from "../../Popover.js";
import { Command } from "../../command/Command.js";
import { useModelSelectorContext } from "../hooks/useModelSelectorContext.js";
import { ModelSelectorFocusAnchor } from "./ModelSelectorFocusAnchor.js";
import { ModelSelectorSearch } from "./ModelSelectorSearch.js";
import { ModelSelectorList } from "./ModelSelectorList.js";
import { ModelSelectorEffort } from "./ModelSelectorEffort.js";
export interface IModelSelectorContentProps extends Omit<ComponentProps<typeof PopoverContent>, "className" | "style"> {
  searchable?: boolean;
}
export function ModelSelectorContent({
  align = "start",
  side = "bottom",
  sideOffset = 6,
  searchable,
  children,
  ...props
}: IModelSelectorContentProps): ReactElement {
  const { value } = useModelSelectorContext();
  const isUnfiltered = searchable === false || (!searchable && children === undefined);
  return (
    <PopoverContent {...props} data-slot="model-selector-content" align={align} side={side} sideOffset={sideOffset}>
      <div className="sr-only">
        <PopoverTitle>Choose model</PopoverTitle>
      </div>
      <Command label="Model" shouldFilter={!isUnfiltered} defaultValue={value}>
        {isUnfiltered && <ModelSelectorFocusAnchor />}
        {children ?? (
          <>
            {searchable && <ModelSelectorSearch />}
            <ModelSelectorList />
            <ModelSelectorEffort />
          </>
        )}
      </Command>
    </PopoverContent>
  );
}
