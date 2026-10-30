import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DataGridSelectHeader } from "../../data-grid";
import { SelectionControls } from "./fixtures/SelectionControls";

const meta: Meta<typeof DataGridSelectHeader> = {
  title: "@alexgorbatchev/shadcn/components/data-display/DataGridSelectHeader",
  component: DataGridSelectHeader,
  tags: ["autodocs", "test"],
  render: () => <SelectionControls selectChildren={false} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole("checkbox", { name: "Select all filtered rows" });
    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Select Parent" })).toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Select Child" })).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Select Disabled" })).not.toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Filter disabled" }));
    await expect(all).toHaveAttribute("aria-disabled", "true");
    await expect(all).not.toBePartiallyChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filter" }));
    await expect(all).toBeChecked();
    all.focus();
    await userEvent.keyboard(" ");
    await expect(all).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Select Parent" })).not.toBeChecked();
  },
};
export { Default as DataGridSelectHeader };

export const ChangedRows: Story = {
  render: () => <SelectionControls />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole("checkbox", { name: "Select all filtered rows" });
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Child" }));
    await expect(all).toBePartiallyChecked();
    await userEvent.click(all);
    await expect(all).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Replace rows" }));
    await expect(all).not.toBeChecked();
    await expect(all).not.toBePartiallyChecked();
    await userEvent.click(all);
    await expect(canvas.getByRole("checkbox", { name: "Select Replacement" })).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Toggle selection availability" }));
    await expect(all).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("checkbox", { name: "Select Replacement" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Toggle selection availability" }));
    await expect(all).toBeChecked();
    await expect(all).not.toHaveAttribute("aria-disabled", "true");
  },
};
