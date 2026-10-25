import type {
  ChartBrowserDatum,
  GridFile,
  InvoiceRecord,
  NumberedProjectChoice,
  RuntimeChoice,
  RuntimeEngine,
  TechnologyGroup,
} from "./fixtures/types";
import avatarImage from "./fixtures/avatar.svg";
import attachmentImage from "./fixtures/attachment.svg";

export const fixture_chartBrowsers: ChartBrowserDatum[] = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
];

export const fixture_avatarImage: string = avatarImage;

export const fixture_technologies: string[] = ["Bun", "Node.js", "Deno", "React", "TypeScript", "Tailwind CSS"];

export const fixture_technologyGroups: TechnologyGroup[] = [
  { label: "Runtimes", items: ["Bun", "Node.js", "Deno"] },
  { label: "Tools", items: ["React", "TypeScript", "Tailwind CSS"] },
];

export const fixture_runtimes: RuntimeChoice[] = [
  { label: "Select a runtime", value: null },
  { label: "Bun", value: "bun" },
  { label: "Node.js", value: "node" },
  { label: "Deno", value: "deno" },
];

export const fixture_runtimeEngines: RuntimeEngine[] = [
  { id: "bun", name: "Bun" },
  { id: "node", name: "Node.js" },
  { id: "deno", name: "Deno" },
];

export const fixture_projectNumbers: NumberedProjectChoice[] = Array.from({ length: 40 }, (_, value) => ({
  label: "Project " + value,
  value,
}));

export const fixture_attachmentImage: string = attachmentImage;

export const fixture_invoices: InvoiceRecord[] = [
  { id: "inv-001", email: "alex@example.com", amount: 250 },
  { id: "inv-002", email: "blair@example.com", amount: 100 },
  { id: "inv-003", email: "casey@example.com", amount: 300 },
  { id: "inv-004", email: "drew@example.com", amount: 50 },
  { id: "inv-005", email: "erin@example.com", amount: 200 },
];
export { VirtualizedTranscript } from "./fixtures/VirtualizedTranscript";
export { StreamingTranscript } from "./fixtures/StreamingTranscript";
export { AnimatedTranscript } from "./fixtures/AnimatedTranscript";
export { VirtualDataGridExample } from "./fixtures/VirtualDataGridExample";

export const fixture_virtualRows: string[] = Array.from({ length: 1000 }, (_, index) => `Item ${index}`);

export const fixture_gridFiles: GridFile[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `file-${index}`,
  name: `File ${index}`,
  kind: ["Audio", "Image", "Text"][index % 3] ?? "Text",
  owner: ["Alex", "Blair", "Casey"][index % 3] ?? "Alex",
  size: (index * 37) % 1000,
}));
