import { type BaseComponentProps } from "@json-render/react";
import { Table as TablePrimitive } from "../../index.js";
import { TableBody } from "../../index.js";
import { TableCaption } from "../../index.js";
import { TableCell } from "../../index.js";
import { TableHead } from "../../index.js";
import { TableHeader } from "../../index.js";
import { TableRow } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonTable = ({ props }: BaseComponentProps<JsonProps<"Table">>) => {
  const columns = props.columns ?? [];
  const rows = (props.rows ?? []).map((row) => row.map(String));

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <TablePrimitive>
        {props.caption && <TableCaption>{props.caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TablePrimitive>
    </div>
  );
};
