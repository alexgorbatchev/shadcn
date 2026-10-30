import { createColumnHelper, useTable } from "@tanstack/react-table";
import { memo, useState } from "react";
import { Button } from "../../../Button";
import {
  DataGridSelectHeader,
  DataGridSelectCell,
  dataGridFeatures,
  type IDataGridControlProps,
  type DataGridSelectCellProps,
} from "../../../data-grid";

interface ISelectionRow {
  id: string;
  name: string;
  children?: ISelectionRow[];
}

const data: ISelectionRow[] = [
  {
    id: "parent",
    name: "Parent",
    children: [
      { id: "child", name: "Child" },
      { id: "sibling", name: "Sibling" },
    ],
  },
  { id: "disabled", name: "Disabled" },
];
const helper = createColumnHelper<typeof dataGridFeatures, ISelectionRow>();
const columns = helper.columns([helper.accessor("name", { filterFn: "includesString" })]);
const replacement: ISelectionRow[] = [{ id: "replacement", name: "Replacement" }];
const SelectionHeader = memo(function SelectionHeader({ table }: IDataGridControlProps<ISelectionRow>) {
  return <DataGridSelectHeader table={table} />;
});
const SelectionCell = memo(function SelectionCell(props: DataGridSelectCellProps<ISelectionRow>) {
  return <DataGridSelectCell {...props} />;
});

/** The owner deliberately omits selection/filter subscriptions; each public control must observe its own state. */
export function SelectionControls({ selectChildren = true }: { selectChildren?: boolean }) {
  const [isReplacement, setReplacement] = useState(false);
  const [isEnabled, setEnabled] = useState(true);
  const table = useTable(
    {
      features: dataGridFeatures,
      columns,
      data: isReplacement ? replacement : data,
      getRowId: (row) => row.id,
      getSubRows: (row) => row.children,
      enableRowSelection: (row) => isEnabled && row.id !== "disabled",
      enableSubRowSelection: selectChildren,
    },
    () => null,
  );
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SelectionHeader table={table} />
      {table.getCoreRowModel().flatRows.map((row) => (
        <SelectionCell table={table} key={row.id} row={row} label={`Select ${row.original.name}`} />
      ))}
      <Button onClick={() => table.getColumn("name")?.setFilterValue("Disabled")}>Filter disabled</Button>
      <Button onClick={() => table.setColumnFilters([])}>Clear filter</Button>
      <Button onClick={() => setReplacement(true)}>Replace rows</Button>
      <Button onClick={() => setEnabled((enabled) => !enabled)}>Toggle selection availability</Button>
    </div>
  );
}
