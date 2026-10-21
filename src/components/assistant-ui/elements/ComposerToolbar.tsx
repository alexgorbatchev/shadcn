import type { JSX } from "react";
import { type ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { InputGroupAddon } from "../../InputGroup.js";
export function ComposerToolbar({ ...props }: ComposerToolbarProps): JSX.Element {
  return (
    <InputGroupAddon data-testid="ComposerToolbar" align="block-end" className={cn("justify-between")} {...props} />
  );
}
type ComposerToolbarProps = Omit<ComponentProps<"div">, "className" | "style">;
