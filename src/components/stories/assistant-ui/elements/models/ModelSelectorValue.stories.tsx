import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ModelSelectorValue } from "../../../../assistant-ui/elements/ModelSelectorValue.js";
import { ModelSelectorFixture } from "../fixtures/modelSelector.js";
import { ModelSelectorTrigger } from "../../../../assistant-ui/elements/ModelSelectorTrigger.js";
const meta: Meta<typeof ModelSelectorValue> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelectorValue",
  component: ModelSelectorValue,
  tags: ["autodocs", "test"],

  render: (args) => (
    <ModelSelectorFixture placement="trigger" defaultValue="reasoning">
      <ModelSelectorTrigger aria-label="Choose model">
        <ModelSelectorValue {...args} />
      </ModelSelectorTrigger>
    </ModelSelectorFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("combobox", { name: "Choose model" })).toHaveTextContent("Reasoning");
    await expect(canvas.getByRole("combobox", { name: "Choose model" })).toHaveTextContent("Low");
  },
};
export { Default as ModelSelectorValue };
