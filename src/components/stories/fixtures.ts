import type {
  ChartBrowserDatum,
  GridFile,
  GridRecording,
  InvoiceRecord,
  NumberedProjectChoice,
  RuntimeChoice,
  RuntimeEngine,
  TechnologyGroup,
} from "./fixtures/types";
import type { IImageRect } from "../image-viewer";
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
export { ResponsiveTablesExample } from "./fixtures/ResponsiveTablesExample";
export { FilteredDataGridExample } from "./fixtures/FilteredDataGridExample";

export const fixture_virtualRows: string[] = Array.from({ length: 1000 }, (_, index) => `Item ${index}`);

export const fixture_gridFiles: GridFile[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `file-${index}`,
  name: `File ${index}`,
  kind: ["Audio", "Image", "Text"][index % 3] ?? "Text",
  owner: ["Alex", "Blair", "Casey"][index % 3] ?? "Alex",
  size: (index * 37) % 1000,
}));

export const fixture_gridRecordings: GridRecording[] = [
  { id: "r1", name: "Tide", tempo: 122, year: 1998, genre: "House", room: "Studio A", tags: ["Vocal"] },
  { id: "r2", name: "Ember", tempo: 126.4, year: 2004, genre: "Techno", room: "Studio B", tags: ["Dub", "Vocal"] },
  { id: "r3", name: "Drift", tempo: 128, year: 2012, genre: "House", room: "Studio A", tags: ["Dub"] },
  { id: "r4", name: "Signal", tempo: 140, year: 2019, genre: "Techno", room: "Studio A", tags: [] },
  { id: "r5", name: "Bloom", tempo: null, year: 2021, genre: "Ambient", room: "Studio B", tags: ["Vocal"] },
];

/** The button rectangle that changes color between the before and after screenshots, in natural pixels. */
export const fixture_changedRegion: IImageRect = { x: 600, y: 360, width: 160, height: 48 };

/**
 * Builds a deterministic dashboard-like screenshot from axis-aligned rectangles, without fonts or antialiasing. Only
 * the call-to-action button at `fixture_changedRegion` takes `buttonFill`.
 */
export function factory_screenshot(width: number, height: number, buttonFill: string): string {
  const rect = (x: number, y: number, rectWidth: number, rectHeight: number, fill: string): string =>
    `<rect x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}" fill="${fill}"/>`;
  const cards = [0, 1, 2]
    .map((index) => rect(232 + index * 232, 88, 208, 120, "#ffffff") + rect(248 + index * 232, 104, 96, 16, "#94a3b8"))
    .join("");
  const rows = [0, 1, 2, 3]
    .map((index) => rect(232, 240 + index * 40, 344, 24, index % 2 ? "#e2e8f0" : "#cbd5e1"))
    .join("");
  const { x, y, width: buttonWidth, height: buttonHeight } = fixture_changedRegion;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    rect(0, 0, width, height, "#f1f5f9") +
    rect(0, 0, width, 56, "#1e293b") +
    rect(24, 16, 120, 24, "#475569") +
    rect(0, 56, 200, height - 56, "#e2e8f0") +
    rect(24, 88, 152, 20, "#94a3b8") +
    rect(24, 128, 120, 20, "#cbd5e1") +
    cards +
    rows +
    rect(x, y, buttonWidth, buttonHeight, buttonFill) +
    "</svg>";
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const fixture_beforeScreenshot: string = factory_screenshot(960, 600, "#2563eb");
export const fixture_afterScreenshot: string = factory_screenshot(960, 600, "#dc2626");
/** A 16:9 capture of the before state, compared against the 16:10 after screenshot. */
export const fixture_widerBeforeScreenshot: string = factory_screenshot(960, 540, "#2563eb");
/** A screenshot larger than typical story frames, for scrolling at original size. */
export const fixture_largeScreenshot: string = factory_screenshot(1600, 1000, "#2563eb");
/** A screenshot smaller than story frames, which fit zoom must not upscale. */
export const fixture_smallScreenshot: string = factory_screenshot(240, 150, "#2563eb");
export const fixture_brokenImage: string = "data:image/png;base64,AAAA";
