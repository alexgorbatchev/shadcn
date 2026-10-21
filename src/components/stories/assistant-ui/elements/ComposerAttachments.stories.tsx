import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerAttachments } from "../../../assistant-ui/elements/ComposerAttachments.js";
import { ComposerAttachmentChip } from "../../../assistant-ui/elements/ComposerAttachmentChip.js";
import { fixture_composerAttachment } from "./fixtures.js";
const meta: Meta<typeof ComposerAttachments> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerAttachments",
  component: ComposerAttachments,
  tags: ["autodocs", "test"],
  args: { children: <ComposerAttachmentChip attachment={fixture_composerAttachment} onRemove={fn()} />, onClick: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Files: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Layout.tsx")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remove Layout.tsx" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Empty: Story = {
  args: { children: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("ComposerAttachments")).toBeEmptyDOMElement();
  },
};
