import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { NumberRoll } from "../../../assistant-ui/elements/NumberRoll.js";
import { NumberRollScene } from "./fixtures/numberRoll.js";

const meta: Meta<typeof NumberRoll> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/NumberRoll",
  component: NumberRoll,
  tags: ["autodocs", "test"],
  args: { value: 99, locales: "en-US", duration: 5000 },
  render: (args) => <NumberRollScene {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Changing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const amount = canvas.getByRole("status", { name: "Amount" });
    await expect(amount).toHaveTextContent("99");
    await userEvent.click(canvas.getByRole("button", { name: "Increase amount" }));
    await expect(amount).toHaveTextContent("1,000");
    await waitFor(() =>
      expect(amount.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
    const animations: Animation[] = amount.getAnimations({ subtree: true });
    await userEvent.click(canvas.getByRole("button", { name: "Remove amount" }));
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
    await expect(animations.every((animation) => animation.playState === "idle")).toBe(true);
  },
};
export const Currency: Story = {
  args: { format: { style: "currency", currency: "USD" }, prefix: "~", suffix: " total", duration: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const amount = canvas.getByRole("status", { name: "Amount" });
    await expect(amount).toHaveTextContent("~$99.00 total");
    await userEvent.click(canvas.getByRole("button", { name: "Decrease amount" }));
    await expect(amount).toHaveTextContent("~$9.00 total");
    await expect(amount.getAnimations({ subtree: true })).toHaveLength(0);
  },
};
export const Localized: Story = {
  args: { value: -12.5, locales: "ar-EG", duration: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Amount" })).toHaveTextContent(
      new Intl.NumberFormat("ar-EG").format(-12.5),
    );
  },
};
export const UpwardTrend: Story = {
  args: { value: 1000, trend: "up" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const amount = canvas.getByRole("status", { name: "Amount" });
    await userEvent.click(canvas.getByRole("button", { name: "Decrease amount" }));
    await expect(amount).toHaveTextContent("9");
    await userEvent.click(canvas.getByRole("button", { name: "Finish animation" }));
    await waitFor(() => expect(amount.getAnimations({ subtree: true })).toHaveLength(0));
    await waitFor(() => expect(within(amount).getAllByTestId("NumberRollDigit")).toHaveLength(1));
  },
};
export const DownwardTrend: Story = {
  args: { trend: "down", duration: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Increase amount" }));
    await expect(canvas.getByRole("status", { name: "Amount" })).toHaveTextContent("1,000");
  },
};
export const DefaultDuration: Story = {
  render: () => <NumberRollScene value={99} locales="en-US" />,
  play: DownwardTrend.play,
};
export const InvalidDuration: Story = {
  args: { duration: Number.NaN },
  play: DownwardTrend.play,
};
