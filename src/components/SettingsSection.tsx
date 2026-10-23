import type { ReactElement, ReactNode, FormEventHandler } from "react";
import type { IDensityProps } from "../density/types.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card.js";
import { FieldGroup } from "./Field.js";
import { Button } from "./Button.js";
import { Spinner } from "./Spinner.js";
type SettingsSectionProps = IDensityProps & {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  saveLabel?: string;
  pending?: boolean;
  disabled?: boolean;
  footer?: ReactNode;
  destructive?: boolean;
};
function SettingsSection({
  title,
  description,
  children,
  onSubmit,
  saveLabel = "Save changes",
  pending = false,
  disabled = false,
  footer,
  destructive = false,
  density,
}: SettingsSectionProps): ReactElement {
  return (
    <form aria-label={title} onSubmit={onSubmit} aria-busy={pending}>
      <Card density={density}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <fieldset disabled={disabled || pending} className="min-w-0 border-0 p-0">
            <legend className="sr-only">{title}</legend>
            <FieldGroup>{children}</FieldGroup>
          </fieldset>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-control-gap">
          {footer}
          <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={disabled || pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {saveLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
export { SettingsSection };
export type { SettingsSectionProps };
