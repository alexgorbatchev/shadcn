import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, fn, userEvent } from "storybook/test";
import { QuotaBanner } from "../../../assistant-ui/elements/QuotaBanner.js";
const meta: Meta<typeof QuotaBanner> = {
  component: QuotaBanner,
  render: (args) => <QuotaBanner {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/QuotaBanner",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    used: 98,
    limit: 100,
    unit: "requests",
    resetsIn: "2 hours",
    upgradeLabel: "Increase quota",
    onUpgrade: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await expect((canvas.getByRole("meter") as HTMLMeterElement).value).toBe(98);
    await waitFor(() => expect(canvas.getByText("2 requests left")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Increase quota" }));
    await expect(args.onUpgrade).toHaveBeenCalledOnce();
  },
};
export const Exhausted: Story = {
  ...Default,
  args: { ...Default.args, used: 100 },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect((canvas.getByRole("meter") as HTMLMeterElement).value).toBe(100);
    await waitFor(() => expect(canvas.getByText("0 requests left")).toBeVisible());
  },
};
export const Available: Story = {
  ...Default,
  args: { ...Default.args, used: 20 },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect((canvas.getByRole("meter") as HTMLMeterElement).value).toBe(20);
    await waitFor(() => expect(canvas.getByText("80 requests left")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
