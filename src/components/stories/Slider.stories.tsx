import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "../Slider";
import { fn } from "storybook/test";

const meta: Meta<typeof Slider> = {
  title: "shadcn-alexgorbatchev/components/Slider",
  component: Slider,
  tags: ["autodocs", "!test"],
  args: {
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
    getAriaLabel: () => "Volume",
    onValueChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    getAriaLabel: (index) => (index === 0 ? "Minimum volume" : "Maximum volume"),
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const Stepped: Story = { args: { step: 10 } };
export const Vertical: Story = { args: { orientation: "vertical" } };
