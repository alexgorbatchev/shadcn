import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DocumentReference } from "../../../assistant-ui/elements/DocumentReference.js";
const meta: Meta<typeof DocumentReference> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/DocumentReference",
  component: DocumentReference,
  tags: ["autodocs", "test"],
  args: {
    title: "Architecture",
    pages: 12,
    anchors: [
      { page: 3, quote: "Service boundary" },
      { page: 7, quote: "Deployment procedure" },
      { page: 7, quote: "Rollback procedure" },
    ],
    activePage: 7,
    onJump: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Jump: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Service boundary/ }));
    await expect(args.onJump).toHaveBeenCalledWith(3);
    await expect(canvas.getByRole("button", { name: /Deployment procedure/ })).toHaveAttribute("aria-current", "true");
    await expect(canvas.getByRole("button", { name: /Rollback procedure/ })).not.toHaveAttribute("aria-current");
  },
};
export const ReadOnly: Story = {
  args: { onJump: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Service boundary")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { anchors: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("12 pages · 0 cited")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
