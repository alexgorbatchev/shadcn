import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ModelSelectorGroup } from "../../../../assistant-ui/elements/ModelSelectorGroup.js";
import { ModelSelectorFixture } from "../fixtures/modelSelector.js";
import { ModelSelectorList } from "../../../../assistant-ui/elements/ModelSelectorList.js";
import { ModelSelectorItem } from "../../../../assistant-ui/elements/ModelSelectorItem.js";
const meta: Meta<typeof ModelSelectorGroup> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelectorGroup",
  component: ModelSelectorGroup,
  tags: ["autodocs", "test"],
  args: { heading: "Local harness models" },
  render: (args) => (
    <ModelSelectorFixture>
      <ModelSelectorList>
        <ModelSelectorGroup {...args}>
          <ModelSelectorItem model={{ id: "fast", name: "Fast" }} />
        </ModelSelectorGroup>
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
    await waitFor(() => expect(canvas.getByText("Local harness models")).toBeVisible());
    await userEvent.click(canvas.getByRole("option", { name: "Fast" }));
    await waitFor(() => expect(canvas.queryByRole("option")).not.toBeInTheDocument());
  },
};
export { Default as ModelSelectorGroup };
