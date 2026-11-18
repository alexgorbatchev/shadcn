import type { Meta, ReactRenderer } from "@storybook/react-vite";
import type { StoryAnnotations } from "storybook/internal/types";
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

type StoryArgs = Record<string, never>;
const meta: Meta<StoryArgs> = {
  title: "@alexgorbatchev/shadcn/components/data-display/VirtualDataGrid",
  tags: ["autodocs", "test"],
  render: () => <VirtualDataGridExample files={fixture_gridFiles} />,
};
export default meta;
type Story = StoryAnnotations<ReactRenderer, StoryArgs>;

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

export const FittedColumns: Story = {
  render: () => <VirtualDataGridExample files={fixture_gridFiles} width={420} fitColumns />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    const choices = within(await page.findByRole("list", { name: "Columns" }));
    await userEvent.click(choices.getByRole("checkbox", { name: "owner" }));
    const name = canvas.getByRole("columnheader", { name: "Name" });
    await waitFor(() => expect(name.getBoundingClientRect().width).toBeGreaterThanOrEqual(160));
    await expect(canvas.queryByRole("columnheader", { name: "Size" })).not.toBeInTheDocument();
    await expect(canvas.getByText("Hidden to fit: Size.", { exact: true })).toBeVisible();
    await expect(choices.getByRole("checkbox", { name: "Size" })).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    const handle = canvas.getByRole("separator", { name: "Resize Kind" });
    handle.focus();
    await userEvent.keyboard("{End}");
    await expect(handle).toHaveAttribute("aria-valuemax", "130");
    await expect(handle).toHaveAttribute("aria-valuenow", "130");
    await expect(handle).toHaveFocus();
    await expect(name.getBoundingClientRect().width).toBeGreaterThanOrEqual(160);
    await userEvent.keyboard("{ArrowLeft}");
    await expect(handle).toHaveAttribute("aria-valuenow", "114");
    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    const reordered = within(await page.findByRole("list", { name: "Columns" }));
    await userEvent.click(reordered.getByRole("button", { name: "Move Size earlier" }));
    await userEvent.click(reordered.getByRole("button", { name: "Move Size earlier" }));
    await expect(canvas.getByRole("columnheader", { name: "Size" })).toBeVisible();
    await expect(canvas.queryByRole("columnheader", { name: "Owner" })).not.toBeInTheDocument();
    await expect(canvas.getByText("Hidden to fit: owner.", { exact: true })).toBeVisible();
    const grid = canvas.getByTestId("VirtualDataGrid");
    const container = grid.parentElement;
    if (!container) throw new Error("Grid example needs a width container");
    container.style.width = "720px";
    await waitFor(() => expect(canvas.queryByText("Hidden to fit: owner.", { exact: true })).not.toBeInTheDocument());
    await expect(reordered.getByRole("checkbox", { name: "owner" })).toBeChecked();
    await expect(canvas.getByRole("columnheader", { name: "Owner" })).toBeVisible();
    await expect(canvas.getByRole("separator", { name: "Resize Kind" })).toHaveAttribute("aria-valuenow", "114");
    container.style.width = "300px";
    await waitFor(() => expect(name.getBoundingClientRect().width).toBeGreaterThanOrEqual(160));
    const viewport = canvas.getByRole("region", { name: "Files" });
    await expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
    await expect(canvas.getByRole("table").getBoundingClientRect().width).toBeLessThanOrEqual(viewport.clientWidth);
  },
};

export const PreferredFillWidth: Story = {
  render: () => <VirtualDataGridExample files={fixture_gridFiles} width={420} fitColumns preferredFillSize={240} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const name = canvas.getByRole("columnheader", { name: "Name" });
    await waitFor(() => expect(name.getBoundingClientRect().width).toBeGreaterThanOrEqual(240));
    await expect(canvas.getByText("Hidden to fit: Size.", { exact: true })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    const choices = within(await page.findByRole("list", { name: "Columns" }));
    await expect(choices.getByRole("checkbox", { name: "Size" })).toBeChecked();
    await userEvent.click(choices.getByRole("button", { name: "Move Size earlier" }));
    await userEvent.click(choices.getByRole("button", { name: "Move Size earlier" }));
    await expect(canvas.getByRole("columnheader", { name: "Size" })).toBeVisible();
    await expect(canvas.queryByRole("columnheader", { name: "Kind" })).not.toBeInTheDocument();
    await expect(name.getBoundingClientRect().width).toBeGreaterThanOrEqual(240);
    const container = canvas.getByTestId("VirtualDataGrid").parentElement;
    if (!container) throw new Error("Grid example needs a width container");
    container.style.width = "220px";
    await waitFor(() => expect(name.getBoundingClientRect().width).toBe(180));
    container.style.width = "520px";
    await waitFor(() => expect(canvas.getByRole("columnheader", { name: "Kind" })).toBeVisible());
    await expect(canvas.getByRole("columnheader", { name: "Size" })).toBeVisible();
    await expect(name.getBoundingClientRect().width).toBeGreaterThanOrEqual(240);
  },
};

