import { createColumnHelper, useTable, type ColumnFiltersState } from "@tanstack/react-table";
import type { ReactElement } from "react";
import { Input } from "../../Input";
import {
  DataGrid,
  DataGridFilters,
  DataGridFilterSummary,
  dataGridFeatures,
  type DataGridFeatures,
  type DataGridFilterOptions,
} from "../../data-grid";
import type { GridRecording } from "./types";

const helper = createColumnHelper<DataGridFeatures, GridRecording>();
const columns = helper.columns([
  helper.accessor("name", { header: "Name", meta: { label: "Name" } }),
  helper.accessor((recording) => recording.tempo ?? undefined, {
    id: "tempo",
    header: "Tempo",
    enableGlobalFilter: false,
    filterFn: "inNumberRange",
    meta: { label: "Tempo", filter: { variant: "range", step: 0.1, format: { maximumFractionDigits: 1 } } },
  }),
  helper.accessor("genre", {
    header: "Genre",
    enableGlobalFilter: false,
    filterFn: "arrHas",
    meta: {
      label: "Genre",
      filter: {
        variant: "options",
        options: ["Ambient", "House", "Techno"].map((genre) => ({ label: genre, value: genre })),
      },
    },
  }),
  helper.accessor("room", {
    header: "Room",
    enableGlobalFilter: false,
    filterFn: "arrHas",
    meta: {
      label: "Room",
      filter: {
        variant: "options",
        label: "Recorded in",
        multiple: false,
        options: ["Studio A", "Studio B"].map((room) => ({ label: room, value: room })),
      },
    },
  }),
  // Hidden columns still filter.
  helper.accessor("year", {
    header: "Year",
    enableGlobalFilter: false,
    filterFn: "inNumberRange",
    meta: { label: "Year", filter: { variant: "range", format: { useGrouping: false } } },
  }),
  helper.accessor("tags", {
    header: "Tags",
    enableGlobalFilter: false,
    filterFn: "arrIncludesSome",
    // Each tag counts once per recording, so a tag's count is the recordings that carry it.
    getUniqueValues: (recording) => recording.tags,
    // The recordings decide which tags exist, so the example passes them to the filter controls.
    meta: { label: "Tags", filter: { variant: "options" } },
  }),
]);

interface IFilteredDataGridExampleProps {
  recordings: GridRecording[];
  initialFilters?: ColumnFiltersState;
  /** Choices added to the tags found in the recordings, or replacing them under the same column ID. */
  options?: DataGridFilterOptions;
}

export function FilteredDataGridExample({
  recordings,
  initialFilters = [],
  options,
}: IFilteredDataGridExampleProps): ReactElement {
  const tags = [...new Set(recordings.flatMap((recording) => recording.tags))].sort();
  const filterOptions: DataGridFilterOptions = {
    tags: tags.map((tag) => ({ label: tag, value: tag })),
    ...options,
  };
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: recordings,
    getRowId: (recording) => recording.id,
    globalFilterFn: "includesString",
    initialState: { columnFilters: initialFilters, columnVisibility: { year: false, tags: false } },
  });
  return (
    <DataGrid
      table={table}
      label="Recordings"
      pagination={false}
      toolbar={
        <div className="grid gap-2">
          <div className="flex gap-2">
            <Input
              aria-label="Search recordings"
              value={typeof table.state.globalFilter === "string" ? table.state.globalFilter : ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
            />
            <DataGridFilters table={table} options={filterOptions} />
          </div>
          <DataGridFilterSummary table={table} options={filterOptions} />
        </div>
      }
    />
  );
}
