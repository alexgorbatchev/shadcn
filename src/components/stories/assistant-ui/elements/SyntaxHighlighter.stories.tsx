import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { SyntaxHighlighter } from "../../../assistant-ui/elements/SyntaxHighlighter.js";
import { NativeMarkdownFixture } from "../native/helpers.js";
const meta: Meta<typeof SyntaxHighlighter> = {
  component: SyntaxHighlighter,
  render: (args) => (
    <NativeMarkdownFixture text={`\`\`\`${args.language}\n${args.code}\n\`\`\``} components={{ SyntaxHighlighter }} />
  ),
  title: "shadcn-alexgorbatchev/assistant-ui/elements/SyntaxHighlighter",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { code: "const ready = true;", language: "typescript" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("SyntaxHighlighter")).toHaveTextContent("const ready = true;");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const ConsumerPalette: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const foreground = getComputedStyle(canvasElement).color;
    canvasElement.style.setProperty("--primary", foreground);
    try {
      const keywords = await canvas.findAllByText("const", { selector: "span" });
      await waitFor(() =>
        expect(keywords.map((keyword) => getComputedStyle(keyword).color)).toEqual(keywords.map(() => foreground)),
      );
    } finally {
      canvasElement.style.removeProperty("--primary");
    }
  },
};
