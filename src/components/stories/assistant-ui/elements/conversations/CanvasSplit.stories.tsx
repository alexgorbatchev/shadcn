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
} from "../../../../assistant-ui/elements/CanvasSplit.js";
const meta: Meta<typeof CanvasSplitHeader> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/CanvasSplit",
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

const fillRender: Story["render"] = (args) => (
  <CanvasSplit layout="fill">
    <CanvasSplitThread aria-label="Thread">
      {Array.from({ length: 24 }, (_, index) => (
        <CanvasSplitMessage key={index} speaker={index % 2 === 0 ? "user" : "assistant"}>
          Message {index + 1}
        </CanvasSplitMessage>
      ))}
    </CanvasSplitThread>
    <CanvasSplitDocument aria-label="Document">
      <CanvasSplitHeader {...args} />
      <CanvasSplitBody aria-label="Document body">
        {Array.from({ length: 40 }, (_, index) => (
          <CanvasSplitLine key={index}>Line {index + 1}</CanvasSplitLine>
        ))}
      </CanvasSplitBody>
    </CanvasSplitDocument>
  </CanvasSplit>
);

function panesOf(canvasElement: HTMLElement): { root: DOMRect; thread: HTMLElement; body: HTMLElement } {
  return {
    root: canvasElement.querySelector("[data-slot=canvas-split]")!.getBoundingClientRect(),
    thread: canvasElement.querySelector<HTMLElement>("[data-slot=canvas-split-thread]")!,
    body: canvasElement.querySelector<HTMLElement>("[data-slot=canvas-split-body]")!,
  };
}

export const FillSideBySide: Story = {
  decorators: [
    (Story) => (
      <div className="h-[400px] w-[960px]" data-scroll="none">
        <Story />
      </div>
    ),
  ],
  render: fillRender,
  play: async ({ canvasElement }) => {
    const { root, thread, body } = panesOf(canvasElement);
    await expect(root.width).toBeCloseTo(960, 0);
    await expect(root.height).toBeCloseTo(400, 0);
    const threadBounds = thread.getBoundingClientRect();
    await expect(threadBounds.width).toBeGreaterThanOrEqual(320);
    await expect(threadBounds.width).toBeLessThanOrEqual(440);
    await expect(threadBounds.height).toBeCloseTo(400, 0);
    await expect(body.getBoundingClientRect().left).toBeGreaterThanOrEqual(threadBounds.right - 1);
    await expect(body.getBoundingClientRect().bottom).toBeCloseTo(root.bottom, 0);
    await expect(thread.scrollHeight).toBeGreaterThan(thread.clientHeight);
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = body.scrollHeight;
    await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0));
    await expect(thread.scrollTop).toBe(0);
  },
};

export const FillStacked: Story = {
  decorators: [
    (Story) => (
      <div className="h-[520px] w-[360px]" data-scroll="none">
        <Story />
      </div>
    ),
  ],
  render: fillRender,
  play: async ({ canvasElement }) => {
    const { root, thread, body } = panesOf(canvasElement);
    const threadBounds = thread.getBoundingClientRect();
    await expect(threadBounds.width).toBeCloseTo(root.width, 0);
    await expect(body.getBoundingClientRect().top).toBeGreaterThanOrEqual(threadBounds.bottom);
    await expect(body.getBoundingClientRect().bottom).toBeCloseTo(root.bottom, 0);
    await expect(thread.scrollHeight).toBeGreaterThan(thread.clientHeight);
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  },
};

export const CardSize: Story = {
  decorators: [
    (Story) => (
      <div className="w-[960px]">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector("[data-slot=canvas-split]")!;
    await expect(root).toHaveAttribute("data-layout", "card");
    await expect(root.getBoundingClientRect().width).toBeCloseTo(768, 0);
    const thread = canvasElement.querySelector("[data-slot=canvas-split-thread]")!.getBoundingClientRect();
    await expect(thread.width).toBeCloseTo(240, 0);
    await expect(thread.height).toBeCloseTo(320, 0);
  },
};
