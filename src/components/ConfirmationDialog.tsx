import { useState, type ReactElement } from "react";
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

interface IConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  onOpenChange,
  onConfirm,
}: IConfirmationDialogProps): ReactElement {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          setError("");
          onOpenChange(next);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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
                setError(error instanceof Error ? error.message : "The action could not be completed.");
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
