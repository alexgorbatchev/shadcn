import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import { McpConfigDialog } from "../../../assistant-ui/native/McpConfigDialog.js";
import { NativeRuntimeFixture } from "./helpers.js";
import { fixture_mcpConfig } from "./fixtures/mcp.js";
const meta: Meta<typeof McpConfigDialog> = {
  title: "shadcn-alexgorbatchev/assistant-ui/native/McpConfigDialog",
  component: McpConfigDialog,
  tags: ["test"],
  render: (args) => (
    <NativeRuntimeFixture config={fixture_mcpConfig}>
      <McpConfigDialog {...args} />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const CancelForm: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "MCP servers" }));
    const dialog = await canvas.findByRole("dialog", { name: "MCP servers" });
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Add server" }));
    await expect(canvas.getByRole("textbox", { name: "Name" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(canvas.queryByRole("textbox", { name: "Name" })).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole("button", { name: "Add server" })).toHaveFocus());
  },
};
export const AuthFields: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "MCP servers" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Add server" }));
    await expect(canvas.getByRole("option", { name: "OAuth" })).toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Auth" }), "bearer");
    await expect(canvas.getByLabelText("Bearer token")).toBeVisible();
    await expect(canvas.queryByLabelText("OAuth scopes")).not.toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Auth" }), "none");
    await expect(canvas.queryByLabelText("Bearer token")).not.toBeInTheDocument();
  },
};
export const Validation: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "MCP servers" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Add server" }));
    await userEvent.click(canvas.getByRole("button", { name: "Add server" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Name is required");
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveAttribute("aria-invalid", "true");
  },
};
export const AddAndRemove: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "MCP servers" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Add server" }));
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Name" });
      await userEvent.clear(input);
      await userEvent.type(input, "Local inspection");
    }
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "URL" });
      await userEvent.clear(input);
      await userEvent.type(input, "https://example.com/mcp");
    }
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Auth" }), "none");
    await userEvent.click(canvas.getByRole("button", { name: "Add server" }));
    await expect(await canvas.findByText("Local inspection")).toBeVisible();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Add server" })).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(canvas.queryByText("Local inspection")).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Add server" })).toHaveFocus();
  },
};
