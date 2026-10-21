import { useState, type ComponentProps, type JSX } from "react";
import { ArrowUpIcon } from "lucide-react";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "../../InputGroup.js";
import { paper } from "./constants.js";
import { cn } from "../../../utils/cn.js";
interface IEmptyStateComposerProps extends Omit<ComponentProps<"form">, "children" | "onSubmit" | "defaultValue"> {
  placeholder: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSend?: (value: string) => void;
}
export function EmptyStateComposer({
  placeholder,
  value,
  defaultValue = "",
  onValueChange,
  onSend,
  className,
  ...props
}: IEmptyStateComposerProps): JSX.Element {
  const [draft, setDraft] = useState(defaultValue);
  const currentValue = value ?? draft;
  const isReadOnly = value !== undefined && onValueChange === undefined;
  const canSend = onSend !== undefined && currentValue.trim().length > 0;
  return (
    <form
      data-testid="EmptyStateComposer"
      data-slot="empty-state-composer"
      className={cn(cn(paper, "flex w-full items-center gap-1 rounded-md p-2"), className)}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSend || onSend === undefined) return;
        onSend(currentValue);
        if (value === undefined) {
          setDraft("");
          onValueChange?.("");
        }
      }}
      {...props}
    >
      <InputGroup>
        <InputGroupInput
          aria-label="Message"
          placeholder={placeholder}
          value={currentValue}
          readOnly={isReadOnly}
          onChange={(event) => {
            const next = event.target.value;
            if (value === undefined) setDraft(next);
            onValueChange?.(next);
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" variant="default" aria-label="Send" disabled={!canSend} size="icon-sm">
            <ArrowUpIcon aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
