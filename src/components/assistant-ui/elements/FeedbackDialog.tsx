import { useId, type ComponentProps, type JSX } from "react";
import { CheckIcon, ThumbsDownIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../Card.js";
import { Field, FieldLabel } from "../../Field.js";
import { Textarea } from "../../Textarea.js";
import { ToggleGroup, ToggleGroupItem } from "../../ToggleGroup.js";

export function FeedbackDialog({
  reasons,
  selected,
  note,
  sent,
  onToggleReason,
  onNoteChange,
  onSubmit,
  ...props
}: IFeedbackDialogProps): JSX.Element {
  const noteId = useId();
  return (
    <Card data-testid="FeedbackDialog" className="w-full max-w-sm" {...props}>
      {/* Keep the live region mounted so assistive technology announces completion. */}
      <div role="status" className={sent ? "flex items-center gap-control-gap px-panel" : "sr-only"}>
        {sent && (
          <>
            <CheckIcon aria-hidden="true" className="size-4 text-success" />
            Thanks. That helps us tune the model.
          </>
        )}
      </div>
      {!sent && (
        <>
          <CardHeader>
            <CardTitle className="flex items-center gap-control-gap">
              <ThumbsDownIcon aria-hidden="true" className="size-4" />
              What went wrong?
            </CardTitle>
            <CardDescription>Optional</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-field-gap">
            <ToggleGroup
              multiple
              value={[...selected]}
              disabled={!onToggleReason}
              aria-label="Feedback reasons"
              variant="outline"
              className="flex-wrap"
              onValueChange={(next: string[]) => {
                for (const reason of reasons) {
                  if (next.includes(reason) !== selected.includes(reason)) onToggleReason?.(reason);
                }
              }}
            >
              {reasons.map((reason) => (
                <ToggleGroupItem key={reason} value={reason}>
                  {reason}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Field>
              <FieldLabel htmlFor={noteId}>Anything else?</FieldLabel>
              <Textarea
                id={noteId}
                value={note}
                readOnly={!onNoteChange}
                onChange={(event) => onNoteChange?.(event.target.value)}
                rows={2}
              />
            </Field>
          </CardContent>
          {onSubmit && (
            <CardFooter className="justify-end">
              <Button onClick={onSubmit}>Send feedback</Button>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
}

interface IFeedbackDialogProps extends Omit<ComponentProps<"div">, "children" | "className" | "style" | "onSubmit"> {
  reasons: readonly string[];
  selected: readonly string[];
  note: string;
  sent: boolean;
  onToggleReason?: (reason: string) => void;
  onNoteChange?: (note: string) => void;
  onSubmit?: () => void;
}
