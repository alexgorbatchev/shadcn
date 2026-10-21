import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ModelSelectorFocusAnchor } from "../../../assistant-ui/elements/ModelSelectorFocusAnchor.js";
import { ModelSelectorFixture } from "./fixtures/modelSelector.js";
import { ModelSelectorList } from "../../../assistant-ui/elements/ModelSelectorList.js";
const meta: Meta<typeof ModelSelectorFocusAnchor> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ModelSelectorFocusAnchor",
  component: ModelSelectorFocusAnchor,
  tags: ["autodocs", "test"],

  render: () => (
    <ModelSelectorFixture hasSearch={false}>
      <ModelSelectorFocusAnchor />
      <ModelSelectorList />
    </ModelSelectorFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Choose model" }));
    const input = await canvas.findByRole("combobox", { name: "Model" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByRole("combobox", { name: "Choose model" })).toHaveTextContent("Reasoning");
  },
};
export { Default as ModelSelectorFocusAnchor };
