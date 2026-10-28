import { useAnalytics } from "../hooks/useAnalytics.js";
import type { IAnalyticsProps } from "../analytics/types.js";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { Input } from "./Input.js";
import type { IDensityProps } from "../density/types.js";

interface IInlineEditProps extends IDensityProps, IAnalyticsProps {
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
  analytics,
  label,
  value,
  density,
  isDisabled = false,
  shouldSelectOnMount = true,
  onValueChange,
  onCommit,
  onCancel,
}: IInlineEditProps): ReactElement {
  const track = useAnalytics("InlineEdit", analytics);
  const input = useRef<HTMLInputElement>(null);
  const isFinished = useRef(false);
  const shouldCancel = useRef(false);
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
      track({ name: "ui.commit" });
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
        analytics={false}
        ref={input}
        density={density}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-description="Enter saves. Escape cancels."
        value={value}
        disabled={isDisabled || isSaving}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={() => {
          if (shouldCancel.current && !isFinished.current) {
            isFinished.current = true;
            onCancel();
          } else void save();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            shouldCancel.current = true;
            event.currentTarget.blur();
          } else if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
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
