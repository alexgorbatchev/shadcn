import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from "../Popover";
import { Button } from "../Button";

const meta: Meta<typeof Popover> = {
  title: "shadcn-alexgorbatchev/components/Popover",
  component: Popover,
  tags: ["autodocs", "!test"],
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline" />}>Project details</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Local workspace</PopoverTitle>
          <PopoverDescription>All services are running.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "300px" } } },
};
export const Modal: Story = { args: { modal: true } };
