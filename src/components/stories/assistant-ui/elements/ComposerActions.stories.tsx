import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerActions } from "../../../assistant-ui/elements/ComposerActions.js";
import { ComposerAttachButton } from "../../../assistant-ui/elements/ComposerAttachButton.js";
import { ComposerVoiceButton } from "../../../assistant-ui/elements/ComposerVoiceButton.js";
const meta: Meta<typeof ComposerActions> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ComposerActions",
  component: ComposerActions,
  tags: ["autodocs", "test"],
  args: {
    children: (
      <>
        <ComposerAttachButton onClick={fn()} />
        <ComposerVoiceButton active={false} />
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
    await expect(canvas.getByRole("button", { name: "Start voice input" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add attachment" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export { Default as ComposerActions };
