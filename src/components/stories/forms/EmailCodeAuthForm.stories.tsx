import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { EmailCodeAuthForm } from "../../input-otp/EmailCodeAuthForm";

type Deferred = { promise: Promise<void>; resolve: () => void };

function deferred(): Deferred {
  let resolve = (): void => undefined;
  const promise = new Promise<void>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

async function requestCode(canvasElement: HTMLElement, email = "member@example.com"): Promise<void> {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), email);
  await userEvent.click(canvas.getByRole("button", { name: "Send code" }));
}

const meta: Meta<typeof EmailCodeAuthForm> = {
  title: "@alexgorbatchev/shadcn/components/forms/EmailCodeAuthForm",
  component: EmailCodeAuthForm,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "EmailCodeAuthForm is passwordless sign-in in two steps. Import it from `@alexgorbatchev/shadcn/input-otp`. The email step calls `onRequestCode(email)`; when it resolves, the code step shows an InputOTP for a numeric code of `codeLength` digits (default 6) with one-time-code autofill. Completing the code or pressing Verify calls `onVerifyCode(email, code)` once. Resend code calls `onRequestCode` again and announces the new code; Use a different email returns to the first step. Rejected promises show their message and keep the current step; buttons show pending state while a handler runs. The consumer owns sending, verifying, rate limits, and navigation after success.",
      },
    },
  },
  args: { onRequestCode: fn(), onVerifyCode: fn() },
};
export default meta;
type Story = StoryObj<typeof EmailCodeAuthForm>;

export const RequestAndVerify: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Send code" }));
    await expect(args.onRequestCode).not.toHaveBeenCalled();
    await requestCode(canvasElement, "  member@example.com ");
    await expect(args.onRequestCode).toHaveBeenCalledWith("member@example.com");
    const code = await canvas.findByRole("textbox", { name: "Verification code" });
    await expect(code).toHaveFocus();
    await expect(canvas.getByText("We sent a code to member@example.com.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Verify" })).toBeDisabled();
    await userEvent.type(code, "12a3456");
    await expect(code).toHaveValue("123456");
    await waitFor(() => expect(args.onVerifyCode).toHaveBeenCalledWith("member@example.com", "123456"));
    await userEvent.click(canvas.getByRole("button", { name: "Verify" }));
    await waitFor(() => expect(args.onVerifyCode).toHaveBeenCalledTimes(2));
  },
};

export const FourDigitCode: Story = {
  args: { codeLength: 4, defaultEmail: "member@example.com" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveValue("member@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Send code" }));
    const code = await canvas.findByRole("textbox", { name: "Verification code" });
    await expect(canvasElement.querySelectorAll("[data-slot=input-otp-slot]")).toHaveLength(4);
    await expect(canvas.getByText("Enter the 4-digit code from the email.")).toBeVisible();
    await userEvent.type(code, "98765");
    await waitFor(() => expect(args.onVerifyCode).toHaveBeenCalledWith("member@example.com", "9876"));
  },
};

export const RequestFailure: Story = {
  args: { onRequestCode: fn(() => Promise.reject(new Error("This email cannot sign in."))) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await requestCode(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("This email cannot sign in.");
    await expect(canvas.getByRole("textbox", { name: "Email" })).toBeEnabled();
    await expect(canvas.queryByRole("textbox", { name: "Verification code" })).not.toBeInTheDocument();
  },
};

export const VerifyFailure: Story = {
  args: { onVerifyCode: fn(() => Promise.reject("rejected")) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await requestCode(canvasElement);
    const code = await canvas.findByRole("textbox", { name: "Verification code" });
    await userEvent.type(code, "000000");
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Unable to submit. Please try again.");
    await expect(code).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(code).toBeEnabled());
  },
};

export const Resend: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await requestCode(canvasElement);
    const code = await canvas.findByRole("textbox", { name: "Verification code" });
    await userEvent.type(code, "12");
    await userEvent.click(canvas.getByRole("button", { name: "Resend code" }));
    await expect(args.onRequestCode).toHaveBeenCalledTimes(2);
    await expect(args.onRequestCode).toHaveBeenLastCalledWith("member@example.com");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("A new code is on its way."));
    await expect(code).toHaveValue("");
  },
};

export const ChangeEmail: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await requestCode(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Use a different email" }));
    const email = canvas.getByRole("textbox", { name: "Email" });
    await expect(email).toHaveValue("member@example.com");
    await userEvent.clear(email);
    await requestCode(canvasElement, "other@example.com");
    await expect(args.onRequestCode).toHaveBeenLastCalledWith("other@example.com");
    await expect(await canvas.findByText("We sent a code to other@example.com.")).toBeVisible();
  },
};

const pendingVerification = deferred();

export const Pending: Story = {
  args: { onVerifyCode: fn(() => pendingVerification.promise) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await requestCode(canvasElement);
    const code = await canvas.findByRole("textbox", { name: "Verification code" });
    await userEvent.type(code, "123456");
    const form = canvas.getByRole("form", { name: "Verify code" });
    await waitFor(() => expect(form).toHaveAttribute("aria-busy", "true"));
    await expect(canvas.getByRole("button", { name: /Verify$/ })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Resend code" })).toBeDisabled();
    await expect(args.onVerifyCode).toHaveBeenCalledOnce();
    pendingVerification.resolve();
    await waitFor(() => expect(form).toHaveAttribute("aria-busy", "false"));
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    title: "Join the workspace",
    description: "Use the address your invitation was sent to.",
    footer: <a href="#help">Need help?</a>,
    alternativeActions: <a href="#provider">Continue with provider</a>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("form", { name: "Join the workspace" })).toBeVisible();
    await expect(canvas.getByText("Use the address your invitation was sent to.")).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Email" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Send code" })).toBeDisabled();
    await expect(canvas.getByRole("link", { name: "Continue with provider" })).toHaveAttribute("href", "#provider");
    await expect(canvas.getByRole("link", { name: "Need help?" })).toHaveAttribute("href", "#help");
  },
};
