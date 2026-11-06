import { useState, type PropsWithChildren, type ReactElement } from "react";
import { Button } from "../../Button";
import { FormDialog } from "../../FormDialog";

export function FormDialogFocusFixture({ children }: PropsWithChildren): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Manage item</Button>
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Manage item" description="Review or rename the item.">
        {children}
      </FormDialog>
    </>
  );
}