export const FittedColumnGroups: Story = {
  render: () => <VirtualDataGridExample files={fixture_gridFiles} width={420} fitColumns grouped />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const details = canvas.getByRole("columnheader", { name: "Details" });
    await expect(details).toHaveAttribute("colspan", "2");
    await expect(canvas.queryByRole("separator", { name: "Resize Details" })).not.toBeInTheDocument();
    const container = canvas.getByTestId("VirtualDataGrid").parentElement;
    if (!container) throw new Error("Grid example needs a width container");
    container.style.width = "300px";
    await waitFor(() => expect(details).toHaveAttribute("colspan", "1"));
    await expect(canvas.getByRole("columnheader", { name: "Kind" })).toBeVisible();
    await expect(canvas.queryByRole("columnheader", { name: "Size" })).not.toBeInTheDocument();
    container.style.width = "200px";
    await waitFor(() => expect(canvas.queryByRole("columnheader", { name: "Details" })).not.toBeInTheDocument());
    await expect(canvas.getByRole("columnheader", { name: "Identity" })).toHaveAttribute("colspan", "2");
    await expect(
      canvas.getByRole("columnheader", { name: "Name" }).getBoundingClientRect().width,
    ).toBeGreaterThanOrEqual(160);
    const viewport = canvas.getByRole("region", { name: "Files" });
    await expect(canvas.getByRole("table").getBoundingClientRect().width).toBeLessThanOrEqual(viewport.clientWidth);
  },
};

export const Fill: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <VirtualDataGridExample files={fixture_gridFiles} height="fill" width={300} fitColumns />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Files" });
    await expect(canvas.getByText("Hidden to fit: Size.")).toBeVisible();
    await expect(viewport.clientHeight).toBeGreaterThan(200);
    await expect(viewport.clientHeight).toBeLessThan(400);
    await expect(canvas.getByText("Hidden to fit: Size.").getBoundingClientRect().bottom).toBeLessThanOrEqual(
      viewport.getBoundingClientRect().top,
    );
    viewport.scrollTo({ top: viewport.scrollHeight });
    await waitFor(() => expect(canvas.getByText("File 999")).toBeVisible());
    await expect(canvas.getByRole("columnheader", { name: "Name" }).getBoundingClientRect().top).toBeCloseTo(
      viewport.getBoundingClientRect().top,
      0,
    );
  },
};

function rowOf(canvasElement: HTMLElement, name: string): HTMLElement {
  const row = within(canvasElement).getByText(name, { exact: true }).closest("tr");
  if (!row) throw new Error(`Row ${name} is missing`);
  return row;
}

// Mod is ⌘ on macOS, where Ctrl+click opens the context menu instead of clicking.
const MOD = navigator.platform.startsWith("Mac") ? "Meta" : "Control";

function selectedNames(canvasElement: HTMLElement): string[] {
  return [...canvasElement.querySelectorAll('tr[aria-selected="true"]')].map(
    (row) => row.querySelector("td:nth-child(2)")?.textContent ?? "",
  );
}

export const RowCursorPointer: Story = {
  render: () => <VirtualDataGridExample files={fixture_gridFiles} cursor={{}} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("File 0");
    await expect(canvas.getByRole("grid", { name: "Files" })).toHaveAttribute("aria-multiselectable", "true");
    // A click selects one row and sets the anchor; Shift+click selects the displayed range from it.
    await userEvent.click(rowOf(canvasElement, "File 2"));
    await expect(selectedNames(canvasElement)).toEqual(["File 2"]);
    await expect(rowOf(canvasElement, "File 2")).toHaveFocus();
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(rowOf(canvasElement, "File 5"));
    await userEvent.keyboard("{/Shift}");
    await expect(selectedNames(canvasElement)).toEqual(["File 2", "File 3", "File 4", "File 5"]);
    // Mod+click toggles one row and moves the anchor; Mod+Shift+click adds a range from it.
    await userEvent.keyboard(`{${MOD}>}`);
    await userEvent.click(rowOf(canvasElement, "File 3"));
    await userEvent.keyboard(`{/${MOD}}`);
    await expect(selectedNames(canvasElement)).toEqual(["File 2", "File 4", "File 5"]);
    await userEvent.keyboard(`{${MOD}>}{Shift>}`);
    await userEvent.click(rowOf(canvasElement, "File 7"));
    await userEvent.keyboard(`{/Shift}{/${MOD}}`);
    await expect(selectedNames(canvasElement)).toEqual(["File 2", "File 3", "File 4", "File 5", "File 6", "File 7"]);
    // A row's own controls keep their clicks.
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select File 9" }));
    await expect(selectedNames(canvasElement)).toContain("File 9");
    await expect(selectedNames(canvasElement)).toContain("File 2");
    await userEvent.click(rowOf(canvasElement, "File 1"));
    await expect(selectedNames(canvasElement)).toEqual(["File 1"]);
  },
};

