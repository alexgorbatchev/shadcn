import { useId, useState, type ReactElement } from "react";
import { format } from "date-fns";
import type { IDensityProps } from "../../density/types.js";
import { Field, FieldLabel, FieldGroup } from "../Field.js";
import { Input } from "../Input.js";
import { Button } from "../Button.js";
import { Checkbox } from "../Checkbox.js";
import { Spinner } from "../Spinner.js";
type EventDraft = {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
};
type EventFormProps = IDensityProps & {
  label: string;
  initialValue: EventDraft;
  onSave: (value: EventDraft) => void | Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
};
function EventForm({ label, initialValue, onSave, onCancel, disabled, density }: EventFormProps): ReactElement {
  const id = useId();
  const [start, setStart] = useState(format(initialValue.start, "yyyy-MM-dd'T'HH:mm"));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      aria-label={label}
      data-density={density}
      aria-busy={pending}
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const value = {
          title: String(data.get("title")),
          start: new Date(String(data.get("start"))),
          end: new Date(String(data.get("end"))),
          allDay: data.has("allDay"),
        };
        setPending(true);
        setError("");
        try {
          await onSave(value);
        } catch (error) {
          setError(error instanceof Error ? error.message : "Unable to save the event.");
        } finally {
          setPending(false);
        }
      }}
    >
      <fieldset disabled={disabled || pending} className="min-w-0">
        <legend className="sr-only">{label}</legend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${id}-title`}>Title</FieldLabel>
            <Input id={`${id}-title`} name="title" required defaultValue={initialValue.title} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${id}-start`}>Start</FieldLabel>
              <Input
                id={`${id}-start`}
                name="start"
                type="datetime-local"
                required
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-end`}>End</FieldLabel>
              <Input
                id={`${id}-end`}
                name="end"
                type="datetime-local"
                required
                min={start}
                defaultValue={format(initialValue.end, "yyyy-MM-dd'T'HH:mm")}
              />
            </Field>
          </div>
          <Field orientation="horizontal">
            <Checkbox id={`${id}-all-day`} name="allDay" defaultChecked={initialValue.allDay} />
            <FieldLabel htmlFor={`${id}-all-day`}>All day</FieldLabel>
          </Field>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">{pending && <Spinner />}Save event</Button>
          </div>
        </FieldGroup>
      </fieldset>
    </form>
  );
}
export { EventForm };
export type { EventFormProps, EventDraft };
