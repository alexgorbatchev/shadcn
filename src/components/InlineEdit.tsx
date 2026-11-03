import { useAnalytics } from "../hooks/useAnalytics.js";
import type { IAnalyticsProps } from "../analytics/types.js";
import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Input } from "./Input.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip.js";
import type { IDensityProps } from "../density/types.js";

interface IInlineEditProps extends IDensityProps, IAnalyticsProps {
  label: string;
  value: string;
  isDisabled?: boolean;
  shouldSelectOnMount?: boolean;
  hasChanges?: boolean;
  renderError?: (error: unknown) => ReactNode;
  onValueChange: (value: string) => void;
  onCommit: (value: string) => void | Promise<void>;
  onCancel: () => void;
}

/** A mounted edit session that inherits its text line's size; validation floats without moving adjacent content. */
export function InlineEdit({
  analytics,
  label,
  value,
  density,
  isDisabled = false,
  shouldSelectOnMount = true,
  hasChanges = true,
  renderError,
  onValueChange,
  onCommit,
  onCancel,
}: IInlineEditProps): ReactElement {
  const track = useAnalytics("InlineEdit", analytics);
  const triggerId = useId();
  const errorId = `${triggerId}-error`;
  const input = useRef<HTMLInputElement>(null);
  const isFinished = useRef(false);
  const shouldCancel = useRef(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  useEffect(() => {
    input.current?.focus();
    if (shouldSelectOnMount) input.current?.select();
  }, [shouldSelectOnMount]);
  const save = async (): Promise<void> => {
    if (isFinished.current || isDisabled) return;
    isFinished.current = true;
    if (!hasChanges) {
      onCancel();
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCommit(value);
      track({ name: "ui.commit" });
    } catch (error) {
      isFinished.current = false;
      setError(renderError ? renderError(error) : "Could not save this edit.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <form
      className="min-w-0"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <Tooltip open={Boolean(error)} triggerId={triggerId}>
        <TooltipTrigger
          id={triggerId}
          render={
            <Input
              analytics={false}
              ref={input}
              density={density}
              className="h-[1lh] rounded-none border-0 px-0 py-0 text-[length:inherit] leading-[inherit]"
              aria-label={label}
              aria-invalid={Boolean(error)}
              aria-errormessage={error ? errorId : undefined}
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
          }
        />
        {error && (
          <TooltipContent density={density} side="bottom" align="start">
            <p id={errorId} role="alert" className="text-destructive">
              {error}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </form>
  );
}
