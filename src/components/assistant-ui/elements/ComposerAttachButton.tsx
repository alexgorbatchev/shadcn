import { Button } from "../../Button.js";
import type { JSX } from "react";
import { type ComponentProps } from "react";
import { PlusIcon } from "lucide-react";
export function ComposerAttachButton({ ...props }: ComposerAttachButtonProps): JSX.Element {
  return (
    <Button
      data-testid="ComposerAttachButton"
      type="button"
      aria-label="Add attachment"
      data-slot="composer-attach"
      variant="ghost"
      {...props}
      disabled={props.disabled || !props.onClick}
      size="icon"
    >
      <PlusIcon aria-hidden="true" data-icon="inline-start" />
    </Button>
  );
}
type ComposerAttachButtonProps = Omit<ComponentProps<"button">, "children" | "className" | "style">;
