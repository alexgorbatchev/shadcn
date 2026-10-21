import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { InlineCitation } from "../../../assistant-ui/elements/InlineCitation.js";
const meta: Meta<typeof InlineCitation> = {
  component: InlineCitation,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/InlineCitation",
  args: { children: "The workspace boundary follows the source design." },
  render: (args) => <InlineCitation {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Text: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("The workspace boundary follows the source design.")).toBeVisible();
  },
};
export const LightTheme: Story = { ...Text, globals: { theme: "light" }, play: Text.play };
export const DarkTheme: Story = { ...Text, globals: { theme: "dark" }, play: Text.play };
