import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThreadPrimitive } from "@assistant-ui/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Reasoning } from "../../../../assistant-ui/native/Reasoning.js";
import { NativeRuntimeFixture } from "../helpers.js";
import { ReasoningRefFixture } from "../fixtures/reasoningRef.js";

const meta: Meta<typeof Reasoning.Root> = {
  component: Reasoning.Root,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/reasoning/Reasoning",
  tags: ["autodocs", "test"],
  render: (args) => (
    <NativeRuntimeFixture>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Viewport>
          <Reasoning.Root {...args}>
            <Reasoning.Trigger>Reasoning details</Reasoning.Trigger>
            <Reasoning.Content>
              <Reasoning.Text>Inspect service health before proposing a change.</Reasoning.Text>
            </Reasoning.Content>
          </Reasoning.Root>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Disclosure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Reasoning" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByText("Inspect service health before proposing a change.")).toBeVisible());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  },
};
export const Streaming: Story = {
  args: { streaming: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Reasoning" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(within(canvasElement).getByText("Inspect service health before proposing a change.")).toBeVisible();
  },
};
export const ObjectRef: Story = {
  render: () => <ReasoningRefFixture kind="object" onAttach={fn()} onRelease={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Focus reasoning" }));
    await expect(canvas.getByTestId("Referenced reasoning")).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Remove reasoning" }));
    await expect(canvas.queryByTestId("Referenced reasoning")).not.toBeInTheDocument();
  },
};
export const CallbackRef: Story = {
  render: function Render() {
    const attach = fn();
    const release = fn();
    return <ReasoningRefFixture kind="callback" onAttach={attach} onRelease={release} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Ref state" })).toHaveTextContent("attached");
    await userEvent.click(canvas.getByRole("button", { name: "Reasoning" }));
    await waitFor(() => expect(canvas.getByText("Ref lifecycle details")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Remove reasoning" }));
    await expect(canvas.queryByTestId("Referenced reasoning")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status", { name: "Ref state" })).toHaveTextContent("released");
  },
};
export const CleanupRef: Story = {
  render: () => <ReasoningRefFixture kind="cleanup" onAttach={fn()} onRelease={fn()} />,
  play: CallbackRef.play,
};
