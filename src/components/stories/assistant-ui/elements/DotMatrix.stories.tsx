import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { DotMatrix } from "../../../assistant-ui/elements/DotMatrix.js";

const meta: Meta<typeof DotMatrix> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/DotMatrix",
  component: DotMatrix,
  tags: ["autodocs", "test"],
  render: (args) => <DotMatrix {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {
  args: { state: "loading", label: "Agent working" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("Agent working");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
    await expect(document.head.querySelector("style[href=aui-dot-matrix]")).not.toBeInTheDocument();
  },
};
export const Success: Story = {
  args: { state: "success" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("success");
    await expect(canvas.getByRole("status").getAnimations({ subtree: true })).toHaveLength(0);
  },
};

export const Thinking: Story = {
  args: { state: "thinking" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("thinking");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Streaming: Story = {
  args: { state: "streaming" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("streaming");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Searching: Story = {
  args: { state: "searching" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("searching");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Syncing: Story = {
  args: { state: "syncing" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("syncing");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Connecting: Story = {
  args: { state: "connecting" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("connecting");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Waiting: Story = {
  args: { state: "waiting" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("waiting");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Uploading: Story = {
  args: { state: "uploading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("uploading");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Downloading: Story = {
  args: { state: "downloading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("downloading");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Listening: Story = {
  args: { state: "listening" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("listening");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Speaking: Story = {
  args: { state: "speaking" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("speaking");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Recording: Story = {
  args: { state: "recording" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("recording");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Error: Story = {
  args: { state: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("error");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Warning: Story = {
  args: { state: "warning" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("warning");
    await waitFor(() =>
      expect(status.getAnimations({ subtree: true }).length > 0).toBe(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
  },
};

export const Idle: Story = {
  args: { state: "idle" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("idle");
    await waitFor(() => expect(status.getAnimations({ subtree: true }).length).toBe(0));
  },
};

export const Info: Story = {
  args: { state: "info" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("info");
    await waitFor(() => expect(status.getAnimations({ subtree: true }).length).toBe(0));
  },
};

export const Paused: Story = {
  args: { state: "paused" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("paused");
    await waitFor(() => expect(status.getAnimations({ subtree: true }).length).toBe(0));
  },
};

export const Stopped: Story = {
  args: { state: "stopped" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("stopped");
    await waitFor(() => expect(status.getAnimations({ subtree: true }).length).toBe(0));
  },
};

export const Offline: Story = {
  args: { state: "offline" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("offline");
    await waitFor(() => expect(status.getAnimations({ subtree: true }).length).toBe(0));
  },
};
