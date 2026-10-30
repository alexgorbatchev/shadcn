import type { ComponentProps, FormEventHandler, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
import { Alert, AlertDescription } from "./Alert.js";
import { Button } from "./Button.js";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog.js";
import { ScrollArea } from "./ScrollArea.js";

interface IFormDialogProps extends IDensityProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  size?: ComponentProps<typeof DialogContent>["size"];
  isBusy?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  submitLabel?: string;
  submitVariant?: ComponentProps<typeof Button>["variant"];
  submitDisabled?: boolean;
  primaryAction?: ReactNode;
  cancelLabel?: string;
  error?: ReactNode;
  children: ReactNode;
}

/** Controlled dialog layout; the caller owns submission, validation, and pending state. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  size,
  density,
  isBusy = false,
  onSubmit,
  submitLabel,
  submitVariant,
  submitDisabled = false,
  primaryAction,
  cancelLabel = "Cancel",
  error,
  children,
}: IFormDialogProps): ReactElement {
  const body = (
    <>
      <ScrollArea density={density}>
        {children}
        {error && (
          <Alert variant="destructive" density={density}>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </ScrollArea>
      <DialogFooter density={density}>
        <DialogClose render={<Button variant="outline" density={density} disabled={isBusy} />}>
          {cancelLabel}
        </DialogClose>
        {primaryAction ??
          (submitLabel && (
            <Button type="submit" variant={submitVariant} density={density} disabled={isBusy || submitDisabled}>
              {submitLabel}
            </Button>
          ))}
      </DialogFooter>
    </>
  );
  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        if (isBusy) details.cancel();
        else onOpenChange(next);
      }}
    >
      <DialogContent data-testid="FormDialog" size={size} density={density} showCloseButton={!isBusy}>
        <DialogHeader density={density}>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {onSubmit ? (
          <form
            className="flex min-h-0 flex-col gap-panel"
            onSubmit={(event) => {
              if (isBusy) event.preventDefault();
              else onSubmit(event);
            }}
          >
            {body}
          </form>
        ) : (
          body
        )}
      </DialogContent>
    </Dialog>
  );
}
