import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { EmptyStateComposer } from "../../../assistant-ui/elements/EmptyStateComposer.js";
import { EmptyStateComposerFixture } from "./fixtures/nz/EmptyStateComposerFixture.js";
const meta: Meta<typeof EmptyStateComposer> = {
  component: EmptyStateComposer,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/EmptyStateComposer",
  args: { placeholder: "Ask about the workspace", onSend: fn() },
  render: (args) => <EmptyStateComposer {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Uncontrolled: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Message" });
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
    await userEvent.type(input, "Review the workspace");
    await userEvent.keyboard("{Enter}");
    await expect(args.onSend).toHaveBeenCalledWith("Review the workspace");
    await expect(input).toHaveValue("");
  },
};
export const Disabled: Story = {
  args: { onSend: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Message" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
  },
};
export const LightTheme: Story = { ...Uncontrolled, globals: { theme: "light" }, play: Uncontrolled.play };
export const DarkTheme: Story = { ...Uncontrolled, globals: { theme: "dark" }, play: Uncontrolled.play };
export const Controlled: Story = {
  render: () => <EmptyStateComposerFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Message" });
    await expect(input).toHaveValue("Inspect source");
    await userEvent.clear(input);
    await userEvent.type(input, "Summarize changes");
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(canvas.getByRole("status", { name: "Sent message" })).toHaveTextContent("Summarize changes");
    await expect(input).toHaveValue("");
  },
};
export const WhitespaceDraft: Story = {
  args: { defaultValue: "   " },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("textbox", { name: "Message" }));
    await userEvent.keyboard("{Enter}");
    await expect(args.onSend).not.toHaveBeenCalled();
  },
};
export const ReadOnlyValue: Story = {
  args: { value: "Review source" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Message" })).toHaveAttribute("readonly");
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(args.onSend).toHaveBeenCalledWith("Review source");
    await expect(canvas.getByRole("textbox", { name: "Message" })).toHaveValue("Review source");
  },
};
