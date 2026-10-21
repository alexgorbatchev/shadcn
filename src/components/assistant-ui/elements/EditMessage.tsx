import { useId, type JSX, type ComponentProps } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { Card, CardContent, CardFooter } from "../../Card.js";
import { Field, FieldLabel } from "../../Field.js";
import { Textarea } from "../../Textarea.js";
import { useReceiptFocus } from "../hooks/useReceiptFocus.js";

export function EditMessage({
  value,
  discardedReplies,
  editing,
  onValueChange,
  onSave,
  onCancel,
  onStartEdit,
  onFocusCapture,
  onBlurCapture,
  ...props
}: IEditMessageProps): JSX.Element {
  const inputId = useId();
  const { receiptRef, focusHandlers } = useReceiptFocus({ onFocusCapture, onBlurCapture });
  if (!editing) {
    return (
      <div data-testid="EditMessage" className="flex w-full max-w-sm justify-end" {...props} {...focusHandlers}>
        <Button
          ref={(element) => {
            receiptRef.current = element;
          }}
          size="content"
          variant="secondary"
          disabled={!onStartEdit}
          onClick={onStartEdit}
        >
          {value}
        </Button>
      </div>
    );
  }
  return (
    <Card data-testid="EditMessage" className="w-full max-w-sm" {...props} {...focusHandlers}>
      <CardContent>
        <Field>
          <FieldLabel htmlFor={inputId}>Edit your message</FieldLabel>
          <Textarea
            ref={(element) => {
              receiptRef.current = element;
            }}
            id={inputId}
            value={value}
            readOnly={!onValueChange}
            onChange={(event) => onValueChange?.(event.target.value)}
            rows={2}
          />
        </Field>
        {discardedReplies > 0 && (
          <p className="mt-control-gap flex items-center gap-control-gap text-sm text-warning">
            <AlertTriangleIcon aria-hidden="true" className="size-4" />
            sending discards {discardedReplies} {discardedReplies === 1 ? "reply" : "replies"}
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-control-gap">
        <Button variant="outline" disabled={!onCancel} onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!onSave} onClick={onSave}>
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}

interface IEditMessageProps extends Omit<ComponentProps<"div">, "children" | "className" | "style"> {
  value: string;
  discardedReplies: number;
  editing: boolean;
  onValueChange?: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onStartEdit?: () => void;
}
