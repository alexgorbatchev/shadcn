import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { DaySeparator } from "../../../../assistant-ui/elements/DaySeparator.js";
const meta: Meta<typeof DaySeparator> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/DaySeparator",
  component: DaySeparator,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Conversation: Story = {
  args: {
    messages: [
      { id: "request", day: "Today", time: "09:00", role: "user", text: "Review the component" },
      { id: "reply", day: "Today", time: "09:01", role: "assistant", text: "The component is accessible." },
      { id: "follow-up", day: "Tomorrow", time: "10:00", role: "user", text: "Add keyboard coverage" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Today")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Tomorrow")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Review the component")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("The component is accessible.")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Add keyboard coverage")).toBeVisible());
    await expect(canvas.getAllByRole("separator")).toHaveLength(2);
  },
};
export const Empty: Story = {
  args: { messages: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("separator")).not.toBeInTheDocument();
    await expect(canvas.getByTestId("DaySeparator")).toBeEmptyDOMElement();
  },
};
