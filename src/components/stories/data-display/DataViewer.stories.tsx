import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DataViewer, formatDataLabel } from "../../DataViewer";

const meta: Meta<typeof DataViewer> = {
  title: "@alexgorbatchev/shadcn/components/data-display/DataViewer",
  component: DataViewer,
  tags: ["autodocs", "test"],
  args: { label: "Result" },
};
export default meta;
type Story = StoryObj<typeof meta>;

/** Reads each term with the definition that follows it. */
function pairs(view: HTMLElement): string[][] {
  return within(view)
    .getAllByRole("term")
    .map((term) => [term.textContent ?? "", term.nextElementSibling?.textContent ?? ""]);
}

export const TrackResult: Story = {
  args: {
    value: {
      track_id: 42,
      playlistIds: [3, 12],
      original_path: "/Music/First light.flac",
      timing_cleared: false,
      reanalysis_required: true,
      album: null,
      comment: "",
    },
  },
  play: async ({ canvasElement }) => {
    const view = within(canvasElement).getByRole("region", { name: "Result" });
    await expect(pairs(view)).toEqual([
      ["Track ID", "42"],
      ["Playlist IDs", "312"],
      ["Original path", "/Music/First light.flac"],
      ["Timing cleared", "No"],
      ["Reanalysis required", "Yes"],
      ["Album", "None"],
      ["Comment", "Empty"],
    ]);
    const [first, second] = within(view).getAllByRole("listitem");
    await expect([first?.textContent, second?.textContent]).toEqual(["3", "12"]);
    await expect(view).not.toHaveTextContent("{");
    await expect(view).not.toHaveTextContent('"');
  },
};

export const NestedRecords: Story = {
  args: {
    value: {
      imported: [
        { id: "staged-1", track_id: 7 },
        { id: "staged-2", track_id: 8 },
      ],
      failed: [],
      source: { percent: 50, metadata: {} },
    },
  },
  play: async ({ canvasElement }) => {
    const view = within(canvasElement).getByRole("region", { name: "Result" });
    const imported = within(view).getByRole("list");
    await expect(imported.tagName).toBe("OL");
    const records = within(imported).getAllByRole("listitem");
    await expect(records.map((record) => pairs(record))).toEqual([
      [
        ["ID", "staged-1"],
        ["Track ID", "7"],
      ],
      [
        ["ID", "staged-2"],
        ["Track ID", "8"],
      ],
    ]);
    await expect(pairs(view).filter(([term]) => ["Failed", "Metadata"].includes(term ?? ""))).toEqual([
      ["Failed", "None"],
      ["Metadata", "None"],
    ]);
  },
};

export const PlainValue: Story = {
  args: { value: "Finished", label: "Status" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("region", { name: "Status" })).toHaveTextContent(/^Finished$/);
  },
};

export const Empty: Story = {
  args: { value: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("region", { name: "Result" })).toHaveTextContent(/^None$/);
  },
};

export const CustomLabels: Story = {
  args: {
    value: { bpm: 128, source_url: "https://example.com/track" },
    formatLabel: (key) => (key === "bpm" ? "Tempo (BPM)" : formatDataLabel(key)),
  },
  play: async ({ canvasElement }) => {
    await expect(pairs(within(canvasElement).getByRole("region", { name: "Result" }))).toEqual([
      ["Tempo (BPM)", "128"],
      ["Source URL", "https://example.com/track"],
    ]);
    await expect(formatDataLabel("trackIDs")).toBe("Track IDs");
    await expect(formatDataLabel("api-url")).toBe("API URL");
    await expect(formatDataLabel("")).toBe("");
  },
};
