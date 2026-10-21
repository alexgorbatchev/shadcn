import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ConversationMap } from "../../../../assistant-ui/elements/ConversationMap.js";

const meta: Meta<typeof ConversationMap> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/ConversationMap",
  component: ConversationMap,
  tags: ["autodocs", "test"],
  args: {
    entries: [
      { id: "start", title: "Planning", preview: "Gather the requirements." },
      { id: "middle", title: "Implementation", preview: "Build the requested feature." },
      { id: "end", title: "Verification", preview: "Check the result." },
    ],
    activeId: "middle",
    visibleIds: ["start", "middle"],
    onSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-48">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Navigate: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getByRole("button", { name: "Implementation" });
    await expect(current).toHaveAttribute("aria-current", "true");
    current.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("button", { name: "Verification" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("button", { name: "Planning" })).toHaveFocus();
    await userEvent.keyboard("{End}{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("end");
    await userEvent.keyboard("{ArrowUp}");
    await expect(current).toHaveFocus();
  },
};

export const PreviewOnly: Story = {
  args: { onSelect: undefined, side: "left" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Planning" });
    await userEvent.hover(trigger);
    const preview = await within(canvasElement.ownerDocument.body).findByText("Gather the requirements.");
    await waitFor(() => expect(preview).toBeVisible());
    await userEvent.unhover(trigger);
  },
};

export const Empty: Story = {
  args: { entries: [], activeId: undefined },
  play: async ({ canvasElement }) => {
    const navigation = within(canvasElement).getByRole("navigation", { name: "Conversation map" });
    await expect(within(navigation).queryByRole("button")).not.toBeInTheDocument();
  },
};
