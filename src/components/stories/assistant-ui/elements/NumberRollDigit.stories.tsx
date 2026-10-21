import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { NumberRollDigit } from "../../../assistant-ui/elements/NumberRollDigit.js";
import { NumberRollDigitScene } from "./fixtures/numberRoll.js";

const meta: Meta<typeof NumberRollDigit> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/NumberRollDigit",
  component: NumberRollDigit,
  tags: ["autodocs", "test"],
  args: { digit: 9, direction: 1, duration: 500 },
  render: (args) => <NumberRollDigitScene {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const digit = canvas.getByTestId("NumberRollDigit");
    await userEvent.click(canvas.getByRole("button", { name: "Roll to zero" }));
    await waitFor(() =>
      expect(digit.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
    await waitFor(() => expect(digit.getAnimations({ subtree: true })).toHaveLength(0));
    const zero = digit.querySelector<HTMLElement>('[data-digit-cell="0"]');
    await expect(zero).toBeVisible();
    await expect(zero?.getBoundingClientRect().top).toBe(digit.getBoundingClientRect().top);
  },
};
export { Default as NumberRollDigit };
