import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Composer } from "../../../../assistant-ui/elements/Composer.js";
import { ComposerExample } from "../helpers.js";
const meta: Meta<typeof Composer> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/composer/Composer",
  component: Composer,
  tags: ["autodocs", "test"],
  render: () => <ComposerExample />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Message: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Message" });
    await expect(canvas.getByRole("button", { name: "Send message" })).toBeDisabled();
    await userEvent.type(input, "Review this component");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Sent: Review this component")).toBeVisible();
    await expect(input).toHaveValue("");
    await expect(canvas.getByRole("button", { name: "Send message" })).toBeDisabled();
  },
};
export const SlashCommand: Story = {
  render: () => <ComposerExample defaultValue="/rev" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const command = canvas.getByRole("button", { name: "/review Review a change" });
    await waitFor(() => expect(command).toBeVisible());
    await userEvent.click(command);
    await expect(canvas.getByRole("textbox", { name: "Message" })).toHaveValue("/review ");
    await expect(canvas.queryByRole("button", { name: "/review Review a change" })).not.toBeInTheDocument();
  },
};
export const Mention: Story = {
  render: () => <ComposerExample defaultValue="Ask @rev" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const person = canvas.getByRole("button", { name: "Reviewer agent" });
    await waitFor(() => expect(person).toBeVisible());
    await userEvent.click(person);
    await expect(canvas.getByRole("textbox", { name: "Message" })).toHaveValue("Ask @Reviewer ");
  },
};
export const Attachments: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Add attachment" }));
    await expect(canvas.getByText("Layout.tsx")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remove Layout.tsx" }));
    await expect(canvas.queryByText("Layout.tsx")).not.toBeInTheDocument();
  },
};
export const VoiceInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start voice input" }));
    await expect(canvas.getByText("0:07")).toBeVisible();
    await expect(canvas.queryByRole("textbox", { name: "Message" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Stop recording" }));
    await expect(canvas.getByRole("textbox", { name: "Message" })).toBeVisible();
  },
};
