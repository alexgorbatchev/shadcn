import { useStateBinding } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Dialog as DialogPrimitive } from "../../index.js";
import { DialogContent } from "../../index.js";
import { DialogDescription } from "../../index.js";
import { DialogHeader } from "../../index.js";
import { DialogTitle } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonDialog = ({ props, children }: BaseComponentProps<JsonProps<"Dialog">>) => {
  const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
  return (
    <DialogPrimitive open={open ?? false} onOpenChange={(v) => setOpen(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          {props.description && <DialogDescription>{props.description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </DialogPrimitive>
  );
};
