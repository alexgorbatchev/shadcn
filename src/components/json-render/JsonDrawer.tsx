import { useStateBinding } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Drawer as DrawerPrimitive } from "../../index.js";
import { DrawerContent } from "../../index.js";
import { DrawerDescription } from "../../index.js";
import { DrawerHeader } from "../../index.js";
import { DrawerTitle } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonDrawer = ({ props, children }: BaseComponentProps<JsonProps<"Drawer">>) => {
  const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
  return (
    <DrawerPrimitive open={open ?? false} onOpenChange={(v) => setOpen(v)}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{props.title}</DrawerTitle>
          {props.description && <DrawerDescription>{props.description}</DrawerDescription>}
        </DrawerHeader>
        <div className="p-4">{children}</div>
      </DrawerContent>
    </DrawerPrimitive>
  );
};
