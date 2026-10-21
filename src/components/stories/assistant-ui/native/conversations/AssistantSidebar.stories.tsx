import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { AssistantSidebar } from "../../../../assistant-ui/native/AssistantSidebar.js";
import { NativeRuntimeFixture } from "../helpers.js";
import { SidebarPage } from "../fixtures/sidebarPage.js";

const meta: Meta<typeof AssistantSidebar> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/conversations/AssistantSidebar",
  component: AssistantSidebar,
  tags: ["test"],
  render: () => (
    <NativeRuntimeFixture>
      <AssistantSidebar>
        <SidebarPage />
      </AssistantSidebar>
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const PageAndChat: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole("button", { name: "Use project page" });
    await userEvent.click(button);
    await expect(button).toHaveFocus();
    await expect(canvas.getByRole("status", { name: "Page interactions" })).toHaveTextContent("1");
    await expect(canvas.getByRole("textbox", { name: "Message input" })).toBeVisible();
    await expect(canvas.getByRole("separator")).toBeVisible();
  },
};

export const KeyboardResize: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const separator = await canvas.findByRole("separator");
    const page = canvas.getByRole("main", { name: "Project page" });
    const originalWidth = page.getBoundingClientRect().width;
    await userEvent.click(canvas.getByRole("button", { name: "Use project page" }));
    await userEvent.tab();
    await expect(separator).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(page.getBoundingClientRect().width).toBeLessThan(originalWidth));
    await expect(canvas.getByRole("textbox", { name: "Message input" })).toBeVisible();
  },
};
