export interface InvoiceRecord {
  id: string;
  email: string;
  amount: number;
}

export interface RuntimeChoice {
  label: string;
  value: string | null;
}

export interface RuntimeEngine {
  id: string;
  name: string;
}

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
