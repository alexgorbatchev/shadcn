import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DirectionProvider } from "../../DirectionProvider";
import { ToggleGroup, ToggleGroupItem } from "../../ToggleGroup";

const meta: Meta<typeof DirectionProvider> = {
  title: "@alexgorbatchev/shadcn/components/providers/DirectionProvider",
  component: DirectionProvider,
  tags: ["autodocs", "test"],
  args: { direction: "rtl" },
  render: (args) => (
    <DirectionProvider {...args}>
      <ToggleGroup aria-label="Direction example">
        <ToggleGroupItem value="first">First</ToggleGroupItem>
        <ToggleGroupItem value="second">Second</ToggleGroupItem>
      </ToggleGroup>
    </DirectionProvider>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "First" }));
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("button", { name: "Second" })).toHaveFocus();
  },
};
export { Default as DirectionProvider };
