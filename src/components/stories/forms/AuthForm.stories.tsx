import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { AuthForm } from "../../AuthForm";
const meta: Meta<typeof AuthForm> = {
  title: "@alexgorbatchev/shadcn/components/forms/AuthForm",
  component: AuthForm,
  tags: ["autodocs", "test"],
  args: { onSubmit: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const SignIn: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "alex@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "secret-password");
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: "alex@example.com",
      password: "secret-password",
      name: "",
    });
  },
};
export const SignUp: Story = {
  args: { mode: "sign-up" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Alex");
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "alex@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "secret-password");
    await userEvent.click(canvas.getByRole("button", { name: "Create an account" }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: "alex@example.com",
      password: "secret-password",
      name: "Alex",
    });
  },
};
export const ResetPassword: Story = {
  args: { mode: "reset-password" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByLabelText("Password")).not.toBeInTheDocument();
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "alex@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Send reset link" }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ email: "alex@example.com", password: "", name: "" });
  },
};
export const ServerError: Story = {
  args: { onSubmit: fn(() => Promise.reject(new Error("Invalid credentials"))) },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "alex@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "wrong");
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Invalid credentials");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Sign in" })).toBeEnabled());
  },
};
export const Disabled: Story = {
  args: {
    disabled: true,
    footer: <a href="#terms">Terms of service</a>,
    alternativeActions: <a href="#provider">Continue with provider</a>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Email" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Sign in" })).toBeDisabled();
    await expect(canvas.getByRole("link", { name: "Terms of service" })).toHaveAttribute("href", "#terms");
  },
};
