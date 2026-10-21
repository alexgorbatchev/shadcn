import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { SyntaxHighlighter } from "../../../assistant-ui/native/SyntaxHighlighter.js";
import { NativeMarkdownFixture } from "./helpers.js";

interface ISyntaxHighlighterStoryProps {
  code: string;
  language: string;
}
const meta: Meta<ISyntaxHighlighterStoryProps> = {
  component: SyntaxHighlighter,
  title: "shadcn-alexgorbatchev/assistant-ui/native/SyntaxHighlighter",
  tags: ["autodocs", "test"],
  args: { code: "const ready = true;", language: "typescript" },
  render: (args) => (
    <NativeMarkdownFixture text={`\`\`\`${args.language}\n${args.code}\n\`\`\``} components={{ SyntaxHighlighter }} />
  ),
};
export default meta;
type Story = StoryObj<ISyntaxHighlighterStoryProps>;
export const SettledCode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("ready", { exact: true })).toBeVisible());
    await expect(canvas.getByText("ready", { exact: true }).closest("code")).toHaveTextContent("const ready = true;");
  },
};
export const UnknownLanguage: Story = {
  args: { language: "unregistered-language", code: "plain content" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("plain content")).toBeVisible();
  },
};
