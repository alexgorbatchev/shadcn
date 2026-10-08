import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip, TooltipTrigger, TooltipContent } from "../Tooltip";
import { Button } from "../Button";

const meta: Meta<typeof Tooltip> = {
  title: "shadcn-alexgorbatchev/components/Tooltip",
  component: Tooltip,
  tags: ["autodocs", "!test"],
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger render={<Button variant="outline" />}>Hover or focus</TooltipTrigger>
      <TooltipContent>Save your changes.</TooltipContent>
    </Tooltip>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "220px" } } },
};
export const Below: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger render={<Button variant="outline" />}>Below</TooltipTrigger>
      <TooltipContent side="bottom">Additional information.</TooltipContent>
    </Tooltip>
  ),
};
