import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { StatCard } from "../../StatCard";
const meta: Meta<typeof StatCard> = {
  title: "@alexgorbatchev/shadcn/components/data-display/StatCard",
  component: StatCard,
  tags: ["autodocs", "test"],
  args: {
    label: "Revenue",
    value: "$24,580",
    change: "+12%",
    changeIntent: "positive",
    description: "Compared with the previous month.",
    children: <a href="#revenue">View revenue report</a>,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Revenue")).toHaveTextContent("$24,580");
    await expect(canvas.getByText("+12%")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "View revenue report" })).toHaveAttribute("href", "#revenue");
  },
};
export const Decrease: Story = {
  args: { change: "-5%", changeIntent: "negative", children: undefined, description: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText("Revenue")).toHaveTextContent("-5%");
  },
};
export const Neutral: Story = {
  args: { change: "No change", changeIntent: "neutral" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("No change")).toBeVisible();
  },
};
export const Loading: Story = {
  args: { loading: true, change: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Revenue")).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByLabelText("Loading Revenue")).toBeVisible();
    await expect(canvas.queryByText("$24,580")).not.toBeInTheDocument();
  },
};
