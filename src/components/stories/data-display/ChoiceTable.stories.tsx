import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ChoiceTable, type IChoiceTableColumn, type IChoiceTableRow } from "../../ChoiceTable";
import { Badge } from "../../Badge";
import { Button } from "../../Button";

const SOURCES = [
  {
    id: "soundcloud",
    source: "SoundCloud",
    title: "Undertow Signal (Original Mix)",
    channel: "Fenwick Rao",
    length: "6:28",
  },
  { id: "bandcamp", source: "Bandcamp", title: "Undertow Signal", channel: "Rao Unit Records", length: "6:27" },
  {
    id: "youtube-edit",
    source: "YouTube",
    title: "Undertow Signal (Radio Edit)",
    channel: "Low Orbit Music",
    length: "3:12",
  },
  { id: "youtube-clip", source: "YouTube", title: "Undertow Signal", channel: "tideclips", length: "1:30" },
];

const COLUMNS: IChoiceTableColumn[] = [
  { id: "source", header: "Source", width: "7rem" },
  { id: "title", header: "Title", width: "minmax(0, 2fr)" },
  { id: "channel", header: "Channel" },
  { id: "length", header: "Length", width: "4rem", isEnd: true },
];

function ChoiceTableExample(): ReactElement {
  const [chosen, setChosen] = useState<string | undefined>("soundcloud");
  const [confirmed, setConfirmed] = useState<string>();
  const rows: IChoiceTableRow[] = SOURCES.map((source) => ({
    id: source.id,
    label: `${source.source} · ${source.title} · ${source.length}`,
    cells: [
      source.source,
      <span key="title" className="flex flex-col gap-1">
        {source.title}
        {source.id === "youtube-edit" && <Badge variant="secondary">In collection</Badge>}
      </span>,
      source.channel,
      source.length,
    ],
    detail:
      source.id === "bandcamp" ? (
        <span className="flex items-center justify-between gap-2">
          Fetched to Inbox
          <Button size="sm" variant="outline">
            Undo
          </Button>
        </span>
      ) : undefined,
  }));
  return (
    <div className="flex w-[640px] flex-col gap-2">
      <p data-testid="chosen">{chosen ?? "none"}</p>
      <p data-testid="confirmed">{confirmed ?? "none"}</p>
      <ChoiceTable
        label="Sources"
        columns={COLUMNS}
        rows={rows}
        value={chosen}
        onValueChange={setChosen}
        onConfirm={setConfirmed}
      />
    </div>
  );
}

const meta: Meta<typeof ChoiceTable> = {
  title: "@alexgorbatchev/shadcn/components/data-display/ChoiceTable",
  component: ChoiceTable,
  tags: ["autodocs", "test"],
  args: { label: "Sources", columns: [], rows: [], value: undefined, onValueChange: () => undefined },
  render: () => <ChoiceTableExample />,
};
export default meta;
type Story = StoryObj<typeof ChoiceTable>;

function text(canvasElement: HTMLElement, id: string): string {
  return within(canvasElement).getByTestId(id).textContent ?? "";
}

/** One tab stop: ↑/↓, Home and End choose; Enter confirms and keeps focus; Space and ←/→ are left to the page. */
export const KeyboardChoice: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("grid", { name: "Sources" });
    await userEvent.tab();
    await expect(grid).toHaveFocus();
    await expect(
      canvas.getByRole("row", { name: "SoundCloud · Undertow Signal (Original Mix) · 6:28" }),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(text(canvasElement, "chosen")).toBe("youtube-edit");
    await expect(grid).toHaveAttribute("aria-activedescendant", canvas.getByRole("row", { selected: true }).id);
    await userEvent.keyboard("{Enter}");
    await expect(text(canvasElement, "confirmed")).toBe("youtube-edit");
    await expect(grid).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(text(canvasElement, "chosen")).toBe("youtube-clip");
    await userEvent.keyboard("{ArrowDown}");
    await expect(text(canvasElement, "chosen")).toBe("youtube-clip");
    await userEvent.keyboard("{Home}{ArrowUp}");
    await expect(text(canvasElement, "chosen")).toBe("soundcloud");
    // Space, ← and → and modified keys belong to the page.
    await userEvent.keyboard(" {ArrowRight}{ArrowLeft}{Shift>}{ArrowDown}{/Shift}{Control>}{Enter}{/Control}");
    await expect(text(canvasElement, "chosen")).toBe("soundcloud");
    await expect(text(canvasElement, "confirmed")).toBe("youtube-edit");
  },
};

/** A click chooses its row and focuses the table; a click inside a row's detail does not change the choice. */
export const PointerChoice: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("tideclips"));
    await expect(text(canvasElement, "chosen")).toBe("youtube-clip");
    await expect(canvas.getByRole("grid", { name: "Sources" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
    await expect(text(canvasElement, "chosen")).toBe("youtube-clip");
    await expect(canvas.getByRole("button", { name: "Undo" })).toHaveFocus();
    // Keys pressed on a detail's control stay with that control.
    await userEvent.keyboard("{ArrowUp}");
    await expect(text(canvasElement, "chosen")).toBe("youtube-clip");
  },
};

function EmptyChoiceTable(): ReactElement {
  const [chosen, setChosen] = useState<string>();
  return (
    <div className="flex w-[480px] flex-col gap-2">
      <p data-testid="chosen">{chosen ?? "none"}</p>
      <ChoiceTable
        label="Sources"
        columns={COLUMNS}
        rows={SOURCES.slice(0, 2).map((source) => ({
          id: source.id,
          label: source.title,
          cells: [source.source, source.title, source.channel, source.length],
        }))}
        value={chosen}
        onValueChange={setChosen}
      />
    </div>
  );
}

/** With nothing chosen, Enter does nothing and the first arrow press chooses the first row. */
export const NothingChosen: Story = {
  render: () => <EmptyChoiceTable />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("grid", { name: "Sources" })).not.toHaveAttribute("aria-activedescendant");
    await userEvent.keyboard("{Enter}{ArrowUp}");
    await expect(text(canvasElement, "chosen")).toBe("soundcloud");
  },
};
