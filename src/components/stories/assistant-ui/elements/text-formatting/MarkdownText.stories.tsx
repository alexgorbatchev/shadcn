import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import { NativeMarkdownFixture } from "../../native/helpers.js";
import { MarkdownText } from "../../../../assistant-ui/elements/MarkdownText.js";
import { MarkdownHeading } from "../helpers.js";
const meta: Meta<typeof MarkdownText> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/text-formatting/MarkdownText",
  component: MarkdownText,
  tags: ["autodocs", "test"],
  args: {
    text: "# Service guide\n\nRead the **status** and [reference](https://example.com).\n\n- Inspect\n- Verify\n\n| Service | State |\n| --- | --- |\n| API | Ready |",
  },
  render: (args) => <NativeMarkdownFixture text={args.text ?? ""} components={args.components} />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const RichText: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("heading", { level: 1, name: "Service guide" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "reference" })).toHaveAttribute("href", "https://example.com");
    await expect(canvas.getByRole("table")).toHaveTextContent("APIReady");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};
export const CopyCode: Story = {
  args: { text: "```javascript\nconsole.log(4)\n```" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Copy" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Copied" })).toBeVisible());
  },
};
export const CustomHeading: Story = {
  args: { text: "# Custom heading", components: { h1: MarkdownHeading } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("heading", { level: 2, name: "Custom heading" })).toBeVisible();
    await expect(within(canvasElement).queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  },
};
export const SafeHtml: Story = {
  args: { text: "<script>alert('unsafe')</script>\n\n[Unsafe](javascript:alert(1))" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Unsafe")).toBeVisible();
    await expect(canvas.getByText("Unsafe")).not.toHaveAttribute("href", "javascript:alert(1)");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
