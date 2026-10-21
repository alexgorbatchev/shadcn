import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { RegenerateMenu } from "../../../assistant-ui/elements/RegenerateMenu.js";
import { RegenerateMenuFixture } from "./fixtures/nz/RegenerateMenuFixture.js";
const meta: Meta<typeof RegenerateMenu> = {
  component: RegenerateMenu,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/RegenerateMenu",
  render: (args) => <RegenerateMenu {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    options: [
      { id: "fast", label: "Fast model", detail: "Short answers" },
      { id: "deep", label: "Deep model", detail: "Detailed reasoning" },
    ],
    open: true,
    currentId: "fast",
    onOpenChange: fn(),
    onPick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole("menuitem", { name: /Deep model/ }));
    await expect(args.onPick).toHaveBeenCalledWith("deep");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const KeyboardSelection: Story = {
  ...Default,
  render: (args) => <RegenerateMenuFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const popup = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Regenerate with a different model" }));
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(popup.getByRole("menuitem", { name: /Fast model/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onPick).toHaveBeenCalledWith("deep");
    await waitFor(() => expect(popup.queryByRole("menu")).not.toBeInTheDocument());
  },
};
export const EscapeDismissal: Story = {
  ...Default,
  render: (args) => <RegenerateMenuFixture {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const popup = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Regenerate with a different model" });
    await userEvent.click(trigger);
    await waitFor(() => expect(popup.getByRole("menu")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
