import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AgentStatus } from "../../../../assistant-ui/native/AgentStatus.js";
import { NativeRuntimeFixture } from "../helpers.js";

const meta: Meta<typeof AgentStatus> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/agents-tasks/AgentStatus",
  component: AgentStatus,
  tags: ["autodocs", "test"],
  render: () => (
    <NativeRuntimeFixture
      initialMessages={[
        {
          role: "assistant",
          status: { type: "running" },
          content: [
            {
              type: "tool-call",
              toolCallId: "review",
              toolName: "delegate",
              args: { description: "Review the page" },
              argsText: '{"description":"Review the page"}',
              messages: [],
            },
          ],
        },
      ]}
    >
      <AgentStatus />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Running: Story = {
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("status")).toHaveTextContent("Review the page");
  },
};
export const Finished: Story = {
  render: () => (
    <NativeRuntimeFixture
      initialMessages={[
        {
          role: "assistant",
          status: { type: "complete", reason: "stop" },
          content: [
            {
              type: "tool-call",
              toolCallId: "review",
              toolName: "delegate",
              args: {},
              argsText: "{}",
              result: "Done",
              messages: [],
            },
          ],
        },
      ]}
    >
      <AgentStatus />
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("status")).not.toBeInTheDocument();
  },
};
export const NoTasks: Story = {
  render: () => (
    <NativeRuntimeFixture>
      <AgentStatus />
    </NativeRuntimeFixture>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("status")).not.toBeInTheDocument();
  },
};
