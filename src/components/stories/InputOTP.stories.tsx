import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useId, useRef, useState } from "react";
import { z } from "zod";
import { DirectionProvider } from "../DirectionProvider";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../Field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Card";
import { Button } from "../Button";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../InputOTP";

type InputOTPStoryProps = Omit<ComponentProps<typeof InputOTP>, "render"> & { render?: undefined };
const meta: Meta<InputOTPStoryProps> = {
  title: "shadcn-alexgorbatchev/components/InputOTP",
  component: InputOTP,
  tags: ["autodocs", "test"],
  args: { maxLength: 6, "aria-label": "Verification code", pattern: REGEXP_ONLY_DIGITS, onComplete: fn() },
  argTypes: { density: { control: "select", options: ["compact", "comfortable"] } },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const otpFormSchema = z.string().length(6, "Enter all six digits.");

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Verification code" });
    await expect(within(canvasElement).getAllByRole("textbox")).toHaveLength(1);
    await userEvent.type(input, "a123456");
    await expect(input).toHaveValue("123456");
    await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith("123456"));
    await expect(canvasElement.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(6);
    await expect(canvasElement.querySelector('[data-slot="input-otp-group"]')).toHaveTextContent("123");
    await userEvent.keyboard("7");
    await expect(input).toHaveValue("123457");
    await userEvent.keyboard("{Backspace}");
    await expect(input).toHaveValue("12345");
  },
};
export const Compact: Story = {
  ...Default,
  args: { density: "compact" },
  play: async (context) => {
    await Default.play?.(context);
    const slot = context.canvasElement.querySelector<HTMLElement>('[data-slot="input-otp-slot"]');
    await expect(slot?.getBoundingClientRect().height).toBe(20);
  },
};
export const Disabled: Story = {
  args: { disabled: true, value: "123456" },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Verification code" });
    await expect(input).toBeDisabled();
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
    await expect(input).toHaveValue("123456");
    await expect(args.onComplete).not.toHaveBeenCalled();
  },
};
export const Placeholder: Story = {
  args: { placeholder: "000000" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Verification code" });
    await expect(canvasElement.querySelector('[data-slot="input-otp-group"]')).toHaveTextContent("000");
    await userEvent.type(input, "1");
    await expect(canvasElement.querySelector('[data-slot="input-otp-group"]')).toHaveTextContent("1");
    await userEvent.clear(input);
    await expect(canvasElement.querySelector('[data-slot="input-otp-group"]')).toHaveTextContent("000");
  },
};
export const Paste: Story = {
  args: { pasteTransformer: (text: string) => text.replaceAll("-", "") },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Verification code" });
    await userEvent.click(input);
    await userEvent.paste("123-456");
    await expect(input).toHaveValue("123456");
    await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith("123456"));
  },
};
export const Invalid: Story = {
  args: { "aria-invalid": true, "aria-describedby": "otp-error" },
  render: (args) => (
    <div className="flex flex-col gap-panel">
      <InputOTP {...args}>
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <p id="otp-error">The code has expired.</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Verification code" });
    await expect(input).toHaveAccessibleDescription("The code has expired.");
    await userEvent.type(input, "123");
    await expect(input).toHaveValue("123");
  },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <div className="flex flex-col items-start gap-panel">
        <InputOTP {...args} value={value} onChange={setValue}>
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <output aria-label="Current code">{value}</output>
        <Button onClick={() => setValue("")}>Reset code</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Verification code" }), "123456");
    await expect(canvas.getByLabelText("Current code")).toHaveTextContent("123456");
    await userEvent.click(canvas.getByRole("button", { name: "Reset code" }));
    await expect(canvas.getByRole("textbox", { name: "Verification code" })).toHaveValue("");
    await expect(canvas.getByLabelText("Current code")).toBeEmptyDOMElement();
  },
};

export const DefaultValue: Story = {
  args: { defaultValue: "123456", onChange: fn() },
  render: function Render(args) {
    const [defaultValue, setDefaultValue] = useState(args.defaultValue);
    return (
      <div className="flex flex-col items-start gap-panel">
        <InputOTP {...args} defaultValue={defaultValue} name="code">
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button onClick={() => setDefaultValue("654321")}>Change initial code</Button>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Verification code" });
    await expect(input).toHaveValue("123456");
    await expect(canvasElement.querySelector('[data-slot="input-otp-group"]')).toHaveTextContent("123456");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(args.onComplete).not.toHaveBeenCalled();
    await userEvent.clear(input);
    await userEvent.type(input, "234567");
    await expect(input).toHaveValue("234567");
    await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("234567"));
    await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith("234567"));
    await userEvent.click(canvas.getByRole("button", { name: "Change initial code" }));
    await expect(canvas.getByRole("textbox", { name: "Verification code" })).toBe(input);
    await expect(input).toHaveValue("234567");
    await expect(canvasElement.querySelector('[data-slot="input-otp-group"]')).toHaveTextContent("234567");
  },
};

