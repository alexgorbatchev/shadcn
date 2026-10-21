import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Chart } from "../../../assistant-ui/elements/Chart.js";
const meta: Meta<typeof Chart> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/Chart",
  component: Chart,
  tags: ["autodocs", "test"],
  args: { label: "Requests", value: "132", delta: "+12%", points: [12, 18, 9, 32, 25, 40], visibleCount: 6 },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Area: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const application = canvas.getByRole("application", { name: "Requests: 132" });
    await expect(application).toBeVisible();
    await expect(canvas.getByText("+12%")).toBeVisible();
    application.focus();
    await userEvent.keyboard("{ArrowLeft}");
    const tooltip = await canvas.findByRole("status");
    await waitFor(() => expect(within(tooltip).getByText("12")).toBeVisible());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(within(tooltip).getByText("18")).toBeVisible());
  },
};
export const Line: Story = {
  args: { variant: "line", delta: "−4%", upIsGood: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("application", { name: "Requests: 132" })).toBeVisible();
    await expect(within(canvasElement).getByText("−4%")).toBeVisible();
  },
};
export const Bars: Story = {
  args: { variant: "bars", trend: "flat", visibleCount: 3 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("application", { name: "Requests: 132" })).toBeVisible();
  },
};
export const Empty: Story = {
  args: { points: [], visibleCount: 0, value: "0", delta: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("0")).toBeVisible();
    await expect(within(canvasElement).queryByText("+12%")).not.toBeInTheDocument();
  },
};
