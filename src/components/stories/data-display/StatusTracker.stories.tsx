import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { StatusTracker } from "../../StatusTracker";
const meta: Meta<typeof StatusTracker> = {
  title: "@alexgorbatchev/shadcn/components/data-display/StatusTracker",
  component: StatusTracker,
  tags: ["autodocs", "test"],
  args: {
    label: "API uptime",
    items: [
      { id: "1", label: "Monday", status: "success", description: "All systems operational" },
      { id: "2", label: "Tuesday", status: "warning" },
      { id: "3", label: "Wednesday", status: "error", description: "Incident resolved" },
      { id: "4", label: "Thursday", status: "unknown" },
    ],
    onItemSelect: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    const monday = c.getByRole("button", { name: "Monday: success" });
    await userEvent.hover(monday);
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).toHaveTextContent(
        "All systems operational",
      ),
    );
    await userEvent.click(monday);
    await expect(args.onItemSelect).toHaveBeenCalledWith(args.items[0]);
    await userEvent.unhover(monday);
    await userEvent.hover(c.getByRole("button", { name: "Tuesday: warning" }));
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).toHaveTextContent(
        "Tuesday: warning",
      ),
    );
  },
};
export const ReadOnly: Story = {
  args: { onItemSelect: undefined },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Thursday: unknown" }));
  },
};