export const RenderCallback: Story = {
  render: () => (
    <InputOTP
      maxLength={4}
      aria-label="PIN"
      render={({ slots }) => (
        <div className="flex gap-control-gap">
          {slots.map((slot, index) => (
            <span key={index} aria-hidden="true">
              {slot.char}
            </span>
          ))}
        </div>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "PIN" });
    await userEvent.type(input, "1234");
    await expect(input).toHaveValue("1234");
    await expect(canvasElement.querySelector("[data-input-otp-container]")).toHaveTextContent("1234");
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <InputOTP {...args} dir="rtl">
      <InputOTPGroup>
        {Array.from({ length: 6 }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Verification code" });
    const group = canvasElement.querySelector<HTMLElement>('[data-slot="input-otp-group"]')!;
    await expect(getComputedStyle(group).direction).toBe("rtl");
    const first = group.querySelector<HTMLElement>('[data-slot="input-otp-slot"]')!;
    const last = group.lastElementChild!;
    await expect(first.getBoundingClientRect().left).toBeGreaterThan(last.getBoundingClientRect().left);
    await userEvent.type(input, "123456");
    await expect(input).toHaveValue("123456");
    await expect(first).toHaveTextContent("1");
    await expect(last).toHaveTextContent("6");
    await expect(getComputedStyle(first).borderInlineStartWidth).toBe("1px");
    await expect(getComputedStyle(last).borderInlineEndWidth).toBe("1px");
    await userEvent.clear(input);
    await expect(input).toHaveValue("");
  },
};

export const FourDigits: Story = {
  args: { maxLength: 4 },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        {Array.from({ length: 4 }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Verification code" });
    await userEvent.type(input, "1234");
    await expect(input).toHaveValue("1234");
    await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith("1234"));
    await userEvent.keyboard("{Backspace}");
    await expect(input).toHaveValue("123");
  },
};
export const RightToLeftFourDigits: Story = {
  ...FourDigits,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
};

export const Alphanumeric: Story = {
  ...FourDigits,
  args: { maxLength: 6, pattern: REGEXP_ONLY_DIGITS_AND_CHARS, inputMode: "text" },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        {Array.from({ length: 6 }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Verification code" });
    await userEvent.type(input, "a1B2c!3");
    await expect(input).toHaveValue("a1B2c3");
    await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith("a1B2c3"));
    await userEvent.clear(input);
    await expect(input).toHaveValue("");
  },
};
export const RightToLeftAlphanumeric: Story = { ...Alphanumeric, decorators: RightToLeftFourDigits.decorators };

export const Form: Story = {
  render: function Render(args) {
    const id = useId(),
      errorId = useId(),
      descriptionId = useId();
    const [value, setValue] = useState(""),
      [isInvalid, setInvalid] = useState(false),
      [result, setResult] = useState("Not verified");
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <form
        aria-label="Verify login"
        onSubmit={(event) => {
          event.preventDefault();
          const code = otpFormSchema.safeParse(new FormData(event.currentTarget).get("code"));
          setInvalid(!code.success);
          if (code.success) {
            setResult(`Verified ${code.data}`);
          } else {
            inputRef.current?.focus();
          }
        }}
        onReset={() => {
          setValue("");
          setInvalid(false);
        }}
      >
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Verify your login</CardTitle>
            <CardDescription>Enter the code sent to m@example.com.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={id}>Login code</FieldLabel>
                <InputOTP
                  {...args}
                  ref={inputRef}
                  id={id}
                  name="code"
                  aria-label={undefined}
                  value={value}
                  onChange={(next) => {
                    setValue(next);
                    setInvalid(false);
                  }}
                  required
                  aria-invalid={isInvalid || undefined}
                  aria-errormessage={isInvalid ? errorId : undefined}
                  aria-describedby={descriptionId}
                  onInvalid={() => setInvalid(true)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription id={descriptionId}>Use the six-digit verification code.</FieldDescription>
                {isInvalid && <FieldError id={errorId}>Enter all six digits.</FieldError>}
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit">Verify code</Button>
            <Button type="reset" variant="outline">
              Reset
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setValue("");
                setInvalid(false);
                setResult("Code resent");
              }}
            >
              Resend code
            </Button>
          </CardFooter>
        </Card>
        <output aria-label="Verification result">{result}</output>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Login code" });
    await expect(input).toHaveAccessibleDescription("Use the six-digit verification code.");
    await userEvent.click(canvas.getByRole("button", { name: "Verify code" }));
    await expect(input).toHaveAccessibleErrorMessage("Enter all six digits.");
    await expect(input).toHaveFocus();
    await userEvent.type(input, "12345");
    await userEvent.click(canvas.getByRole("button", { name: "Verify code" }));
    await expect(canvas.getByLabelText("Verification result")).toHaveTextContent("Not verified");
    await expect(input).toHaveAccessibleErrorMessage("Enter all six digits.");
    await userEvent.type(input, "6");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Verification result")).toHaveTextContent("Verified 123456");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(input).toHaveValue("");
    await userEvent.type(input, "654321");
    await userEvent.click(canvas.getByRole("button", { name: "Resend code" }));
    await expect(input).toHaveValue("");
    await expect(canvas.getByLabelText("Verification result")).toHaveTextContent("Code resent");
  },
};
export const RightToLeftForm: Story = { ...Form, decorators: RightToLeftFourDigits.decorators };
export const ReadOnly: Story = {
  args: { readOnly: true, value: "123456" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Verification code" });
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await userEvent.keyboard("{Backspace}7");
    await expect(input).toHaveValue("123456");
  },
};
export const RightToLeftReadOnly: Story = { ...ReadOnly, decorators: RightToLeftFourDigits.decorators };
