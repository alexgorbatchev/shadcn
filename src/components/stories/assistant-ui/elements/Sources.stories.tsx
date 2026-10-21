import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { Sources } from "../../../assistant-ui/elements/Sources.js";
const meta: Meta<typeof Sources> = {
  component: Sources,
  render: (args) => <Sources {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/Sources",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    sources: [
      {
        title: "Official documentation",
        url: "https://example.com/docs",
        author: "Maintainers",
        publishedAt: "2026-01-01",
        snippet: "Reference for the public API",
      },
    ],
    open: true,
    onOpenChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("link", { name: /Official documentation/ })).toHaveAttribute(
      "href",
      "https://example.com/docs",
    );
    await userEvent.click(canvas.getByRole("button", { name: /Sources/ }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
export const List: Story = {
  ...Default,
  args: { ...Default.args, layout: "list" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("link", { name: /Official documentation/ })).toHaveAttribute("target", "_blank");
  },
};
export const WithoutDisclosureTrigger: Story = {
  ...Default,
  args: { ...Default.args, hideTrigger: true },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /Official documentation/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };

export const UnlinkedSources: Story = {
  args: {
    open: true,
    onOpenChange: fn(),
    sources: [
      { title: "Local notes", snippet: "A local reference", publishedAt: "invalid" },
      { title: "Unsafe link", url: "javascript:alert(1)" },
      { title: "Named archive", domain: "example.com" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Local notes")).toBeVisible();
    await expect(canvas.getByText("A local reference")).toBeVisible();
    await expect(canvas.getByText("Unsafe link")).toBeVisible();
    await expect(canvas.getByText("Named archive")).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Invalid Date")).not.toBeInTheDocument();
  },
};
export const UnlinkedList: Story = {
  ...UnlinkedSources,
  args: { ...UnlinkedSources.args, layout: "list" },
  play: UnlinkedSources.play,
};
export const MissingDomains: Story = {
  ...UnlinkedSources,
  args: { ...UnlinkedSources.args, sources: [{ title: "Local notes" }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Sources 1" })).toBeVisible();
    await expect(canvas.getByText("Local notes")).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const InvalidLocale: Story = {
  ...Default,
  args: {
    ...Default.args,
    locale: "invalid_locale",
    sources: [{ title: "Dated source", author: "Maintainers", publishedAt: "2026-01-15T12:00:00Z" }],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Maintainers · Jan 2026")).toBeVisible();
  },
};
