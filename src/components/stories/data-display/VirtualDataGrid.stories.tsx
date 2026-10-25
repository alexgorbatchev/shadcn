import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactElement } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DataGridCells } from "../../data-grid";
import { TableRow } from "../../Table";
import { VirtualDataGridExample, fixture_gridFiles } from "../fixtures";

function CustomRowsExample(): ReactElement {
  const [opened, setOpened] = useState<string>();
  return (
    <div className="grid gap-3">
      <p role="status">{opened ? `Opened ${opened}` : "Nothing opened"}</p>
      <VirtualDataGridExample
        files={fixture_gridFiles}
        renderRow={(row, props) => (
          <TableRow {...props} aria-label={row.original.name} onDoubleClick={() => setOpened(row.original.name)}>
            <DataGridCells row={row} />
          </TableRow>
        )}
      />
    </div>
  );
}

const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/data-display/VirtualDataGrid",
  tags: ["autodocs", "test"],
  render: () => <VirtualDataGridExample files={fixture_gridFiles} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const LargeCollection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Files" });
    await expect(await canvas.findByText("File 0")).toBeVisible();
    await expect(table).toHaveAttribute("aria-rowcount", "1001");
    await expect(canvas.getAllByRole("row").length).toBeLessThan(30);
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(canvas.getByRole("columnheader", { name: "Name" })).toHaveAttribute("aria-sort", "descending");
    await expect(canvas.getAllByRole("row")[1]).toHaveTextContent("File 999");
    const viewport = canvas.getByRole("region", { name: "Files" });
    viewport.scrollTo({ top: viewport.scrollHeight });
    await waitFor(() => expect(canvas.getByText("File 0")).toBeVisible());
    await expect(canvas.getAllByRole("row").length).toBeLessThan(30);
  },
};

export const SelectedRow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Select File 1" }));
    await expect(canvas.getByRole("checkbox", { name: "Select File 1" }).closest("tr")).toHaveAttribute(
      "data-state",
      "selected",
    );
    await expect(canvas.getByRole("checkbox", { name: "Select File 0" }).closest("tr")).not.toHaveAttribute(
      "data-state",
    );
  },
};

export const KeyboardResizing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const kind = await canvas.findByRole("columnheader", { name: "Kind" });
    const handle = canvas.getByRole("separator", { name: "Resize Kind" });
    await expect(canvas.queryByRole("separator", { name: "Resize Name" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("separator", { name: /select/i })).not.toBeInTheDocument();
    await expect(handle).toHaveAttribute("aria-valuenow", "100");
    const width = kind.getBoundingClientRect().width;
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(handle).toHaveAttribute("aria-valuenow", "116");
    await waitFor(() => expect(kind.getBoundingClientRect().width).toBeCloseTo(width + 16, 0));
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(handle).toHaveAttribute("aria-valuenow", "84");
    await userEvent.keyboard("{End}");
    await expect(handle).toHaveAttribute("aria-valuenow", "240");
    await expect(handle).toHaveAttribute("aria-valuemax", "240");
    await userEvent.keyboard("{Home}");
    await expect(handle).toHaveAttribute("aria-valuenow", "60");
    await userEvent.keyboard("{Enter}");
    await expect(handle).toHaveAttribute("aria-valuenow", "60");
    await userEvent.dblClick(handle);
    await expect(handle).toHaveAttribute("aria-valuenow", "100");
    await waitFor(() => expect(kind.getBoundingClientRect().width).toBeCloseTo(width, 0));
  },
};

export const CustomRows: Story = {
  render: () => <CustomRowsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.dblClick(await canvas.findByRole("row", { name: "File 3" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Opened File 3");
    await expect(within(canvas.getByRole("row", { name: "File 3" })).getByRole("checkbox")).toBeInTheDocument();
  },
};

export const RetainedRow: Story = {
  render: () => <VirtualDataGridExample files={fixture_gridFiles} retainedRowIds={["file-500"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("File 0")).toBeVisible();
    await expect(canvas.getByText("File 500")).toBeInTheDocument();
    await expect(canvas.getAllByRole("row").length).toBeLessThan(30);
  },
};

export const AlignedHeaders: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = await canvas.findByRole("button", { name: "Name" });
    const label = document.createRange();
    label.selectNodeContents(name);
    const value = document.createRange();
    value.selectNodeContents(canvas.getByText("File 0"));
    // Sort buttons add no padding of their own, so header labels line up with the values below them.
    await expect(label.getBoundingClientRect().left).toBeCloseTo(value.getBoundingClientRect().left, 0);
    const size = canvas.getByRole("columnheader", { name: "Size" });
    await expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth);
  },
};

export const NarrowContainer: Story = {
  render: () => <VirtualDataGridExample files={fixture_gridFiles} width={360} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("File 0")).toBeVisible();
    await expect(canvas.getByText("Kind").closest("th")).not.toBeVisible();
    await expect(canvas.getByRole("columnheader", { name: "Size" })).toBeVisible();
    const region = canvas.getByRole("region", { name: "Files" });
    await expect(region.scrollWidth).toBeLessThanOrEqual(region.clientWidth);
  },
};
