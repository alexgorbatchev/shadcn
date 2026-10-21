import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ModelSelectorTrigger } from "../../../assistant-ui/elements/ModelSelectorTrigger.js";
import { ModelSelectorFixture } from "./fixtures/modelSelector.js";
const meta: Meta<typeof ModelSelectorTrigger> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ModelSelectorTrigger",
  component: ModelSelectorTrigger,
  tags: ["autodocs", "test"],
  args: { "aria-label": "Choose model" },
  render: (args) => (
    <ModelSelectorFixture placement="trigger">
      <ModelSelectorTrigger {...args} />
    </ModelSelectorFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Outline: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Choose model" }));
    await waitFor(() => expect(canvas.getByRole("option", { name: "Reasoning" })).toBeVisible());
  },
};
export const GhostSmall: Story = {
  args: { variant: "ghost", size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowUp}");
    await expect(await canvas.findByRole("combobox", { name: "Model" })).toHaveFocus();
  },
};
export const MutedLarge: Story = {
  args: { variant: "muted", size: "lg" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Choose model" }));
    await userEvent.click(await canvas.findByRole("option", { name: "Reasoning" }));
    await expect(canvas.getByRole("combobox", { name: "Choose model" })).toHaveTextContent("Reasoning");
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox", { name: "Choose model" })).toBeDisabled();
  },
};