export const RowCursorKeyboard: Story = {
  render: () => <VirtualDataGridExample files={fixture_gridFiles} cursor={{}} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("File 0");
    // The rows are one tab stop after the header's own controls: Tab reaches the first row, and the next Tab leaves.
    canvas.getByRole("checkbox", { name: "Select all files" }).focus();
    for (let step = 0; step < 10 && document.activeElement?.tagName !== "TR"; step++) await userEvent.tab();
    await expect(rowOf(canvasElement, "File 0")).toHaveFocus();
    await expect(selectedNames(canvasElement)).toEqual([]);
    // While at most one row is selected, ↓ moves the selection with the cursor.
    await userEvent.keyboard("{ArrowDown}");
    await expect(rowOf(canvasElement, "File 1")).toHaveFocus();
    await expect(selectedNames(canvasElement)).toEqual(["File 1"]);
    await userEvent.keyboard("{ArrowDown}");
    await expect(selectedNames(canvasElement)).toEqual(["File 2"]);
    // Shift+↓ extends from the anchor; once two rows are selected, ↓ moves only the cursor.
    await userEvent.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
    await expect(selectedNames(canvasElement)).toEqual(["File 2", "File 3", "File 4"]);
    await userEvent.keyboard("{ArrowDown}");
    await expect(rowOf(canvasElement, "File 5")).toHaveFocus();
    await expect(canvas.getByRole("status", { name: "Cursor" })).toHaveTextContent("file-5");
    await expect(selectedNames(canvasElement)).toEqual(["File 2", "File 3", "File 4"]);
    // Shift+Space toggles the cursor row; Mod+↑ moves the cursor alone.
    await userEvent.keyboard("{Shift>} {/Shift}");
    await expect(selectedNames(canvasElement)).toEqual(["File 2", "File 3", "File 4", "File 5"]);
    await userEvent.keyboard(`{${MOD}>}{ArrowUp}{/${MOD}}`);
    await expect(rowOf(canvasElement, "File 4")).toHaveFocus();
    await expect(selectedNames(canvasElement)).toHaveLength(4);
    // End reaches a row far outside the rendered window and keeps it focused and in view.
    await userEvent.keyboard("{End}");
    const last = await waitFor(() => rowOf(canvasElement, "File 999"));
    await expect(last).toHaveFocus();
    const viewport = canvas.getByRole("region", { name: "Files" }).getBoundingClientRect();
    await waitFor(() => expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(viewport.bottom + 1));
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(rowOf(canvasElement, "File 0")).toHaveFocus());
    await userEvent.keyboard(`{${MOD}>}a{/${MOD}}`);
    await expect(canvasElement.querySelectorAll('tr[aria-selected="false"]')).toHaveLength(0);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After grid" })).toHaveFocus();
  },
};

export const RowCursorOwnedSelection: Story = {
  render: function Example() {
    const [gestures, setGestures] = useState<string[]>([]);
    return (
      <div className="grid gap-3">
        <p role="status" aria-label="Gestures">
          {gestures.join(" ")}
        </p>
        <VirtualDataGridExample
          files={fixture_gridFiles}
          cursor={{
            keyboard: false,
            onSelectionChange: (change) =>
              setGestures((current) => [...current, `${change.gesture}:${change.rowIds.join(",")}`]),
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("File 0");
    // A consumer that owns the selection hears each gesture and decides; its own keymap runs the keys.
    await userEvent.click(rowOf(canvasElement, "File 1"));
    await expect(canvas.getByRole("status", { name: "Gestures" })).toHaveTextContent("select:file-1");
    await userEvent.keyboard("{ArrowDown}");
    await expect(rowOf(canvasElement, "File 1")).toHaveFocus();
    await expect(selectedNames(canvasElement)).toEqual([]);
  },
};
