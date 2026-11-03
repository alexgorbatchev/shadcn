import { createContext } from "react";

export interface IDataGridColumnFit {
  width: number;
  hiddenColumnIds: readonly string[];
}

/** Layout-only visibility; the table's column choices remain unchanged. */
export const DataGridColumnFitContext = createContext<IDataGridColumnFit | undefined>(undefined);
