import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  CanvasSplit,
  CanvasSplitBody,
  CanvasSplitDocument,
  CanvasSplitHeader,
  CanvasSplitLine,
  CanvasSplitMessage,
  CanvasSplitThread,
} from "../../../assistant-ui/elements/CanvasSplit.js";
const meta: Meta<typeof CanvasSplitHeader> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/CanvasSplit",
  component: CanvasSplitHeader,
  tags: ["autodocs", "test"],
  args: { title: "Service guide", version: 2, saved: true, onCopy: fn(), onClose: fn() },
  render: (args) => (
    <CanvasSplit>
      <CanvasSplitThread>
        <CanvasSplitMessage speaker="user">Write a guide</CanvasSplitMessage>
        <CanvasSplitMessage speaker="assistant">Here is the draft.</CanvasSplitMessage>
      </CanvasSplitThread>
      <CanvasSplitDocument>
        <CanvasSplitHeader {...args} />
        <CanvasSplitBody writing={!args.saved}>
          <CanvasSplitLine heading>Service operations</CanvasSplitLine>
          <CanvasSplitLine>Inspect logs before restarting.</CanvasSplitLine>
        </CanvasSplitBody>
      </CanvasSplitDocument>
    </CanvasSplit>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Actions: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Copy Service guide" }));
    await expect(args.onCopy).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Close the canvas" }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText("saved")).toBeVisible();
  },
};
export const Editing: Story = {
  args: { saved: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("editing")).toBeVisible();
    await expect(canvas.queryByText("saved")).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText("Inspect logs before restarting.")).toBeVisible());
  },
};
export const ReadOnly: Story = {
  args: { onCopy: undefined, onClose: undefined },
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole("button")) await expect(button).toBeDisabled();
  },
};
