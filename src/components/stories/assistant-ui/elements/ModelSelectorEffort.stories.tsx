import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import { ModelSelectorEffort } from "../../../assistant-ui/elements/ModelSelectorEffort.js";
import { ModelSelectorFixture } from "./fixtures/modelSelector.js";
import { ModelSelectorList } from "../../../assistant-ui/elements/ModelSelectorList.js";
const meta: Meta<typeof ModelSelectorEffort> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ModelSelectorEffort",
  component: ModelSelectorEffort,
  tags: ["autodocs", "test"],

  render: (args) => (
    <ModelSelectorFixture defaultValue="reasoning">
      <ModelSelectorList />
      <ModelSelectorEffort {...args} />
    </ModelSelectorFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Choose model" }));
    await userEvent.click(await canvas.findByRole("radio", { name: "High" }));
    await expect(canvas.getByRole("radio", { name: "High" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "High" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft>}");
    await waitFor(() => expect(canvas.getByRole("radio", { name: "Med" })).toBeChecked());
    await userEvent.keyboard("{/ArrowLeft}");
  },
};
export { Default as ModelSelectorEffort };
