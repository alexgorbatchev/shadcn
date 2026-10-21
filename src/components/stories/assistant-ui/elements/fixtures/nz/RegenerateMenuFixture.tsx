import { useState, type ComponentProps, type JSX } from "react";
import { RegenerateMenu } from "../../../../../assistant-ui/elements/RegenerateMenu.js";

export function RegenerateMenuFixture(props: ComponentProps<typeof RegenerateMenu>): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <RegenerateMenu
      {...props}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        props.onOpenChange?.(next);
      }}
    />
  );
}
