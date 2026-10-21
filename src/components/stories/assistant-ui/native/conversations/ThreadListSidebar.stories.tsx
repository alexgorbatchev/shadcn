import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { SidebarProvider } from "../../../../Sidebar.js";
import { ThreadListSidebar } from "../../../../assistant-ui/native/ThreadListSidebar.js";
import { NativeRuntimeFixture } from "../helpers.js";

const meta: Meta<typeof ThreadListSidebar> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/conversations/ThreadListSidebar",
  component: ThreadListSidebar,
  tags: ["test"],
  args: { collapsible: "none" },
  render: (args) => (
    <NativeRuntimeFixture>
      <SidebarProvider>
        <ThreadListSidebar {...args} />
      </SidebarProvider>
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Navigation: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const home = await canvas.findByRole("link", { name: "assistant-ui" });
    await expect(home).toHaveAttribute("href", "https://assistant-ui.com");
    await expect(home).toHaveAttribute("rel", "noopener noreferrer");
    await expect(canvas.getByRole("link", { name: "GitHub View Source" })).toHaveAttribute(
      "href",
      "https://github.com/assistant-ui/assistant-ui",
    );
    const newThread = canvas.getByRole("button", { name: "New Thread" });
    await userEvent.click(newThread);
    await expect(newThread).toHaveFocus();
  },
};
