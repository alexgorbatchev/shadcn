import { useId, useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card.js";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "./Field.js";
import { Input } from "./Input.js";
import { Button } from "./Button.js";
import { Alert, AlertTitle, AlertDescription } from "./Alert.js";
import { Spinner } from "./Spinner.js";
type AuthFormMode = "sign-in" | "sign-up" | "reset-password";
type AuthFormValues = {
  email: string;
  password: string;
  name: string;
};
type AuthFormProps = IDensityProps & {
  mode?: AuthFormMode;
  onSubmit: (values: AuthFormValues) => void | Promise<void>;
  footer?: ReactNode;
  alternativeActions?: ReactNode;
  disabled?: boolean;
};
function AuthForm({
  mode = "sign-in",
  onSubmit,
  footer,
  alternativeActions,
  disabled = false,
  density,
}: AuthFormProps): ReactElement {
  const id = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const title =
    mode === "sign-up" ? "Create an account" : mode === "reset-password" ? "Reset your password" : "Sign in";
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    setPending(true);
    try {
      await onSubmit({
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
        name: String(data.get("name") ?? ""),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to submit. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <Card density={density}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {mode === "reset-password"
            ? "Enter your email to request a password reset."
            : "Enter your details to continue."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} aria-label={title} aria-busy={pending}>
          <FieldGroup>
            {mode === "sign-up" && (
              <Field>
                <FieldLabel htmlFor={id + "-name"}>Name</FieldLabel>
                <Input id={id + "-name"} name="name" autoComplete="name" required disabled={disabled || pending} />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor={id + "-email"}>Email</FieldLabel>
              <Input
                id={id + "-email"}
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={disabled || pending}
              />
            </Field>
            {mode !== "reset-password" && (
              <Field>
                <FieldLabel htmlFor={id + "-password"}>Password</FieldLabel>
                <Input
                  id={id + "-password"}
                  name="password"
                  type="password"
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  minLength={mode === "sign-up" ? 8 : undefined}
                  required
                  disabled={disabled || pending}
                />
                {mode === "sign-up" && <FieldDescription>Use at least eight characters.</FieldDescription>}
              </Field>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Request failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={disabled || pending}>
              {pending && <Spinner data-icon="inline-start" />}
              {mode === "reset-password" ? "Send reset link" : title}
            </Button>
            {alternativeActions}
          </FieldGroup>
        </form>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
export { AuthForm };
export type { AuthFormProps, AuthFormMode, AuthFormValues };
