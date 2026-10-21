import { Kbd } from "../../Kbd.js";
import type { JSX } from "react";
import { type ComponentProps } from "react";
import { Button } from "../../Button.js";
export function ComposerMenuItem({
  active = false,
  shortcut,
  children,
  ...props
}: IComposerMenuItemProps): JSX.Element {
  return (
    <Button
      data-testid="ComposerMenuItem"
      type="button"
      data-slot="composer-menu-item"
      data-active={active || undefined}
      aria-current={active || undefined}
      variant="ghost"
      align="start"
      fullWidth
      {...props}
    >
      {children}
      {shortcut && <Kbd aria-hidden="true">{shortcut}</Kbd>}
    </Button>
  );
}
interface IComposerMenuItemProps extends Omit<ComponentProps<"button">, "className" | "style"> {
  active?: boolean;
  shortcut?: string;
}
