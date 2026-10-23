import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { AnalyticsChart } from "../../chart";
const meta: Meta<typeof AnalyticsChart> = {
  title: "@alexgorbatchev/shadcn/components/data-display/AnalyticsChart",
  component: AnalyticsChart,
  tags: ["autodocs", "test"],
  args: {
    label: "Revenue and signups",
    index: "month",
    data: [
      { month: "Jan", revenue: 100, signups: 30, total: 130 },
      { month: "Feb", revenue: 200, signups: 50, total: 250 },
      { month: "Mar", revenue: 150, signups: 60, total: 210 },
    ],
    series: [
      { key: "revenue", label: "Revenue", type: "bar" },
      { key: "signups", label: "Signups", type: "area" },
      { key: "total", label: "Total" },
    ],
    valueFormatter: (value) => `$${value}`,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByRole("application")).toBeVisible());
    await expect(c.getByText("Revenue")).toBeVisible();
    const chart = c.getByRole("application");
    chart.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(c.getByRole("status")).toBeVisible());
    await expect(c.getByRole("status")).toHaveTextContent("Revenue");
  },
};
