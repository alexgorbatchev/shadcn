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
    const seriesPaint = [
      ...Array.from(
        canvasElement.querySelectorAll(".recharts-bar-rectangle path"),
        (mark) => getComputedStyle(mark).fill,
      ),
      ...Array.from(
        canvasElement.querySelectorAll(".recharts-area-curve, .recharts-line-curve"),
        (mark) => getComputedStyle(mark).stroke,
      ),
    ];
    await expect(seriesPaint.length).toBeGreaterThanOrEqual(3);
    for (const paint of seriesPaint) await expect(paint).toMatch(/^(rgb|color)\(/);
    await expect(new Set(seriesPaint).size).toBe(3);
    const chart = c.getByRole("application");
    chart.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(c.getByRole("status")).toBeVisible());
    await expect(c.getByRole("status")).toHaveTextContent("Revenue");
  },
};

export const MissingMeasurements: Story = {
  args: {
    label: "Sleep duration",
    index: "date",
    data: [
      { date: "2026-10-01", duration: 7.5 },
      { date: "2026-10-02", duration: null },
      { date: "2026-10-03", duration: 8 },
    ],
    series: [{ key: "duration", label: "Sleep duration" }],
    showDots: true,
    valueFormatter: (value) => `${value} hours`,
  },
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(canvasElement.querySelectorAll(".recharts-line-dot")).toHaveLength(2));
    const chart = c.getByRole("application");
    chart.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(c.getByRole("status")).toHaveTextContent("7.5 hours"));
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(c.queryByRole("status")).not.toBeInTheDocument());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(c.getByRole("status")).toHaveTextContent("8 hours"));
  },
};

export const SingleMeasurement: Story = {
  args: {
    label: "Temperature deviation",
    index: "date",
    data: [{ date: "2026-10-01", temperature: -0.3 }],
    series: [{ key: "temperature", label: "Temperature deviation" }],
    showDots: true,
    valueFormatter: (value) => `${value} °C`,
  },
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(canvasElement.querySelectorAll(".recharts-line-dot")).toHaveLength(1));
    c.getByRole("application").focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(c.getByRole("status")).toHaveTextContent("-0.3 °C"));
  },
};
