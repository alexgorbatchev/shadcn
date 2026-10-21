import { within } from "storybook/test";
import { NumberTickerFixture } from "./fixtures/nz/NumberTickerFixture.js";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, userEvent } from "storybook/test";
import { NumberTicker } from "../../../assistant-ui/elements/NumberTicker.js";
const meta: Meta<typeof NumberTicker> = {
  component: NumberTicker,
  render: (args) => <NumberTicker {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/NumberTicker",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { value: 1234, label: "Tokens generated" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Tokens generated" })).toHaveTextContent("1,234");
    await waitFor(() => expect(canvas.getByText("Tokens generated")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const Zero: Story = {
  ...Default,
  args: { ...Default.args, value: 0 },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect((canvas.getByRole("status", { name: "Tokens generated" }) as HTMLOutputElement).value).toBe("0");
  },
};
export const Negative: Story = {
  ...Default,
  args: { ...Default.args, value: -12 },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect((canvas.getByRole("status", { name: "Tokens generated" }) as HTMLOutputElement).value).toBe("-12");
  },
};
export const Decimal: Story = {
  ...Default,
  args: { ...Default.args, value: 1234.5 },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect((canvas.getByRole("status", { name: "Tokens generated" }) as HTMLOutputElement).value).toBe("1,234.5");
  },
};
export const Incrementing: Story = {
  ...Default,
  args: { ...Default.args, value: 999 },
  render: (args) => <NumberTickerFixture key={args.value} value={args.value} label={args.label} />,
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    const output = canvas.getByRole("status", { name: "Tokens generated" }) as HTMLOutputElement;
    await expect(output.value).toBe("999");
    await userEvent.click(canvas.getByRole("button", { name: "Add one token" }));
    await waitFor(() => expect(output.value).toBe("1,000"));
  },
};
