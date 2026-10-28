import { Fragment, type ComponentProps, type ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { cn } from "../utils/cn.js";

type DataViewerProps = Omit<ComponentProps<"section">, "children"> &
  IDensityProps & {
    /** JSON-compatible data to present. */
    value: unknown;
    /** Accessible name of the view. */
    label?: string;
    /** Turns a property key into its visible label. Defaults to `formatDataLabel`. */
    formatLabel?: (key: string) => string;
  };

const ACRONYMS = new Map([
  ["api", "API"],
  ["http", "HTTP"],
  ["https", "HTTPS"],
  ["id", "ID"],
  ["ids", "IDs"],
  ["json", "JSON"],
  ["url", "URL"],
  ["urls", "URLs"],
  ["uuid", "UUID"],
]);

/** Turns keys such as `track_id`, `playlistIds`, or `original-path` into "Track ID", "Playlist IDs", or "Original path". */
function formatDataLabel(key: string): string {
  const label = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => ACRONYMS.get(word.toLowerCase()) ?? word.toLowerCase())
    .join(" ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNested(value: unknown): boolean {
  return Array.isArray(value) || isRecord(value);
}

function Placeholder({ children }: { children: string }): ReactElement {
  return <span className="text-muted-foreground italic">{children}</span>;
}

function DataValue({ value, formatLabel }: { value: unknown; formatLabel: (key: string) => string }): ReactElement {
  if (Array.isArray(value)) {
    if (value.length === 0) return <Placeholder>None</Placeholder>;
    // Lists of plain values read as one line; lists of records are numbered so each record stays distinct.
    return value.some(isNested) ? (
      <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-muted-foreground">
        {value.map((item, index) => (
          <li key={index} className="min-w-0">
            <DataValue value={item} formatLabel={formatLabel} />
          </li>
        ))}
      </ol>
    ) : (
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {value.map((item, index) => (
          <li key={index} className="min-w-0 break-words">
            <DataValue value={item} formatLabel={formatLabel} />
          </li>
        ))}
      </ul>
    );
  }
  if (isRecord(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return <Placeholder>None</Placeholder>;
    return (
      <dl className="grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-4 gap-y-1">
        {entries.map(([key, item]) => (
          <Fragment key={key}>
            <dt className="min-w-0 break-words text-muted-foreground">{formatLabel(key)}</dt>
            <dd className={cn("min-w-0 break-words", isRecord(item) && "border-l border-border pl-3")}>
              <DataValue value={item} formatLabel={formatLabel} />
            </dd>
          </Fragment>
        ))}
      </dl>
    );
  }
  if (value === null || value === undefined) return <Placeholder>None</Placeholder>;
  if (typeof value === "boolean") return <>{value ? "Yes" : "No"}</>;
  if (value === "") return <Placeholder>Empty</Placeholder>;
  return <>{String(value)}</>;
}

/** Presents JSON-compatible data as labelled, nested lists that people can read without knowing JSON. */
function DataViewer({
  value,
  label = "Data",
  formatLabel = formatDataLabel,
  density,
  className,
  ...props
}: DataViewerProps): ReactElement {
  return (
    <section
      aria-label={label}
      data-density={density}
      data-slot="data-viewer"
      className={cn("min-w-0 text-sm", className)}
      {...props}
    >
      <DataValue value={value} formatLabel={formatLabel} />
    </section>
  );
}

export { DataViewer, formatDataLabel };
export type { DataViewerProps };
