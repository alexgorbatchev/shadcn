import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ErrorState } from "../../../assistant-ui/elements/ErrorState.js";
const meta: Meta<typeof ErrorState> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ErrorState",
  component: ErrorState,
  tags: ["autodocs", "test"],
  args: {
    title: "Request failed",
    detail: "The connection closed before the response arrived.",
    retrying: false,
    onRetry: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Failed: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveAccessibleName("Request failed");
    await expect(canvas.getByRole("alert")).toHaveAccessibleDescription(
      "The connection closed before the response arrived.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Retry" }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
export const Retrying: Story = {
  args: { retrying: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Retrying");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
