import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { GuardrailNotice } from "../../../assistant-ui/elements/GuardrailNotice.js";
const meta: Meta<typeof GuardrailNotice> = {
  component: GuardrailNotice,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/GuardrailNotice",
  args: {
    title: "Protected branch",
    explanation: "Changes require a review before merging.",
    policy: "Review policy",
    alternatives: ["Create a review branch"],
    onPick: fn(),
  },
  render: (args) => <GuardrailNotice {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Alternatives: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("Changes require a review before merging.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Create a review branch" }));
    await expect(args.onPick).toHaveBeenCalledWith("Create a review branch");
  },
};
export const ReadOnly: Story = {
  args: { onPick: undefined },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("Create a review branch")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const NoAlternatives: Story = {
  args: { alternatives: [] },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByText("Protected branch")).toBeVisible();
    await expect(canvas.queryByText("try instead")).not.toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...Alternatives, globals: { theme: "light" }, play: Alternatives.play };
export const DarkTheme: Story = { ...Alternatives, globals: { theme: "dark" }, play: Alternatives.play };
