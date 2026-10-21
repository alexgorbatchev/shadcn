import type { Meta, StoryObj } from "@storybook/react-vite";
import { defaultDirectiveFormatter } from "@assistant-ui/react";

import { expect, fn, waitFor, within } from "storybook/test";
import { ComposerTriggerPopoverFixture, fixture_documentTriggerItem } from "./fixtures/triggers.js";

const meta: Meta<typeof ComposerTriggerPopoverFixture> = {
  component: ComposerTriggerPopoverFixture,
  title: "shadcn-alexgorbatchev/assistant-ui/native/ComposerTriggerPopover",
  tags: ["autodocs", "test"],
  args: { mode: "directive", onSelect: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const InsertDirective: Story = {
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", {
        name: "Message with mentions",
      });
      await userEvent.clear(input);
      await userEvent.type(input, "@");
    }
    await userEvent.click(await canvas.findByRole("option", { name: "Documents" }));
    await userEvent.click(await canvas.findByRole("option", { name: "README Project guide" }));
    await expect(args.onSelect).toHaveBeenCalledWith(fixture_documentTriggerItem);
    await waitFor(() =>
      expect(canvas.getByRole("textbox", { name: "Message with mentions" })).toHaveValue(
        `${defaultDirectiveFormatter.serialize(fixture_documentTriggerItem)} `,
      ),
    );
    await expect(canvas.queryByRole("option", { name: "README Project guide" })).not.toBeInTheDocument();
  },
};
export const ExecuteAction: Story = {
  args: { mode: "action" },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", {
        name: "Message with mentions",
      });
      await userEvent.clear(input);
      await userEvent.type(input, "@README");
    }
    await userEvent.click(await canvas.findByRole("option", { name: "README Project guide" }));
    await expect(args.onSelect).toHaveBeenCalledWith(fixture_documentTriggerItem);
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Message with mentions" })).toHaveValue(""));
  },
};
