import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { DirectiveText, type IDirectiveTextFormatter } from "../../../assistant-ui/elements/DirectiveText.js";
import { GitHubIcon } from "../../../assistant-ui/elements/GitHubIcon.js";
import { ClaudeLogo } from "../../../assistant-ui/elements/ClaudeLogo.js";
const meta: Meta<typeof DirectiveText> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/DirectiveText",
  component: DirectiveText,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Plain: Story = {
  args: {
    text: "Review the component",
    formatter: { parse: fn<IDirectiveTextFormatter["parse"]>(() => [{ kind: "text", text: "Review the component" }]) },
  },
  play: async ({ args, canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText("Review the component")).toBeVisible());
    await expect(args.formatter.parse).toHaveBeenCalledWith("Review the component");
    await expect(within(canvasElement).queryByLabelText("file: Layout.tsx")).not.toBeInTheDocument();
  },
};
export const Mention: Story = {
  args: {
    text: "Review @Layout",
    formatter: {
      parse: fn<IDirectiveTextFormatter["parse"]>(() => [
        { kind: "text", text: "Review " },
        { kind: "mention", type: "file", label: "Layout.tsx", id: "src/Layout.tsx" },
      ]),
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("file: Layout.tsx")).toHaveTextContent("Layout.tsx");
    await expect(canvas.getByTestId("DirectiveText")).toHaveTextContent("Review Layout.tsx");
    await expect(args.formatter.parse).toHaveBeenCalledWith("Review @Layout");
  },
};
export const MappedIcon: Story = {
  args: {
    text: "@Layout",
    options: { iconMap: { file: GitHubIcon } },
    formatter: {
      parse: fn<IDirectiveTextFormatter["parse"]>(() => [
        { kind: "mention", type: "file", label: "Layout.tsx", id: "src/Layout.tsx" },
      ]),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("file: Layout.tsx")).toHaveTextContent("Layout.tsx");
    await waitFor(() => expect(canvas.getByTestId("GitHubIcon")).toBeVisible());
  },
};
export const FallbackIcon: Story = {
  args: {
    text: "@Layout",
    options: { fallbackIcon: ClaudeLogo },
    formatter: {
      parse: fn<IDirectiveTextFormatter["parse"]>(() => [
        { kind: "mention", type: "file", label: "Layout.tsx", id: "src/Layout.tsx" },
      ]),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("file: Layout.tsx")).toHaveTextContent("Layout.tsx");
    await waitFor(() => expect(canvas.getByTestId("ClaudeLogo")).toBeVisible());
  },
};
export const Whitespace: Story = {
  args: {
    text: "Review\n  the component",
    formatter: {
      parse: fn<IDirectiveTextFormatter["parse"]>(() => [{ kind: "text", text: "Review\n  the component" }]),
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("DirectiveText").textContent).toBe("Review\n  the component");
  },
};
