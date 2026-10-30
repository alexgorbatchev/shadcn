import { useId, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import type { IDensityProps } from "../../density/types.js";
import { Alert, AlertDescription, AlertTitle } from "../Alert.js";
import { Button } from "../Button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Card.js";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../Field.js";
import { Input } from "../Input.js";
import { Spinner } from "../Spinner.js";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./InputOTP.js";

type EmailCodeAuthFormStep = "email" | "code";
type EmailCodeAuthFormProps = IDensityProps & {
  /** Sends a code to the address. Rejecting keeps the email step and shows the error message. */
  onRequestCode: (email: string) => void | Promise<void>;
  /** Verifies the code for the address. Rejecting keeps the code step and shows the error message. */
  onVerifyCode: (email: string, code: string) => void | Promise<void>;
  /** Number of digits in the code. */
  codeLength?: number;
  defaultEmail?: string;
  title?: string;
  description?: ReactNode;
  footer?: ReactNode;
  /** Other sign-in methods below the email step, such as an OAuth provider link. */
  alternativeActions?: ReactNode;
  disabled?: boolean;
};

type PendingAction = "request" | "resend" | "verify";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to submit. Please try again.";
}

/** Passwordless sign-in: request a numeric code for an email address, then enter it. */
function EmailCodeAuthForm({
  onRequestCode,
  onVerifyCode,
  codeLength = 6,
  defaultEmail = "",
  title = "Sign in",
  description,
  footer,
  alternativeActions,
  disabled = false,
  density,
}: EmailCodeAuthFormProps): ReactElement {
  const id = useId();
  // Completing the code and submitting the form can both request verification in the same task.
  const isVerifyingRef = useRef(false);
  const [step, setStep] = useState<EmailCodeAuthFormStep>("email");
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [error, setError] = useState("");
  const [isResent, setIsResent] = useState(false);
  const isBusy = disabled || pending !== null;

  async function run(action: PendingAction, operation: () => void | Promise<void>): Promise<boolean> {
    setError("");
    setPending(action);
    try {
      await operation();
      return true;
    } catch (error) {
      setError(errorMessage(error));
      return false;
    } finally {
      setPending(null);
    }
  }

  async function requestCode(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const address = email.trim();
    if (await run("request", () => onRequestCode(address))) {
      setEmail(address);
      setCode("");
      setIsResent(false);
      setStep("code");
    }
  }

  async function resendCode(): Promise<void> {
    setIsResent(false);
    if (await run("resend", () => onRequestCode(email))) {
      setCode("");
      setIsResent(true);
    }
  }

  async function verifyCode(value: string): Promise<void> {
    if (isVerifyingRef.current || value.length !== codeLength) return;
    isVerifyingRef.current = true;
    setIsResent(false);
    await run("verify", () => onVerifyCode(email, value));
    isVerifyingRef.current = false;
  }

  function changeEmail(): void {
    setStep("email");
    setCode("");
    setError("");
    setIsResent(false);
  }

  const errorAlert = error && (
    <Alert variant="destructive">
      <AlertTitle>Request failed</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  return (
    <Card density={density}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {step === "email"
            ? (description ?? "Enter your email to receive a sign-in code.")
            : `We sent a code to ${email}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form onSubmit={requestCode} aria-label={title} aria-busy={pending !== null}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={id + "-email"}>Email</FieldLabel>
                <Input
                  id={id + "-email"}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isBusy}
                />
              </Field>
              {errorAlert}
              <Button type="submit" disabled={isBusy}>
                {pending === "request" && <Spinner data-icon="inline-start" />}
                Send code
              </Button>
              {alternativeActions}
            </FieldGroup>
          </form>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void verifyCode(code);
            }}
            aria-label="Verify code"
            aria-busy={pending !== null}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={id + "-code"}>Verification code</FieldLabel>
                <InputOTP
                  id={id + "-code"}
                  name="code"
                  maxLength={codeLength}
                  pattern={REGEXP_ONLY_DIGITS}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={code}
                  onChange={setCode}
                  onComplete={(value: string) => void verifyCode(value)}
                  aria-invalid={error ? true : undefined}
                  disabled={isBusy}
                >
                  <InputOTPGroup>
                    {Array.from({ length: codeLength }, (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription>Enter the {codeLength}-digit code from the email.</FieldDescription>
              </Field>
              {errorAlert}
              <FieldDescription role="status" className="empty:hidden">
                {isResent ? "A new code is on its way." : ""}
              </FieldDescription>
              <Button type="submit" disabled={isBusy || code.length !== codeLength}>
                {pending === "verify" && <Spinner data-icon="inline-start" />}
                Verify
              </Button>
              <div className="flex flex-wrap justify-between gap-control-gap">
                <Button type="button" variant="ghost" onClick={changeEmail} disabled={isBusy}>
                  Use a different email
                </Button>
                <Button type="button" variant="ghost" onClick={resendCode} disabled={isBusy}>
                  {pending === "resend" && <Spinner data-icon="inline-start" />}
                  Resend code
                </Button>
              </div>
            </FieldGroup>
          </form>
        )}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

export { EmailCodeAuthForm };
export type { EmailCodeAuthFormProps };
