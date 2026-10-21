import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { McpServerPanel } from "../../../../assistant-ui/elements/McpServerPanel.js";

const meta: Meta<typeof McpServerPanel> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/tools-approvals/McpServerPanel",
  component: McpServerPanel,
  tags: ["autodocs", "test"],
  args: {
    servers: [
      { id: "files", name: "Files", transport: "stdio", status: "connected", tools: ["read_file", "write_file"] },
      { id: "remote", name: "Remote", transport: "http", status: "needs-auth", tools: ["search"] },
      { id: "pending", name: "Pending", transport: "http", status: "connecting", tools: [] },
      { id: "failed", name: "Unavailable", transport: "http", status: "failed", tools: [] },
    ],
    onToggle: fn(),
    onAuthorize: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const BrowseAndAuthorize: Story = {
  render: function Render(args) {
    const [expandedId, setExpandedId] = useState(args.expandedId);
    return (
      <McpServerPanel
        {...args}
        expandedId={expandedId}
        onToggle={(id) => {
          args.onToggle?.(id);
          setExpandedId((current) => (current === id ? undefined : id));
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("1 of 4 connected")).toBeVisible());
    const remote = canvas.getByRole("button", { name: /Remote/ });
    await userEvent.click(remote);
    await expect(remote).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(canvas.getByText("search")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Authorize" }));
    await expect(args.onAuthorize).toHaveBeenCalledWith("remote");
    await userEvent.click(remote);
    await expect(remote).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByText("search")).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  args: { expandedId: "files", onToggle: undefined, onAuthorize: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("read_file")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { servers: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("0 of 0 connected")).toBeVisible();
  },
};
