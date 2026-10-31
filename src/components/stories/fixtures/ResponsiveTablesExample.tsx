import { useState, type ReactElement } from "react";
import { createColumnHelper, useTable } from "@tanstack/react-table";
import { Button } from "../../Button";
import { DataGrid, dataGridFeatures } from "../../data-grid";
import { VirtualDataGrid } from "../../virtual-data-grid";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableColumnGroup,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Table";
import type { GridFile } from "./types";

const files: GridFile[] = [{ id: "one", name: "First light", kind: "FLAC", owner: "Alex", size: 123 }];
const helper = createColumnHelper<typeof dataGridFeatures, GridFile>();
const columns = helper.columns([
  helper.accessor("name", { header: "Title", meta: { fill: true } }),
  helper.accessor("size", { header: "BPM", size: 60, meta: { visibleFrom: "container-sm" } }),
  helper.accessor("kind", { header: "Format", size: 80, meta: { visibleFrom: "container-md" } }),
  helper.accessor("owner", { header: "Owner", size: 100, meta: { visibleFrom: "container-lg" } }),
]);

export function ResponsiveTablesExample(): ReactElement {
  const [width, setWidth] = useState(399);
  const table = useTable({ features: dataGridFeatures, columns, data: files });
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {[399, 400, 479, 480, 639, 640, 641].map((size) => (
          <Button key={size} onClick={() => setWidth(size)}>
            Width {size}
          </Button>
        ))}
      </div>
      <div style={{ width }}>
        <Table layout="fixed" aria-label="Primitive tracks">
          <TableColumnGroup>
            <TableColumn />
            <TableColumn width={60} visibleFrom="container-sm" />
            <TableColumn width={80} visibleFrom="container-md" />
            <TableColumn width={100} visibleFrom="container-lg" />
          </TableColumnGroup>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead visibleFrom="container-sm">BPM</TableHead>
              <TableHead visibleFrom="container-md">Format</TableHead>
              <TableHead visibleFrom="container-lg">Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>First light</TableCell>
              <TableCell visibleFrom="container-sm">123</TableCell>
              <TableCell visibleFrom="container-md">FLAC</TableCell>
              <TableCell visibleFrom="container-lg">Alex</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      {/* DataGrid adds a one-pixel frame around its table container. */}
      <div style={{ width: width + 2 }}>
        <DataGrid table={table} label="Grid tracks" pagination={false} />
      </div>
      <div style={{ width }}>
        <VirtualDataGrid table={table} label="Virtual tracks" maxHeight={200} />
      </div>
    </div>
  );
}
