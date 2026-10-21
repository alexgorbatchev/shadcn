import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThreadPrimitive } from "@assistant-ui/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ToolGroupRoot, ToolGroupTrigger, ToolGroupContent } from "../../../assistant-ui/native/ToolGroup.js";
import { NativeRuntimeFixture } from "./helpers.js";
const meta: Meta<typeof ToolGroupRoot> = {
  component: ToolGroupRoot,
  title: "shadcn-alexgorbatchev/assistant-ui/native/ToolGroup",
  tags: ["autodocs", "test"],
  args: { onOpenChange: fn() },
  render: (args) => (
    <NativeRuntimeFixture>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Viewport>
          <ToolGroupRoot {...args}>
            <ToolGroupTrigger count={2} />
            <ToolGroupContent>Inspected documentation and service status.</ToolGroupContent>
          </ToolGroupRoot>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Disclosure: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "2 tool calls" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByText("Inspected documentation and service status.")).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};
export const ControlledOpen: Story = {
  args: { open: true, variant: "muted" },
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "2 tool calls" });
    await userEvent.click(trigger);
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
