import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, fn, userEvent } from "storybook/test";
import { Onboarding } from "../../../../assistant-ui/elements/Onboarding.js";
const meta: Meta<typeof Onboarding> = {
  component: Onboarding,
  render: (args) => <Onboarding {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/states-settings/Onboarding",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    steps: [{ title: "Connect a workspace", body: "Choose a folder to begin.", example: "devhost run" }],
    index: 0,
    onNext: fn(),
    onSkip: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Connect a workspace")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Start" }));
    await expect(args.onNext).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Skip" }));
    await expect(args.onSkip).toHaveBeenCalledOnce();
  },
};
export const FirstStep: Story = {
  ...Default,
  args: {
    ...Default.args,
    steps: [
      { title: "Connect a workspace", body: "Choose a folder to begin.", example: "devhost run" },
      { title: "Review results", body: "Inspect the output.", example: "devhost status" },
    ],
    index: 0,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(args.onNext).toHaveBeenCalledOnce();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
