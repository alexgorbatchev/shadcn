import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { BillingUsage } from "../../BillingUsage";
const meta: Meta<typeof BillingUsage> = {
  title: "@alexgorbatchev/shadcn/components/layout/BillingUsage",
  component: BillingUsage,
  tags: ["autodocs", "test"],
  args: {
    plan: "Team",
    price: "$49",
    period: "per month",
    metrics: [
      { id: "storage", label: "Storage", used: 42, limit: 100, unit: "GB" },
      { id: "seats", label: "Seats", used: 8, limit: 10 },
    ],
    onManage: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("meter", { name: "Storage" })).toHaveAttribute("aria-valuenow", "42");
    await expect(c.getByText("42 / 100 GB")).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Manage billing" }));
    await expect(args.onManage).toHaveBeenCalled();
  },
};
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Manage billing" })).toBeDisabled();
  },
};
