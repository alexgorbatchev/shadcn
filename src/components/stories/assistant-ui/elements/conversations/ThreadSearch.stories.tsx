import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ThreadSearch } from "../../../../assistant-ui/elements/ThreadSearch.js";
import { ShadowThreadSearchFixture } from "../fixtures/nz/ShadowThreadSearchFixture.js";
const meta: Meta<typeof ThreadSearch> = {
  component: ThreadSearch,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/ThreadSearch",
  render: (args) => <ThreadSearch {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof ThreadSearch>;
export const Default: Story = {
  args: {
    threads: [{ id: "one", title: "Workspace review", group: "Today", preview: "Source inspection", pinned: true }],
    query: "",
    activeId: "one",
    onQueryChange: fn(),
    onActiveChange: fn(),
    onSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("option", { name: /Workspace review/ }));
    await expect(args.onSelect).toHaveBeenCalledWith("one");
    await userEvent.type(canvas.getByRole("combobox", { name: "Search threads" }), "s");
    await expect(args.onQueryChange).toHaveBeenCalledWith("s");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const KeyboardNavigation: Story = {
  args: {
    threads: [
      { id: "one", title: "Workspace review", group: "Today", preview: "Source inspection", pinned: true },
      { id: "two", title: "Release", group: "Yesterday", preview: "Publish package" },
    ],
    query: "",
    activeId: "filtered",
    onActiveChange: fn(),
    onSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Search threads" });
    await expect(input).not.toHaveAttribute("aria-activedescendant");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    await expect(args.onActiveChange).toHaveBeenLastCalledWith("one");
    await userEvent.keyboard("{ArrowUp}");
    await expect(args.onActiveChange).toHaveBeenLastCalledWith("two");
    await userEvent.keyboard("{Enter}");
    await expect(args.onSelect).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("option", { name: "Release Publish package" }));
    await expect(args.onSelect).toHaveBeenCalledWith("two");
  },
};
export const SelectActiveWithEnter: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox", { name: "Search threads" }));
    await userEvent.keyboard("{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("one");
  },
};
export const NoMatches: Story = {
  args: { threads: [], query: "missing", activeId: "", onActiveChange: fn(), onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("No thread matches “missing”");
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{Enter}");
    await expect(args.onActiveChange).not.toHaveBeenCalled();
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};
export const ReadOnlyResults: Story = {
  args: { ...KeyboardNavigation.args, activeId: "one", onSelect: undefined, onActiveChange: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("option", { name: "Workspace review Source inspection" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("option", { name: "Release Publish package" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{Enter}a");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const KeyboardScrollInShadowRoot: Story = {
  render: () => <ShadowThreadSearchFixture />,
  play: async ({ canvasElement }) => {
    const host = within(canvasElement).getByTestId("ShadowThreadSearchFixture");
    const content = host.shadowRoot?.querySelector<HTMLElement>('[data-testid="ShadowThreadSearchFixture--content"]');
    if (!content) throw new Error("Expected the native shadow-root search fixture");
    const canvas = within(content);
    const viewport = canvas.getByTestId("ThreadSearch");
    await userEvent.click(canvas.getByRole("combobox", { name: "Search threads" }));
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("option", { name: "Thread 23 Conversation 23" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
  },
};
