import { useEffect, useRef, useState, type ReactElement } from "react";
import { Input } from "./Input.js";
import type { IDensityProps } from "../density/types.js";

interface IInlineEditProps extends IDensityProps {
  label: string;
  value: string;
  isDisabled?: boolean;
  shouldSelectOnMount?: boolean;
  onValueChange: (value: string) => void;
  onCommit: (value: string) => void | Promise<void>;
  onCancel: () => void;
}

/** A mounted edit session. The consumer replaces its display with this field while editing. */
export function InlineEdit({
  label,
  value,
  density,
  isDisabled = false,
  shouldSelectOnMount = true,
  onValueChange,
  onCommit,
  onCancel,
}: IInlineEditProps): ReactElement {
  const input = useRef<HTMLInputElement>(null);
  const isFinished = useRef(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    input.current?.focus();
    if (shouldSelectOnMount) input.current?.select();
  }, [shouldSelectOnMount]);
  const save = async (): Promise<void> => {
    if (isFinished.current || isDisabled) return;
    isFinished.current = true;
    setSaving(true);
    setError("");
    try {
      await onCommit(value);
    } catch (error) {
      isFinished.current = false;
      setError(error instanceof Error ? error.message : "Could not save this edit.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <form
      className="flex min-w-0 flex-col gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <Input
        ref={input}
        density={density}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-description="Enter saves. Escape cancels."
        value={value}
        disabled={isDisabled || isSaving}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={() => {
          void save();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            isFinished.current = true;
            onCancel();
          }
        }}
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
