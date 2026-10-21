import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ModelSelectorSearch } from "../../../../assistant-ui/elements/ModelSelectorSearch.js";
import { ModelSelectorFixture } from "../fixtures/modelSelector.js";
import { ModelSelectorList } from "../../../../assistant-ui/elements/ModelSelectorList.js";
const meta: Meta<typeof ModelSelectorSearch> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelectorSearch",
  component: ModelSelectorSearch,
  tags: ["autodocs", "test"],

  render: (args) => (
    <ModelSelectorFixture hasSearch={false}>
      <ModelSelectorSearch {...args} />
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
    await userEvent.type(await canvas.findByRole("combobox", { name: "Model" }), "missing");
    await expect(await canvas.findByText("No models found.")).toBeVisible();
    await expect(canvas.queryByRole("option")).not.toBeInTheDocument();
  },
};
export { Default as ModelSelectorSearch };
