import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "../Separator";

const meta: Meta<typeof Separator> = {
  title: "shadcn-alexgorbatchev/components/Separator",
  component: Separator,
  tags: ["autodocs", "!test"],
  render: (args) => (
    <div className="flex flex-col gap-4">
      <span>Project</span>
      <Separator {...args} />
      <span>Settings</span>
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};
export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-4">
      <span>Overview</span>
      <Separator orientation="vertical" />
      <span>Settings</span>
    </div>
  ),
};
