import { Subscribe, type CellData, type Header, type RowData } from "@tanstack/react-table";
import type { KeyboardEvent, ReactElement } from "react";
import type { DataGridFeatures } from "./DataGrid.js";

const KEYBOARD_STEP = 16;

interface IDataGridColumnResizerProps<T extends RowData> {
  header: Header<DataGridFeatures, T, CellData>;
  label: string;
}

/**
 * A window-splitter handle at a header's trailing edge: drag it, use the arrow keys, Home, or End, or double-click it
 * to restore the default width.
 */
export function DataGridColumnResizer<T extends RowData>({
  header,
  label,
}: IDataGridColumnResizerProps<T>): ReactElement {
  const column = header.column;
  const table = column.table;
  const minSize = column.columnDef.minSize ?? 0;
  const maxSize = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
  const resize = header.getResizeHandler();
  const setSize = (size: number): void =>
    table.setColumnSizing((sizes) => ({ ...sizes, [column.id]: Math.min(maxSize, Math.max(minSize, size)) }));
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    // In right-to-left grids the trailing edge sits on the left, so the left arrow widens the column.
    const growKey = table.options.columnResizeDirection === "rtl" ? "ArrowLeft" : "ArrowRight";
    const shrinkKey = growKey === "ArrowRight" ? "ArrowLeft" : "ArrowRight";
    const size = column.getSize();
    const next =
      event.key === growKey
        ? size + KEYBOARD_STEP
        : event.key === shrinkKey
          ? size - KEYBOARD_STEP
          : event.key === "Home"
            ? minSize
            : event.key === "End" && maxSize < Number.MAX_SAFE_INTEGER
              ? maxSize
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    setSize(next);
  };
  return (
    // A string key re-renders only this handle, and only when its width or drag state changes.
    <Subscribe
      source={table.store}
      selector={(state) => `${state.columnSizing[column.id]}:${state.columnResizing.isResizingColumn === column.id}`}
    >
      {() => (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize ${label}`}
          aria-valuenow={column.getSize()}
          aria-valuemin={minSize}
          aria-valuemax={maxSize < Number.MAX_SAFE_INTEGER ? maxSize : undefined}
          tabIndex={0}
          data-slot="data-grid-column-resizer"
          data-resizing={column.getIsResizing() || undefined}
          onMouseDown={resize}
          onTouchStart={resize}
          onDoubleClick={() => column.resetSize()}
          onKeyDown={onKeyDown}
          className="absolute inset-y-0 end-0 flex w-2 cursor-col-resize touch-none justify-center outline-none select-none after:w-px after:bg-border hover:after:bg-ring focus-visible:after:w-0.5 focus-visible:after:bg-ring data-resizing:after:bg-ring"
        />
      )}
    </Subscribe>
  );
}
