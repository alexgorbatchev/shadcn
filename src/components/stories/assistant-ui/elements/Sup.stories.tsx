import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Sup } from "../../../assistant-ui/elements/Sup.js";
const meta: Meta<typeof Sup> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/Sup",
  component: Sup,
  tags: ["autodocs", "test"],
  args: { children: "2" },
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("superscript")).toHaveTextContent("2");
  },
};
export { Default as Sup };
