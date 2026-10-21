import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { ModelSelectorList } from "../../../../assistant-ui/elements/ModelSelectorList.js";
import { ModelSelectorFixture } from "../fixtures/modelSelector.js";

const meta: Meta<typeof ModelSelectorList> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelectorList",
  component: ModelSelectorList,
  tags: ["autodocs", "test"],

  render: (args) => (
    <ModelSelectorFixture>
      <ModelSelectorList {...args} />
    </ModelSelectorFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Choose model" }));
    await waitFor(() => expect(canvas.getByRole("option", { name: "Fast Quick responses" })).toBeVisible());
    await expect(canvas.getByRole("option", { name: "Blocked" })).toHaveAttribute("aria-disabled", "true");
  },
};
export { Default as ModelSelectorList };
