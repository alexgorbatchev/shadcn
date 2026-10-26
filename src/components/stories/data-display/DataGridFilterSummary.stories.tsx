import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FilteredDataGridExample, fixture_gridRecordings } from "../fixtures";

function rowNames(canvasElement: HTMLElement): string[] {
  return within(canvasElement)
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.querySelector("td")?.textContent ?? "");
}

const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/data-display/DataGridFilterSummary",
  tags: ["autodocs", "test"],
  render: () => (
    <FilteredDataGridExample
      recordings={fixture_gridRecordings}
      initialFilters={[
        { id: "tempo", value: [128, 120] },
        { id: "year", value: [2000, null] },
        { id: "tags", value: ["Vocal"] },
        { id: "room", value: ["Studio B"] },
      ]}
    />
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(rowNames(canvasElement)).toEqual(["Ember"]);
    const summary = canvas.getByRole("list", { name: "Active filters" });
    // Reversed bounds read in the order they filter, and filters name themselves by their own label.
    await expect(
      within(summary)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Tempo: 120–128", "Recorded in: Studio B", "Year: ≥ 2000", "Tags: Vocal"]);
    await userEvent.click(canvas.getByRole("button", { name: "Remove Tags filter" }));
    await userEvent.click(canvas.getByRole("button", { name: "Remove Recorded in filter" }));
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["Ember", "Drift"]));
    await expect(within(summary).getAllByRole("listitem")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(canvas.queryByRole("list", { name: "Active filters" })).not.toBeInTheDocument());
    await expect(rowNames(canvasElement)).toEqual(["Tide", "Ember", "Drift", "Signal", "Bloom"]);
  },
};

export const OpenEndedRange: Story = {
  render: () => (
    <FilteredDataGridExample
      recordings={fixture_gridRecordings}
      initialFilters={[{ id: "tempo", value: [null, 126] }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(rowNames(canvasElement)).toEqual(["Tide"]);
    await expect(canvas.getByRole("listitem")).toHaveTextContent("Tempo: ≤ 126");
  },
};
