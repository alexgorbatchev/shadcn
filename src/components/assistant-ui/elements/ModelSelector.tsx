import type { ReactElement } from "react";
import { ModelSelectorRoot, type IModelSelectorRootProps } from "./ModelSelectorRoot.js";
import { ModelSelectorTrigger, type IModelSelectorTriggerProps } from "./ModelSelectorTrigger.js";
import { ModelSelectorContent, type IModelSelectorContentProps } from "./ModelSelectorContent.js";
export interface IModelSelectorProps
  extends Omit<IModelSelectorRootProps, "children">, Pick<IModelSelectorTriggerProps, "variant" | "size"> {
  searchable?: boolean;
  align?: IModelSelectorContentProps["align"];
}
export function ModelSelector({
  searchable = false,
  variant,
  size,
  align,
  ...props
}: IModelSelectorProps): ReactElement {
  return (
    <ModelSelectorRoot {...props}>
      <ModelSelectorTrigger variant={variant} size={size} />
      <ModelSelectorContent align={align} searchable={searchable} />
    </ModelSelectorRoot>
  );
}
