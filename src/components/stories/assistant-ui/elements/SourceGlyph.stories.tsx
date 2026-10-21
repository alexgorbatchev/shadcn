import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { SourceGlyph } from "../../../assistant-ui/elements/SourceGlyph.js";
const meta: Meta<typeof SourceGlyph> = {
  component: SourceGlyph,
  render: (args) => <SourceGlyph {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/SourceGlyph",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { domain: "example.com" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("E")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
