import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { MermaidDiagram } from "../../../../assistant-ui/native/MermaidDiagram.js";
import { NativeMarkdownFixture } from "../helpers.js";
const meta: Meta<typeof MermaidDiagram> = {
  component: MermaidDiagram,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/data-visualization/MermaidDiagram",
  tags: ["autodocs", "test"],
  render: () => (
    <NativeMarkdownFixture
      text={"```mermaid\ngraph LR\n A[Read] --> B[Verify]\n```"}
      components={{ SyntaxHighlighter: MermaidDiagram }}
    />
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const NativeMarkdownDiagram: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", { name: "Expand diagram" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog", { name: "Diagram" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Zoom in" }));
    await expect(within(dialog).getByRole("status", { name: "Zoom level" })).toHaveTextContent("125%");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
