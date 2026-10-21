import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { PromptLibrary } from "../../../assistant-ui/elements/PromptLibrary.js";
import { PromptLibraryFixture } from "./fixtures/promptLibrary.js";
const meta: Meta<typeof PromptLibrary> = {
  component: PromptLibrary,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/PromptLibrary",
  render: (args) => <PromptLibrary {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    prompts: [{ id: "review", name: "Source review", body: "Review {{file}} for correctness", variables: ["file"] }],
    query: "",
    selectedId: "review",
    onQueryChange: fn(),
    onSelect: fn(),
    onInsert: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("option", { name: /Source review/ }));
    await expect(args.onSelect).toHaveBeenCalledWith("review");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const KeyboardSearchAndInsert: Story = {
  render: () => <PromptLibraryFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("combobox", { name: "Search saved prompts" });
    await userEvent.click(search);
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("option", { name: "Review" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("option", { name: "Fix 2 vars" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Inserted prompt" })).toHaveTextContent("fix");
    await userEvent.type(search, "Review");
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("option", { name: "Review" })).toHaveAttribute("aria-selected", "true");
    await userEvent.dblClick(canvas.getByRole("option", { name: "Review" }));
    await expect(canvas.getByRole("status", { name: "Inserted prompt" })).toHaveTextContent("review");
    await userEvent.clear(search);
    await userEvent.type(search, "nothing");
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{Enter}");
    await expect(canvas.getByText("Nothing matches “nothing”")).toBeVisible();
    await expect(canvas.getByRole("combobox")).toHaveAttribute("aria-expanded", "false");
  },
};
export const InsertWithoutSelection: Story = {
  args: { ...Default.args, onSelect: undefined, onQueryChange: undefined },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("option", { name: "Source review 1 var" }));
    await expect(args.onInsert).toHaveBeenCalledWith("review");
  },
};
export const ReadOnly: Story = {
  args: { ...Default.args, onSelect: undefined, onInsert: undefined, onQueryChange: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("option", { name: "Source review 1 var" })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(canvas.getByText("Review {{file}} for correctness")).toBeVisible());
  },
};
