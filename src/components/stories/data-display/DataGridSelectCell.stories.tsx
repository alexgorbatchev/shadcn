import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DataGridSelectCell } from "../../data-grid";
import { SelectionControls } from "./fixtures/SelectionControls";

const meta: Meta<typeof DataGridSelectCell> = {
  title: "@alexgorbatchev/shadcn/components/data-display/DataGridSelectCell",
  component: DataGridSelectCell,
  tags: ["autodocs", "test"],
  render: () => <SelectionControls />,
};
export default meta;
type Story = StoryObj<typeof meta>;

const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole("checkbox", { name: "Select Parent" });
    const child = canvas.getByRole("checkbox", { name: "Select Child" });
    const disabled = canvas.getByRole("checkbox", { name: "Select Disabled" });
    await userEvent.click(child);
    await expect(child).toBeChecked();
    await expect(parent).toBePartiallyChecked();
    await userEvent.click(parent);
    await expect(parent).toBeChecked();
    await expect(child).toBeChecked();
    await expect(parent).not.toBePartiallyChecked();
    await userEvent.click(parent);
    await expect(child).not.toBeChecked();
    child.focus();
    await userEvent.keyboard(" ");
    await expect(child).toBeChecked();
    await userEvent.tab();
    await expect(canvas.getByRole("checkbox", { name: "Select Sibling" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Filter disabled" })).toHaveFocus();
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(disabled);
    await expect(disabled).not.toBeChecked();
  },
};
export { Default as DataGridSelectCell };
