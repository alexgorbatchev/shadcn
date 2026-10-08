import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "../Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "shadcn-alexgorbatchev/components/Skeleton",
  component: Skeleton,
  tags: ["autodocs", "!test"],
  render: (args) => (
    <div role="status" aria-label="Loading content" className="flex flex-col gap-3">
      <Skeleton {...args} className="h-5 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-40" />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};
export const CardPlaceholder: Story = {
  render: () => (
    <div role="status" aria-label="Loading card" className="flex flex-col gap-4">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-full" />
    </div>
  ),
};
