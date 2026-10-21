import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CommandPalette } from "../../../../assistant-ui/elements/CommandPalette.js";

const meta: Meta<typeof CommandPalette> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/composer/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs", "test"],
  args: {
    commands: [
      { id: "new", label: "New conversation", group: "Conversations", keys: ["Ctrl", "N"] },
      { id: "export", label: "Export conversation", group: "Conversations", keys: [] },
      { id: "settings", label: "Open settings", group: "Settings", keys: ["Ctrl", ","] },
    ],
    query: "",
    activeId: "new",
    onQueryChange: fn(),
    onActiveChange: fn(),
    onRun: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const SearchAndRun: Story = {
  render: function Render(args) {
    const [query, setQuery] = useState(args.query);
    const [activeId, setActiveId] = useState(args.activeId);
    return (
      <CommandPalette
        {...args}
        query={query}
        activeId={activeId}
        onQueryChange={(value) => {
          args.onQueryChange?.(value);
          setQuery(value);
        }}
        onActiveChange={(id) => {
          args.onActiveChange?.(id);
          setActiveId(id);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Type a command" });
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onRun).toHaveBeenCalledWith("export");
    await userEvent.type(input, "settings");
    await expect(canvas.queryByRole("option", { name: "Export conversation" })).not.toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onRun).toHaveBeenLastCalledWith("settings");
  },
};
export const NoMatches: Story = {
  args: { query: "missing" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("No command matches “missing”")).toBeVisible();
    await expect(within(canvasElement).queryByRole("option")).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  args: { onRun: undefined, onQueryChange: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox", { name: "Type a command" })).toHaveAttribute("readonly");
  },
};
