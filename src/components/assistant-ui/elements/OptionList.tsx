import { useCallback, useState, type ComponentProps, type JSX } from "react";
import { CheckIcon } from "lucide-react";

import { Button } from "../../Button.js";
import { Spinner } from "../../Spinner.js";
import { Checkbox } from "../../Checkbox.js";
import { cn } from "../../../utils/cn.js";
import { useReceiptFocus } from "../hooks/useReceiptFocus.js";
import { clamp } from "../utils/range.js";
import { OptionText } from "./OptionText.js";
import type { IOptionListOption } from "./types.js";

interface IOptionListProps extends Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onChange" | "className" | "style"
> {
  options: readonly IOptionListOption[];
  selectionMode?: "single" | "multiple";
  defaultValue?: readonly string[];
  minSelections?: number;
  maxSelections?: number;
  onConfirm?: (ids: string[]) => void | Promise<void>;
  confirmLabel?: string;
  choice?: readonly string[];
  variant?: "surface" | "embedded";
}

export function OptionList({
  options,
  selectionMode = "single",
  defaultValue,
  minSelections = 1,
  maxSelections,
  onConfirm,
  confirmLabel = "Confirm",
  choice,
  variant = "surface",
  ref,
  ...props
}: IOptionListProps): JSX.Element {
  const isMultiple = selectionMode === "multiple";
  const [selected, setSelected] = useState<readonly string[]>(() =>
    (defaultValue ?? []).filter((id) => options.some((option) => option.id === id)),
  );
  const [pending, setPending] = useState<readonly string[] | null>(null);
  const [confirmed, setConfirmed] = useState<readonly string[] | undefined>();
  const [error, setError] = useState<string | null>(null);
  const { receiptRef, focusHandlers } = useReceiptFocus<HTMLDivElement>(props);
  const setReceiptRef = useCallback(
    (node: HTMLDivElement | null) => {
      receiptRef.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
      return undefined;
    },
    [ref, receiptRef],
  );
  const rootClassName = cn(
    "flex w-full flex-col gap-1 text-foreground",
    variant === "surface" && "max-w-sm rounded-md border border-frame-edge bg-card p-1 shadow-frame",
  );
  const confirmedChoice = choice ?? confirmed;
  const isLocked = pending !== null;
  const max = Math.floor(clamp(maxSelections ?? options.length, 0, options.length));
  const min = Math.floor(clamp(minSelections, 0, max));
  const optionIds = new Set(options.map((option) => option.id));
  const selectedIds = selected.filter((id) => optionIds.has(id));
  const canConfirm = !isLocked && selectedIds.length >= min && selectedIds.length <= max;

  async function commit(ids: string[]): Promise<void> {
    if (isLocked || !onConfirm) return;
    setPending(ids);
    setError(null);
    try {
      await onConfirm(ids);
      setConfirmed(ids);
    } catch (error) {
      setPending(null);
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  function toggle(id: string): void {
    if (isLocked) return;
    setSelected((current) => {
      const available = current.filter((value) => optionIds.has(value));
      if (available.includes(id)) return available.filter((value) => value !== id);
      return available.length < max ? [...available, id] : available;
    });
  }

  if (confirmedChoice !== undefined) {
    const chosen = options.filter((option) => confirmedChoice.includes(option.id));
    return (
      <div
        {...props}
        {...focusHandlers}
        ref={setReceiptRef}
        tabIndex={-1}
        data-testid="OptionList"
        data-slot="option-list"
        data-state="receipt"
        className={rootClassName}
      >
        {chosen.length === 0 ? (
          <span className="p-2 text-base text-muted-foreground">Nothing selected</span>
        ) : (
          chosen.map((option) => (
            <div key={option.id} className="flex items-start gap-1 p-2">
              <CheckIcon aria-hidden="true" className="size-4 text-success" />
              <span className="sr-only">Selected:</span>
              <OptionText option={option} />
            </div>
          ))
        )}
      </div>
    );
  }

  if (!onConfirm)
    return (
      <div
        {...props}
        {...focusHandlers}
        ref={ref}
        data-testid="OptionList"
        data-slot="option-list"
        className={rootClassName}
      >
        {options.map((option) => (
          <OptionText key={option.id} option={option} isPadded />
        ))}
      </div>
    );

  return (
    <div
      {...props}
      {...focusHandlers}
      ref={ref}
      role="group"
      data-testid="OptionList"
      data-slot="option-list"
      data-state={isLocked ? "pending" : "open"}
      aria-busy={isLocked || undefined}
      className={rootClassName}
    >
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        const isUnavailable =
          option.disabled === true || isLocked || (isMultiple && !isSelected && selectedIds.length >= max);
        return isMultiple ? (
          <label
            key={option.id}
            className={cn(
              "flex items-start gap-2 rounded-sm p-2 text-foreground",
              isUnavailable && "text-muted-foreground",
              isSelected && "bg-accent",
            )}
          >
            <Checkbox checked={isSelected} disabled={isUnavailable} onCheckedChange={() => toggle(option.id)} />
            <OptionText option={option} />
          </label>
        ) : (
          <Button
            key={option.id}
            variant="outline"
            size="content"
            fullWidth
            align="start"
            disabled={isUnavailable}
            onClick={() => {
              void commit([option.id]);
            }}
          >
            {pending?.includes(option.id) ? <Spinner /> : null}
            <OptionText option={option} />
          </Button>
        );
      })}
      {error ? (
        <p role="alert" className="px-2 text-base text-destructive">
          {error}
        </p>
      ) : null}
      {isMultiple ? (
        <div className="flex items-center justify-between gap-2 p-2">
          <span className="text-base text-muted-foreground tabular-nums">
            {selectedIds.length} of {max}
          </span>
          <Button
            disabled={!canConfirm}
            onClick={() => {
              void commit(options.filter((option) => selectedIds.includes(option.id)).map((option) => option.id));
            }}
          >
            {isLocked ? <Spinner /> : null}
            {confirmLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
