import type { INamedOption } from "../../../options/types.js";

export interface GridFile {
  id: string;
  name: string;
  kind: string;
  owner: string;
  size: number;
}

export interface InvoiceRecord {
  id: string;
  email: string;
  amount: number;
}

export interface RuntimeChoice {
  label: string;
  value: string | null;
}

export type RuntimeEngine = INamedOption;

export interface NumberedProjectChoice {
  label: string;
  value: number;
}

export interface TechnologyGroup {
  label: string;
  items: string[];
}

export interface ChartBrowserDatum {
  browser: string;
  visitors: number;
  fill: string;
}
