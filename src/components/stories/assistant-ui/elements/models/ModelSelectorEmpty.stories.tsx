import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { ModelSelectorEmpty } from "../../../../assistant-ui/elements/ModelSelectorEmpty.js";
import { ModelSelectorFixture } from "../fixtures/modelSelector.js";

const meta: Meta<typeof ModelSelectorEmpty> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/models/ModelSelectorEmpty",
  component: ModelSelectorEmpty,
  tags: ["autodocs", "test"],

  render: (args) => (
    <ModelSelectorFixture>
      <ModelSelectorEmpty {...args} />
    </ModelSelectorFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Choose model" }));
    await waitFor(() => expect(canvas.getByText("No models found.")).toBeVisible());
    await expect(canvas.queryByRole("option")).not.toBeInTheDocument();
  },
};
export { Default as ModelSelectorEmpty };
