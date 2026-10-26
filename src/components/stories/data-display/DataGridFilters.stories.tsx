import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FilteredDataGridExample, fixture_gridRecordings } from "../fixtures";

function rowNames(canvasElement: HTMLElement): string[] {
  return within(canvasElement)
    .getAllByRole("row", { hidden: true })
    .slice(1)
    .map((row) => row.querySelector("td")?.textContent ?? "");
}

const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/data-display/DataGridFilters",
  tags: ["autodocs", "test"],
  render: () => <FilteredDataGridExample recordings={fixture_gridRecordings} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(rowNames(canvasElement)).toEqual(["Tide", "Ember", "Drift", "Signal", "Bloom"]);
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    const filters = await page.findByRole("dialog", { name: "Filters" });
    const panel = within(filters);
    await expect(panel.getByRole("button", { name: "Clear filters" })).toBeDisabled();
    // Placeholders suggest the range of present values, formatted like the bounds.
    await expect(panel.getByRole("textbox", { name: "Minimum Tempo" })).toHaveAttribute("placeholder", "122");
    await expect(panel.getByRole("textbox", { name: "Maximum Tempo" })).toHaveAttribute("placeholder", "140");
    await expect(panel.getByRole("textbox", { name: "Minimum Year" })).toHaveAttribute("placeholder", "1998");

    await userEvent.type(panel.getByRole("textbox", { name: "Minimum Tempo" }), "125");
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["Ember", "Drift", "Signal"]));
    await expect(canvas.getByRole("button", { name: "Filters 1 active", hidden: true })).toBeVisible();
    // The year range now suggests only the recordings the tempo filter leaves.
    await expect(panel.getByRole("textbox", { name: "Minimum Year" })).toHaveAttribute("placeholder", "2004");

    await userEvent.click(panel.getByRole("combobox", { name: "Genre" }));
    await expect((await page.findAllByRole("option")).map((option) => option.textContent)).toEqual([
      "Ambient 0",
      "House 1",
      "Techno 2",
    ]);
    await userEvent.click(page.getByRole("option", { name: "Techno 2" }));
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["Ember", "Signal"]));
    await expect(panel.getByRole("button", { name: "Remove Techno" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("option", { name: "Techno 2" })).not.toBeInTheDocument());
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();

    await userEvent.click(panel.getByRole("combobox", { name: "Recorded in" }));
    await expect((await page.findAllByRole("option")).map((option) => option.textContent)).toEqual([
      "Studio A 1",
      "Studio B 1",
    ]);
    await userEvent.click(page.getByRole("option", { name: "Studio B 1" }));
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["Ember"]));
    await expect(panel.getByRole("combobox", { name: "Recorded in" })).toHaveValue("Studio B");
    await expect(canvas.getByRole("button", { name: "Filters 3 active", hidden: true })).toBeVisible();

    await userEvent.click(panel.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["Tide", "Ember", "Drift", "Signal", "Bloom"]));
    await expect(panel.getByRole("textbox", { name: "Minimum Tempo" })).toHaveValue("");
    await expect(panel.getByRole("button", { name: "Clear filters" })).toBeDisabled();

    // An upper bound alone leaves the range open below; rows without a value never match a range.
    await userEvent.type(panel.getByRole("textbox", { name: "Maximum Tempo" }), "125");
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["Tide"]));
    await userEvent.clear(panel.getByRole("textbox", { name: "Maximum Tempo" }));
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["Tide", "Ember", "Drift", "Signal", "Bloom"]));
    await expect(canvas.getByRole("button", { name: "Filters", hidden: true })).toBeVisible();
  },
};

export const CombinedWithSearch: Story = {
  render: () => (
    <FilteredDataGridExample recordings={fixture_gridRecordings} initialFilters={[{ id: "tags", value: ["Vocal"] }]} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(rowNames(canvasElement)).toEqual(["Tide", "Ember", "Bloom"]);
    await userEvent.type(canvas.getByRole("textbox", { name: "Search recordings" }), "e");
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["Tide", "Ember"]));
    await userEvent.click(canvas.getByRole("button", { name: "Filters 1 active" }));
    const panel = within(await page.findByRole("dialog", { name: "Filters" }));
    // Counts and suggestions follow the search as well as the other filters.
    await expect(panel.getByRole("textbox", { name: "Maximum Tempo" })).toHaveAttribute("placeholder", "126.4");
    await userEvent.click(panel.getByRole("combobox", { name: "Genre" }));
    await expect((await page.findAllByRole("option")).map((option) => option.textContent)).toEqual([
      "Ambient 0",
      "House 1",
      "Techno 1",
    ]);
  },
};

export const SavedValueWithoutOption: Story = {
  render: () => (
    <FilteredDataGridExample recordings={fixture_gridRecordings} initialFilters={[{ id: "genre", value: ["Polka"] }]} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole("status")).toHaveTextContent("No results.");
    await userEvent.click(canvas.getByRole("button", { name: "Filters 1 active" }));
    const panel = within(await page.findByRole("dialog", { name: "Filters" }));
    await userEvent.click(panel.getByRole("button", { name: "Remove Polka" }));
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["Tide", "Ember", "Drift", "Signal", "Bloom"]));
    await expect(canvas.getByRole("button", { name: "Filters", hidden: true })).toBeVisible();
  },
};
