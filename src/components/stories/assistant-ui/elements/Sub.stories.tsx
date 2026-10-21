import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Sub } from "../../../assistant-ui/elements/Sub.js";
const meta: Meta<typeof Sub> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/Sub",
  component: Sub,
  tags: ["autodocs", "test"],
  args: { children: "i" },
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("subscript")).toHaveTextContent("i");
  },
};
export { Default as Sub };
