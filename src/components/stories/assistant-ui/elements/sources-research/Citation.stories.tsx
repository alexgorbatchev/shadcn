import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { Citation } from "../../../../assistant-ui/elements/Citation.js";
import { CitationFixture } from "../fixtures/nz/CitationFixture.js";
const meta: Meta<typeof Citation> = {
  component: Citation,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/sources-research/Citation",
  args: {
    index: 0,
    source: {
      title: "Workspace design",
      snippet: "The source describes the workspace boundary.",
      url: "https://example.com/design",
      publishedAt: "2026-06-12",
    },
    onOpenChange: fn(),
  },
  render: (args) => (
    <CitationFixture>
      <Citation {...args} />
    </CitationFixture>
  ),
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const HoverToPreview: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Source 1: Workspace design" }));
    await canvas.findByText("The source describes the workspace boundary.");
    await waitFor(() => expect(canvas.getByText("The source describes the workspace boundary.")).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  },
};
export const OpenSource: Story = {
  args: { open: true },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Jun 2026")).toBeVisible());
    await expect(canvas.getByRole("link", { name: "Open source (opens in a new tab)" })).toHaveAttribute(
      "href",
      "https://example.com/design",
    );
  },
};
export const UnsafeUrl: Story = {
  args: {
    open: true,
    source: {
      title: "Untrusted result",
      snippet: "A source without a safe navigation target.",
      url: "javascript:alert(1)",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("A source without a safe navigation target.")).toBeVisible());
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const InvalidDate: Story = {
  args: {
    open: true,
    source: { title: "Undated result", snippet: "No publication date is available.", publishedAt: "invalid" },
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("No publication date is available.")).toBeVisible());
    await expect(canvas.queryByText("Invalid Date")).not.toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...OpenSource, globals: { theme: "light" }, play: OpenSource.play };
export const DarkTheme: Story = { ...OpenSource, globals: { theme: "dark" }, play: OpenSource.play };
