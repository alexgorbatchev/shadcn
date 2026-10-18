import type { ReactElement } from "react";
import { Textarea } from "./Textarea.js";

interface IJsonViewerProps {
  value: unknown;
  label?: string;
  rows?: number;
}

export function JsonViewer({ value, label = "JSON", rows = 12 }: IJsonViewerProps): ReactElement {
  return <Textarea readOnly rows={rows} aria-label={label} value={JSON.stringify(value ?? null, null, 2) ?? "null"} />;
}
