import type { JSX } from "react";
import { type ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { InputGroupAddon } from "../../InputGroup.js";
export function ComposerAttachments({ ...props }: ComposerAttachmentsProps): JSX.Element {
  return (
    <InputGroupAddon data-testid="ComposerAttachments" align="block-start" className={cn("flex-wrap")} {...props} />
  );
}
type ComposerAttachmentsProps = Omit<ComponentProps<"div">, "className" | "style">;
