import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { TaskCard } from "../../../../assistant-ui/native/TaskCard.js";
import { NativeTaskFixture } from "../fixtures/nz/NativeTaskFixture.js";
import { TaskPartFixture, fixture_nestedTaskMessages } from "../fixtures/taskPart.js";
const meta: Meta<typeof TaskCard> = {
  component: TaskCard,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/agents-tasks/TaskCard",
  tags: ["autodocs", "test"],
  render: () => <NativeTaskFixture />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Completed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/checked/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /Inspect service 1/ }));
    await expect(canvas.getByText("Inspection completed in the nested agent.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /Inspect service 1/ }));
    await expect(canvas.queryByText("Inspection completed in the nested agent.")).not.toBeInTheDocument();
  },
};
export const Failed: Story = {
  render: () => <NativeTaskFixture state="failed" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Permission denied")).toBeVisible();
    await expect(canvas.getByText("failed")).toBeInTheDocument();
  },
};
export const Cancelled: Story = {
  render: () => <NativeTaskFixture state="cancelled" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("cancelled")).toBeInTheDocument();
  },
};
export const Waiting: Story = {
  render: () => <NativeTaskFixture state="waiting" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("waiting")).toBeInTheDocument();
  },
};
export const CompactDark: Story = {
  ...Completed,
  globals: { theme: "dark", density: "compact" },
  play: Completed.play,
};
export const ComfortableLight: Story = {
  ...Completed,
  globals: { theme: "light", density: "comfortable" },
  play: Completed.play,
};
export const TextResultAndTiming: Story = {
  render: () => (
    <TaskPartFixture part={{ result: "Review complete", timing: { startedAt: 1000, completedAt: 3500 } }} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Review complete")).toBeVisible());
    await expect(canvas.getByText("2.5s")).toBeVisible();
  },
};
export const ErrorWithoutResult: Story = {
  render: () => (
    <TaskPartFixture part={{ status: { type: "incomplete", reason: "error", error: "Review unavailable" } }} />
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText("Review unavailable")).toBeVisible());
  },
};
export const ApprovalRequest: Story = {
  args: {},
  render: () => (
    <TaskPartFixture
      part={{
        status: { type: "requires-action", reason: "tool-calls" },
        approval: { id: "task-review", prompt: "Review this change?" },
        respondToApproval: fn(),
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Review this change?")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Allow" }));
    await expect(canvas.getByRole("button", { name: "Allow" })).toBeDisabled();
  },
};
export const NestedTools: Story = {
  render: () => <TaskPartFixture part={{ messages: fixture_nestedTaskMessages }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: /Review workspace/ }));
    await expect(await canvas.findByRole("button", { name: /Review nested service/ })).toBeDisabled();
    await waitFor(() => expect(canvas.getByText("Nested review complete")).toBeVisible());
    await expect(canvas.getByRole("button", { name: /inspect/ })).toBeVisible();
  },
};
