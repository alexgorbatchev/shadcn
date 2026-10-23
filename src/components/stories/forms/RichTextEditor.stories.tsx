import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { RichTextEditor, useEditor, StarterKit } from "../../editor";
const meta: Meta<typeof RichTextEditor> = {
  title: "@alexgorbatchev/shadcn/components/forms/RichTextEditor",
  component: RichTextEditor,
  tags: ["autodocs", "test"],
  args: { label: "Description" },
  render: (args) => {
    const editor = useEditor({
      extensions: [StarterKit],
      content: "<p>Initial content</p>",
      immediatelyRender: false,
      editorProps: { attributes: { role: "textbox", "aria-label": args.label, "aria-multiline": "true" } },
    });
    return <RichTextEditor {...args} editor={editor} />;
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByRole("textbox", { name: "Description" })).toBeVisible());
    const box = c.getByRole("textbox");
    await userEvent.click(box);
    await userEvent.keyboard("{Control>}a{/Control}");
    await userEvent.type(box, "Hello editor");
    await userEvent.keyboard("{Control>}a{/Control}");
    await userEvent.click(c.getByRole("button", { name: "Bold" }));
    await expect(c.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    await expect(box.querySelector("strong")).toHaveTextContent("Hello editor");
    await userEvent.click(c.getByRole("button", { name: "Undo" }));
    await expect(box.querySelector("strong")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Redo" }));
    await expect(box.querySelector("strong")).toHaveTextContent("Hello editor");
  },
};
export const ListsAndItalic: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByRole("textbox")).toBeVisible());
    await userEvent.click(c.getByRole("textbox"));
    await userEvent.click(c.getByRole("button", { name: "Italic" }));
    await userEvent.type(c.getByRole("textbox"), "italic");
    await expect(c.getByRole("textbox").querySelector("em")).toHaveTextContent("italic");
    await userEvent.click(c.getByRole("button", { name: "Bullet list" }));
    await expect(c.getByRole("textbox").querySelector("ul")).not.toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Numbered list" }));
    await expect(c.getByRole("textbox").querySelector("ol")).not.toBeNull();
  },
};
export const Loading: Story = {
  render: (args) => <RichTextEditor {...args} editor={null} />,
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole("button"))
      await expect(button).toHaveAttribute("aria-disabled", "true");
  },
};
