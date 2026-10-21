import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ToolFallbackRoot } from "../../../assistant-ui/native/ToolFallbackRoot.js";
import { Thread } from "../../../assistant-ui/native/Thread.js";
import { NativeRuntimeFixture } from "./helpers.js";
import { fixture_toolCallMessages } from "./fixtures.js";
import { ToolFallbackFixture } from "./fixtures/toolFallback.js";

const meta: Meta<typeof ToolFallbackRoot> = {
  component: ToolFallbackRoot,
  title: "shadcn-alexgorbatchev/assistant-ui/native/ToolFallbackRoot",
  tags: ["autodocs", "test"],
  render: () => (
    <NativeRuntimeFixture initialMessages={fixture_toolCallMessages}>
      <Thread />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const InspectToolResult: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "1 tool call" }));
    const trigger = await canvas.findByRole("button", { name: "Used tool: inspect_service" });
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByText('{"service":"docs"}')).toBeVisible());
    await expect(canvas.getByText(/"healthy": true/)).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
export const Running: Story = {
  render: () => <ToolFallbackFixture status={{ type: "running" }} argsText="Inspect the workspace" durationMs={500} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Running tool: inspect <1s" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await waitFor(() => expect(canvas.getByText("Inspect the workspace")).toBeVisible());
    await expect(canvas.queryByText("Result:")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  },
};
export const Waiting: Story = {
  render: () => (
    <ToolFallbackFixture
      status={{ type: "requires-action", reason: "tool-calls" }}
      result="Waiting for review"
      durationMs={1500}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Waiting on tool: inspect 1.5s" })).toBeVisible();
    await waitFor(() => expect(canvas.getByText("Waiting for review")).toBeVisible());
  },
};
export const Cancelled: Story = {
  render: () => (
    <ToolFallbackFixture
      status={{ type: "incomplete", reason: "cancelled", error: "Cancelled by operator" }}
      durationMs={12000}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Cancelled tool: inspect 12s" })).toBeVisible();
    await waitFor(() => expect(canvas.getByText("Cancelled reason:")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Cancelled by operator")).toBeVisible());
  },
};
export const Failed: Story = {
  render: () => (
    <ToolFallbackFixture
      status={{ type: "incomplete", reason: "error", error: new Error("Inspection failed") }}
      durationMs={61000}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Failed tool: inspect 1m 1s" })).toBeVisible();
    await waitFor(() => expect(canvas.getByText("Error: Inspection failed")).toBeVisible());
  },
};
export const Queued: Story = {
  render: () => <ToolFallbackFixture responseDeliveryStatus="queued" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Reply queued, not sent yet: inspect" })).toBeVisible();
    await expect(canvas.queryByText("Error:")).not.toBeInTheDocument();
  },
};
export const FailedWithoutDetails: Story = {
  render: () => <ToolFallbackFixture status={{ type: "incomplete", reason: "error", error: null }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Failed tool: inspect" })).toBeVisible();
    await expect(canvas.queryByText("Error:")).not.toBeInTheDocument();
  },
};
