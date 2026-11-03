import type { RowData, Table } from "@tanstack/react-table";
import { useLayoutEffect, useState, type RefObject } from "react";
import type { DataGridFeatures } from "../DataGrid.js";
import type { IDataGridColumnFit } from "../DataGridColumnFitContext.js";
import { getDataGridColumnFit } from "../getDataGridColumnFit.js";

/** Measures the rendered table and derives temporary visibility without changing the table's saved choices. */
export function useDataGridColumnFit<T extends RowData>(
  table: Table<DataGridFeatures, T>,
  scope: RefObject<HTMLElement | null>,
  isEnabled: boolean,
  onWidthChange?: (width: number) => void,
): IDataGridColumnFit | undefined {
  const [fit, setFit] = useState<IDataGridColumnFit>();
  useLayoutEffect(() => {
    const element = scope.current;
    if (!isEnabled || !element) return;
    const container = element.querySelector<HTMLElement>('[data-slot="table-container"]');
    if (!container) return;
    const update = (): void => {
      const width = container.clientWidth;
      if (width <= 0) return;
      onWidthChange?.(width);
      const hiddenColumnIds = getDataGridColumnFit(table, width);
      setFit((previous) =>
        previous?.width === width && previous.hiddenColumnIds.join("\0") === hiddenColumnIds.join("\0")
          ? previous
          : { width, hiddenColumnIds },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    const subscription = table.atoms.columnSizing.subscribe(update);
    return () => {
      observer.disconnect();
      subscription.unsubscribe();
    };
  });
  return isEnabled ? fit : undefined;
}
