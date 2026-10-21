import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { ModelSelectorSeparator } from "../../../../assistant-ui/elements/ModelSelectorSeparator.js";
import { ModelSelectorFixture } from "../fixtures/modelSelector.js";
import { ModelSelectorList } from "../../../../assistant-ui/elements/ModelSelectorList.js";
import { ModelSelectorItem } from "../../../../assistant-ui/elements/ModelSelectorItem.js";
const meta: Meta<typeof ModelSelectorSeparator> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelectorSeparator",
  component: ModelSelectorSeparator,
  tags: ["autodocs", "test"],

  render: (args) => (
    <ModelSelectorFixture>
      <ModelSelectorList>
        <ModelSelectorItem model={{ id: "fast", name: "Fast" }} />
        <ModelSelectorSeparator {...args} />
        <ModelSelectorItem model={{ id: "reasoning", name: "Reasoning" }} />
      </ModelSelectorList>
    </ModelSelectorFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Choose model" }));
    await waitFor(() => expect(canvas.getByRole("separator")).toBeVisible());
    await userEvent.click(canvas.getByRole("option", { name: "Reasoning" }));
    await expect(canvas.getByRole("combobox", { name: "Choose model" })).toHaveTextContent("Reasoning");
  },
};
export { Default as ModelSelectorSeparator };
