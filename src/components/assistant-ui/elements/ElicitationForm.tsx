import { useId, type ComponentProps, type JSX } from "react";
import { CheckIcon, PlugIcon, XIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { Input } from "../../Input.js";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../../Field.js";
import { RadioGroup, RadioGroupItem } from "../../RadioGroup.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../Card.js";
import { Switch } from "../../Switch.js";
import { useReceiptFocus } from "../hooks/useReceiptFocus.js";
import { cn } from "../../../utils/cn.js";
export type ElicitationState = "request" | "accepted" | "declined";
export interface IElicitationField {
  name: string;
  label: string;
  value: string;
  kind: "text" | "choice" | "toggle";
  options?: readonly string[];
  required?: boolean;
}
interface IElicitationFormProps extends Omit<ComponentProps<"div">, "children" | "className" | "style"> {
  server: string;
  message: string;
  fields: readonly IElicitationField[];
  state: ElicitationState;
  onFieldChange?: (name: string, value: string) => void;
  onAccept?: () => void;
  onDecline?: () => void;
}
export function ElicitationForm({
  server,
  message,
  fields,
  state,
  onFieldChange,
  onAccept,
  onDecline,
  ...props
}: IElicitationFormProps): JSX.Element {
  const prefix = useId();
  const { receiptRef, focusHandlers } = useReceiptFocus(props);
  const interactive = state === "request" && onFieldChange !== undefined;
  const missingRequired = fields.some((item) => item.kind !== "toggle" && item.required === true && !item.value.trim());
  return (
    <Card data-testid="ElicitationForm" className="w-full max-w-sm" {...props} {...focusHandlers}>
      <CardHeader>
        <CardTitle className="flex items-center gap-control-gap">
          <PlugIcon aria-hidden="true" className="size-4" />
          {server}
        </CardTitle>
        <CardDescription>needs input · {message}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {fields.map((item, index) => {
            const inputId = `${prefix}-${index}`;
            if (item.kind === "choice")
              return (
                <FieldSet key={item.name}>
                  <FieldLegend variant="label">
                    {item.label}
                    {item.required ? " *" : ""}
                  </FieldLegend>
                  <RadioGroup
                    aria-label={item.label}
                    name={`${prefix}-${item.name}`}
                    value={item.value}
                    disabled={!interactive}
                    required={item.required}
                    onValueChange={(value) => {
                      if (typeof value === "string") onFieldChange?.(item.name, value);
                    }}
                  >
                    {item.options?.map((option, optionIndex) => (
                      <Field key={option} orientation="horizontal">
                        <RadioGroupItem id={`${inputId}-${optionIndex}`} value={option} />
                        <FieldLabel htmlFor={`${inputId}-${optionIndex}`}>{option}</FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                </FieldSet>
              );
            return (
              <Field key={item.name}>
                <FieldLabel htmlFor={inputId}>
                  {item.label}
                  {item.required ? " *" : ""}
                </FieldLabel>
                {item.kind === "toggle" ? (
                  <Switch
                    id={inputId}
                    checked={item.value === "true"}
                    disabled={!interactive}
                    onCheckedChange={(checked) => onFieldChange?.(item.name, String(checked))}
                  />
                ) : (
                  <Input
                    id={inputId}
                    value={item.value}
                    required={item.required}
                    readOnly={!interactive}
                    onChange={(event) => onFieldChange?.(item.name, event.currentTarget.value)}
                  />
                )}
              </Field>
            );
          })}
        </FieldGroup>
      </CardContent>
      <CardFooter className="justify-end gap-control-gap">
        {state === "request" ? (
          <>
            <Button variant="ghost" onClick={onDecline} disabled={!onDecline}>
              Decline
            </Button>
            <Button variant="default" onClick={onAccept} disabled={missingRequired || !onAccept}>
              Send
            </Button>
          </>
        ) : (
          <span
            ref={receiptRef}
            role="status"
            tabIndex={-1}
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            {state === "accepted" ? (
              <CheckIcon aria-hidden="true" className={cn("size-4")} />
            ) : (
              <XIcon aria-hidden="true" className={cn("size-4")} />
            )}
            {state === "accepted" ? `Sent to ${server}` : "Declined"}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
