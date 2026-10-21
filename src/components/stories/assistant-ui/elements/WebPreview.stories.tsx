import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, fn, userEvent } from "storybook/test";
import { WebPreview } from "../../../assistant-ui/elements/WebPreview.js";
const meta: Meta<typeof WebPreview> = {
  component: WebPreview,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/WebPreview",
  render: (args) => <WebPreview {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    origin: "https://example.com",
    loading: false,
    children: "Rendered application",
    onReload: fn(),
    onOpenExternal: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Rendered application")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: /Reload/ }));
    await expect(args.onReload).toHaveBeenCalledOnce();
  },
};
export const Loading: Story = {
  ...Default,
  args: { ...Default.args, loading: true },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Loading preview")).toBeVisible());
    await expect(canvas.getByText("Rendered application")).not.toBeVisible();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
