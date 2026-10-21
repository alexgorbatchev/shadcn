import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ApprovalCard } from "../../../assistant-ui/elements/ApprovalCard.js";

const meta: Meta<typeof ApprovalCard> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ApprovalCard",
  component: ApprovalCard,
  tags: ["autodocs", "test"],
  args: {
    state: "request",
    title: "Update the selected component",
    subtitle: "Codex requests permission",
    command: "Apply the layout change",
    onAllowOnce: fn(),
    onAlwaysAllow: fn(),
    onDeny: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Request: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Allow once" }));
    await expect(args.onAllowOnce).toHaveBeenCalledTimes(1);
    await expect(args.onAlwaysAllow).not.toHaveBeenCalled();
    await expect(args.onDeny).not.toHaveBeenCalled();
  },
};

export const Destructive: Story = {
  args: { variant: "destructive", description: "Remove the selected element from the page." },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Update the selected component" })).toHaveAccessibleDescription(
      "Remove the selected element from the page.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Deny" }));
    await expect(args.onDeny).toHaveBeenCalledTimes(1);
    await expect(args.onAllowOnce).not.toHaveBeenCalled();
  },
};

export const AllowForSession: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Always allow" }));
    await expect(args.onAlwaysAllow).toHaveBeenCalledTimes(1);
  },
};

export const Running: Story = {
  args: { state: "running" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Approved, running");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const Done: Story = {
  args: { state: "done", details: [{ label: "File", value: "src/Layout.tsx" }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Finished");
    await expect(canvas.getByText("src/Layout.tsx")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const Denied: Story = {
  args: { state: "denied", statusLabel: "Change declined" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Change declined");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const LightTheme: Story = { ...Request, globals: { theme: "light" } };
export const DarkTheme: Story = { ...Request, globals: { theme: "dark" } };
