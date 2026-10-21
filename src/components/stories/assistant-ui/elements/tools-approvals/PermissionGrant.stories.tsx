import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, fn, userEvent } from "storybook/test";
import { PermissionGrant } from "../../../../assistant-ui/elements/PermissionGrant.js";
const meta: Meta<typeof PermissionGrant> = {
  component: PermissionGrant,
  render: (args) => <PermissionGrant {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/tools-approvals/PermissionGrant",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    capability: "Read project files",
    requester: "Research agent",
    reach: ["Project source files"],
    scope: "pending",
    onGrant: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Project source files")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "This session" }));
    await expect(args.onGrant).toHaveBeenCalledWith("session");
  },
};
export const Session: Story = {
  ...Default,
  args: { ...Default.args, scope: "session" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("granted · session")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Always: Story = {
  ...Default,
  args: { ...Default.args, scope: "always" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("granted · always")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Denied: Story = {
  ...Default,
  args: { ...Default.args, scope: "denied" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("denied")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const PendingReadOnly: Story = {
  ...Default,
  args: { ...Default.args, onGrant: undefined },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("pending", { exact: true })).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
