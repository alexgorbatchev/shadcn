import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerToolbar } from "../../../../assistant-ui/elements/ComposerToolbar.js";
import { ComposerAttachButton } from "../../../../assistant-ui/elements/ComposerAttachButton.js";
import { ComposerSend } from "../../../../assistant-ui/elements/ComposerSend.js";
const meta: Meta<typeof ComposerToolbar> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/composer/ComposerToolbar",
  component: ComposerToolbar,
  tags: ["autodocs", "test"],
  args: {
    children: (
      <>
        <ComposerAttachButton onClick={fn()} />
        <ComposerSend streaming={false} idle={false} />
      </>
    ),
    onClick: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Send message" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add attachment" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export { Default as ComposerToolbar };
