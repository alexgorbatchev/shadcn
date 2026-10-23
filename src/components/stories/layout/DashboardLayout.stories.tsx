import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { DashboardLayout } from "../../DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../../Card";
import { Button } from "../../Button";
import { AnalyticsChart } from "../../chart";
import { BarList } from "../../BarList";
const exportReport = fn();
const meta: Meta<typeof DashboardLayout> = {
  title: "@alexgorbatchev/shadcn/components/layout/DashboardLayout",
  component: DashboardLayout,
  tags: ["autodocs", "test"],
  parameters: { layout: "padded" },
  args: {
    title: "Overview",
    description: "Your workspace at a glance.",
    actions: <Button onClick={exportReport}>Export report</Button>,
    stats: [
      { id: "revenue", label: "Revenue", value: "$24,580", change: "+12%", changeIntent: "positive" },
      { id: "customers", label: "Customers", value: "1,240", change: "+8%", changeIntent: "positive" },
      { id: "churn", label: "Churn", value: "2.1%", change: "-0.4%", changeIntent: "positive" },
      { id: "uptime", label: "Uptime", value: "99.99%" },
    ],
    children: (
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              label="Monthly revenue"
              data={[
                { month: "Jan", value: 10 },
                { month: "Feb", value: 20 },
              ]}
              index="month"
              series={[{ key: "value", label: "Revenue", type: "area" }]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top channels</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList
              label="Channels"
              items={[
                { id: "direct", label: "Direct", value: 300 },
                { id: "search", label: "Search", value: 180 },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    ),
    footer: <p className="text-sm text-muted-foreground">Updated just now</p>,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(c.getByLabelText("Customers")).toHaveTextContent("1,240");
    await userEvent.click(c.getByRole("button", { name: "Export report" }));
    await expect(exportReport).toHaveBeenCalled();
  },
};
export const EmptyStats: Story = {
  args: { stats: [], description: undefined, actions: undefined, footer: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { name: "Overview" })).toBeVisible();
  },
};
