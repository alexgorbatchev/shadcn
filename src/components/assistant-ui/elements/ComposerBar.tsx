import type { JSX } from "react";
import { type ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { InputGroup } from "../../InputGroup.js";
export function ComposerBar({ dragActive = false, ...props }: IComposerBarProps): JSX.Element {
  return (
    <InputGroup
      data-testid="ComposerBar"
      data-drag-active={dragActive || undefined}
      className={cn("h-auto flex-col gap-control-gap")}
      {...props}
    />
  );
}
interface IComposerBarProps extends Omit<ComponentProps<"div">, "className" | "style"> {
  dragActive?: boolean;
}
