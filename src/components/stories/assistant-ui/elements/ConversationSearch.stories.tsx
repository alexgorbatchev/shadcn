import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { ConversationSearch } from "../../../assistant-ui/elements/ConversationSearch.js";
const meta: Meta<typeof ConversationSearch> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ConversationSearch",
  component: ConversationSearch,
  tags: ["autodocs", "test"],
  args: {
    query: "keyboard",
    activeIndex: 0,
    hits: [
      { id: "first", before: "Review the ", match: "keyboard", after: " controls.", position: 25 },
      { id: "second", before: "Test the ", match: "keyboard", after: " focus.", position: 75 },
    ],
    onQueryChange: fn(),
    onStep: fn(),
  },
  render: function Interactive(args) {
    const [query, setQuery] = useState(args.query);
    const [activeIndex, setActiveIndex] = useState(args.activeIndex);
    return (
      <ConversationSearch
        {...args}
        query={query}
        activeIndex={activeIndex}
        onQueryChange={
          args.onQueryChange &&
          ((value) => {
            args.onQueryChange?.(value);
            setQuery(value);
          })
        }
        onStep={
          args.onStep &&
          ((delta) => {
            args.onStep?.(delta);
            setActiveIndex((index) => (index + delta + args.hits.length) % args.hits.length);
          })
        }
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Matches: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("controls.")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Next match" }));
    await waitFor(() => expect(canvas.getByText("focus.")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("2/2")).toBeVisible());
    await expect(args.onStep).toHaveBeenLastCalledWith(1);
    await userEvent.click(canvas.getByRole("button", { name: "Previous match" }));
    await waitFor(() => expect(canvas.getByText("controls.")).toBeVisible());
    await expect(args.onStep).toHaveBeenLastCalledWith(-1);
    const input = canvas.getByRole("textbox", { name: "Find in conversation" });
    await userEvent.clear(input);
    await userEvent.type(input, "focus");
    await expect(input).toHaveValue("focus");
    await expect(args.onQueryChange).toHaveBeenLastCalledWith("focus");
  },
};
export const Empty: Story = {
  args: { hits: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("0")).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Next match" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Previous match" })).toBeDisabled();
  },
};
export const ReadOnly: Story = {
  args: { onQueryChange: undefined, onStep: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Find in conversation" })).toHaveAttribute("readonly");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
