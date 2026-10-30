import { useState, type ReactElement, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "./AlertDialog.js";
import { Button } from "./Button.js";
import { Alert, AlertDescription } from "./Alert.js";
import { ScrollArea } from "./ScrollArea.js";

interface IConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  renderError?: (error: unknown) => ReactNode;
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  onOpenChange,
  onConfirm,
  renderError,
}: IConfirmationDialogProps): ReactElement {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next, details) => {
        if (isPending) details.cancel();
        else {
          setError("");
          onOpenChange(next);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <ScrollArea>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={async () => {
              setPending(true);
              setError("");
              try {
                await onConfirm();
                onOpenChange(false);
              } catch (error) {
                setError(renderError ? renderError(error) : "The action could not be completed.");
              } finally {
                setPending(false);
              }
            }}
          >
            {isPending ? "Working…" : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
