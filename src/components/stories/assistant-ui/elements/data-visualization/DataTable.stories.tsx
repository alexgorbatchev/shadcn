import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DataTable } from "../../../../assistant-ui/elements/DataTable.js";

const meta: Meta<typeof DataTable> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/DataTable",
  component: DataTable,
  tags: ["autodocs", "test"],
  args: {
    caption: "Project activity",
    rowKey: "id",
    columns: [
      { key: "name", label: "Name", priority: "primary" },
      { key: "count", label: "Count", format: { kind: "number", decimals: 0 } },
    ],
    rows: [
      { id: "b", name: "Bravo", count: 4 },
      { id: "a", name: "Alpha", count: 12 },
      { id: "c", name: "Charlie", count: null },
    ],
    onSortChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-full">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Sort: Story = {
  play: async ({ args, canvasElement }) => {
    const table = within(canvasElement).getByRole("table", { name: "Project activity" });
    const canvas = within(table);
    const sort = canvas.getByRole("button", { name: "Sort by Count" });
    await userEvent.click(sort);
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: "count", direction: "asc" });
    await expect(canvas.getByRole("columnheader", { name: "Count" })).toHaveAttribute("aria-sort", "ascending");
    await expect(canvas.getAllByRole("row").map((row) => row.textContent)).toEqual([
      "NameCount↑",
      "Bravo4",
      "Alpha12",
      "Charlienone",
    ]);
    await userEvent.click(sort);
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: "count", direction: "desc" });
    await expect(canvas.getAllByRole("row").map((row) => row.textContent)).toEqual([
      "NameCount↓",
      "Alpha12",
      "Bravo4",
      "Charlienone",
    ]);
    await userEvent.click(sort);
    await expect(args.onSortChange).toHaveBeenLastCalledWith(null);
  },
};
export const Formats: Story = {
  args: {
    caption: "Formatted values",
    columns: [
      { key: "price", label: "Price", format: { kind: "currency", currency: "USD", decimals: 2 } },
      { key: "ratio", label: "Ratio", format: { kind: "percent", decimals: 0 } },
      { key: "change", label: "Change", format: { kind: "delta", unit: "ms", upIsGood: false } },
      { key: "enabled", label: "Enabled", format: { kind: "boolean", trueLabel: "On", falseLabel: "Off" } },
      { key: "status", label: "Status", format: { kind: "badge", tones: { Ready: "success" } } },
      { key: "tags", label: "Tags", format: { kind: "list", max: 1 } },
    ],
    rows: [{ price: 12.5, ratio: 0.25, change: -5, enabled: true, status: "Ready", tags: ["UI", "API"] }],
  },
  play: async ({ canvasElement }) => {
    const table = within(within(canvasElement).getByRole("table"));
    for (const text of ["$12.50", "25%", "↓ 5 ms", "On", "Ready", "UI", "+1"])
      await expect(table.getByText(text)).toBeVisible();
  },
};
export const LinksAndDates: Story = {
  args: {
    relativeTo: Date.parse("2026-10-20T12:00:00Z"),
    columns: [
      { key: "name", label: "Documentation", format: { kind: "link", hrefKey: "url" } },
      { key: "date", label: "Date", format: { kind: "date", style: "relative" } },
    ],
    rows: [
      { name: "Guide", url: "https://example.com/guide", date: "2026-10-19T12:00:00Z" },
      { name: "Unsafe source", url: "javascript:alert(1)", date: "invalid" },
    ],
  },
  play: async ({ canvasElement }) => {
    const table = within(within(canvasElement).getByRole("table"));
    await expect(table.getByRole("link", { name: "Guide (opens in a new tab)" })).toHaveAttribute(
      "href",
      "https://example.com/guide",
    );
    await expect(table.queryByRole("link", { name: "Unsafe source" })).not.toBeInTheDocument();
    await expect(table.getByText("yesterday")).toBeVisible();
    await expect(table.getByText("invalid")).toBeVisible();
  },
};
export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list");
    await expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    await expect(within(list).getByText("Alpha")).toBeVisible();
    await expect(within(canvasElement).queryByRole("table")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { rows: [], emptyMessage: "No activity yet" },
  play: async ({ canvasElement }) => {
    const table = within(within(canvasElement).getByRole("table"));
    await expect(table.getByRole("status")).toHaveTextContent("No activity yet");
  },
};
export const NumericFallbacks: Story = {
  args: {
    caption: "Unexpected numeric input",
    columns: [
      { key: "number", label: "Number", format: { kind: "number", compact: true, unit: "kg" } },
      { key: "currency", label: "Currency", format: { kind: "currency", currency: "?" } },
      { key: "percent", label: "Percent", format: { kind: "percent", basis: "unit" } },
      { key: "delta", label: "Delta", format: { kind: "delta" } },
    ],
    rows: [
      { number: "unknown mass", currency: "pending invoice", percent: "pending ratio", delta: "pending change" },
      { number: 1200, currency: 20, percent: 25, delta: 0 },
      { number: 2, currency: 12, percent: 100, delta: 4 },
    ],
  },
  play: async ({ canvasElement }) => {
    const table = within(within(canvasElement).getByRole("table"));
    for (const text of [
      "unknown mass",
      "pending invoice",
      "pending ratio",
      "pending change",
      "1.2K kg",
      "20",
      "25%",
      "→ 0",
      "↑ 4",
    ])
      await expect(table.getByText(text)).toBeVisible();
  },
};
export const DefaultBooleanAndBadgeLabels: Story = {
  args: {
    columns: [
      { key: "enabled", label: "Enabled", format: { kind: "boolean" } },
      { key: "status", label: "Status", format: { kind: "badge", tones: { Failed: "danger", Caution: "warning" } } },
      { key: "tags", label: "Tags", format: { kind: "list" } },
    ],
    rows: [
      { enabled: true, status: "Failed", tags: ["One", "Two"] },
      { enabled: false, status: "Caution", tags: [] },
      { enabled: "Unknown", status: "Pending", tags: "Unclassified" },
    ],
  },
  play: async ({ canvasElement }) => {
    const table = within(within(canvasElement).getByRole("table"));
    for (const text of ["Yes", "No", "Unknown", "Failed", "Caution", "Pending", "One", "Two", "Unclassified"])
      await expect(table.getByText(text)).toBeVisible();
  },
};
export const LocalLinksAndCalendarDates: Story = {
  args: {
    locale: "en-US",
    columns: [
      { key: "link", label: "Link", format: { kind: "link" } },
      { key: "date", label: "Date", format: { kind: "date" } },
    ],
    rows: [
      { link: "/guide", date: "2024-02-29" },
      { link: 123, date: "2023-02-29" },
    ],
  },
  play: async ({ canvasElement }) => {
    const table = within(within(canvasElement).getByRole("table"));
    await expect(table.getByRole("link", { name: "/guide" })).toHaveAttribute("href", "/guide");
    await expect(table.queryByRole("link", { name: "123" })).not.toBeInTheDocument();
    await expect(table.getByText("Feb 29, 2024")).toBeVisible();
    await expect(table.getByText("2023-02-29")).toBeVisible();
  },
};
export const StableDefaultSort: Story = {
  args: {
    defaultSort: { key: "count", direction: "asc" },
    columns: [
      { key: "name", label: "Name", sortable: false, width: "50%", align: "start" },
      { key: "count", label: "Count" },
    ],
    rows: [
      { name: "First", count: 2 },
      { name: "Second", count: 2 },
      { name: "Missing", count: null },
    ],
  },
  play: async ({ canvasElement }) => {
    const table = within(within(canvasElement).getByRole("table"));
    await expect(table.queryByRole("button", { name: "Sort by Name" })).not.toBeInTheDocument();
    await expect(table.getAllByRole("row").map((row) => row.textContent)).toEqual([
      "NameCount↑",
      "First2",
      "Second2",
      "Missingnone",
    ]);
  },
};
export const ControlledSort: Story = {
  args: { sort: { key: "count", direction: "desc" } },
  play: async ({ canvasElement, args }) => {
    const table = within(within(canvasElement).getByRole("table"));
    await userEvent.click(table.getByRole("button", { name: "Sort by Count" }));
    await expect(args.onSortChange).toHaveBeenCalledWith(null);
    await expect(table.getByRole("columnheader", { name: "Count" })).toHaveAttribute("aria-sort", "descending");
    await expect(table.getAllByRole("row")[1]).toHaveTextContent("Alpha12");
  },
};
export const EmptyMobile: Story = {
  ...Mobile,
  args: { rows: [] },
  play: async ({ canvasElement }) => {
    await expect(within(within(canvasElement).getByRole("list")).getByRole("status")).toHaveTextContent("No rows");
  },
};
export const SingleColumn: Story = {
  ...Mobile,
  args: { columns: [{ key: "name", label: "Name" }] },
  play: async ({ canvasElement }) => {
    const list = within(within(canvasElement).getByRole("list"));
    await expect(list.getByText("Alpha")).toBeVisible();
    await expect(list.queryByText("Count")).not.toBeInTheDocument();
  },
};
export const LiveRelativeDate: Story = {
  args: {
    caption: "",
    columns: [{ key: "date", label: "Updated", format: { kind: "date", style: "relative" } }],
    rows: [{ date: new Date().toISOString() }],
  },
  play: async ({ canvasElement }) => {
    const table = within(within(canvasElement).getByRole("table"));
    await expect(table.getByRole("cell")).toHaveTextContent(/now|second/);
  },
};
export const NoColumns: Story = {
  ...Mobile,
  args: { columns: [], rows: [{}] },
  play: async ({ canvasElement }) => {
    await expect(within(within(canvasElement).getByRole("list")).getByRole("listitem")).toBeEmptyDOMElement();
  },
};
