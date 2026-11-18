import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ReviewList, type IReviewListRow } from "../../ReviewList";
import { Button } from "../../Button";

const TITLES = ["Undertow Signal", "Signal Path", "Harbour Lights", "Night Groove", "Glass Steps"];

function ReviewListExample(): ReactElement {
  const [included, setIncluded] = useState<ReadonlySet<string>>(() => new Set(TITLES));
  const rows: IReviewListRow[] = TITLES.map((title) => ({
    id: title,
    isIncluded: included.has(title),
    checkboxLabel: `Include ${title}`,
    content: <span>{`${title} · Minimal → Tech House`}</span>,
    cells: [
      <Button key="details" size="sm" variant="ghost" tabIndex={-1}>
        {`Details for ${title}`}
      </Button>,
    ],
  }));
  return (
    <div className="flex w-[480px] flex-col gap-2">
      <p data-testid="included">{TITLES.filter((title) => included.has(title)).join(", ") || "none"}</p>
      <ReviewList
        label="Tracks"
        rows={rows}
        onIncludedChange={(ids, isIncluded) =>
          setIncluded((current) => {
            const next = new Set(current);
            for (const id of ids) {
              if (isIncluded) next.add(id);
              else next.delete(id);
            }
            return next;
          })
        }
      />
    </div>
  );
}

const meta: Meta<typeof ReviewList> = {
  title: "@alexgorbatchev/shadcn/components/data-display/ReviewList",
  component: ReviewList,
  tags: ["autodocs", "test"],
  args: { label: "Tracks", rows: [], onIncludedChange: () => undefined },
  render: () => <ReviewListExample />,
};
export default meta;
type Story = StoryObj<typeof ReviewList>;

function includedTitles(canvasElement: HTMLElement): string {
  return within(canvasElement).getByTestId("included").textContent ?? "";
}

function cellOf(canvasElement: HTMLElement, title: string): HTMLElement | null {
  return within(canvasElement).getByText(`${title} · Minimal → Tech House`).closest("[role='gridcell']");
}

/** A click only moves the cursor; the tick, Mod+click and Shift change what the plan includes. */
export const PointerGestures: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Signal Path · Minimal → Tech House"));
    await expect(includedTitles(canvasElement)).toBe(TITLES.join(", "));
    await expect(cellOf(canvasElement, "Signal Path")).toHaveFocus();
    // The tick toggles its row and makes it the anchor.
    await userEvent.click(canvas.getByRole("checkbox", { name: "Include Signal Path" }));
    await expect(canvas.getByRole("checkbox", { name: "Include Signal Path" })).not.toBeChecked();
    // Shift+click sets the range from the anchor to the anchor's state: excluded.
    await userEvent.keyboard("{Shift>}");
    await userEvent.click(canvas.getByText("Night Groove · Minimal → Tech House"));
    await userEvent.keyboard("{/Shift}");
    await expect(includedTitles(canvasElement)).toBe("Undertow Signal, Glass Steps");
    // Mod+click toggles one row.
    await userEvent.keyboard("{Control>}");
    await userEvent.click(canvas.getByText("Harbour Lights · Minimal → Tech House"));
    await userEvent.keyboard("{/Control}");
    await expect(canvas.getByRole("checkbox", { name: "Include Harbour Lights" })).toBeChecked();
  },
};

/** One tab stop: arrows move the cursor and between cells, X and Shift+Space toggle, Mod+A includes every row. */
export const KeyboardGestures: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("grid", { name: "Tracks" });
    await expect(grid.querySelectorAll("[tabindex='0']")).toHaveLength(1);
    await userEvent.tab();
    await expect(
      canvas.getByRole("checkbox", { name: "Include Undertow Signal" }).closest("[role='gridcell']"),
    ).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}x");
    await expect(canvas.getByRole("checkbox", { name: "Include Signal Path" })).not.toBeChecked();
    await userEvent.keyboard("{ArrowDown}{Shift>} {/Shift}");
    await expect(canvas.getByRole("checkbox", { name: "Include Harbour Lights" })).not.toBeChecked();
    // ← and → move between the row's cells, reaching its controls.
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Details for Harbour Lights" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(cellOf(canvasElement, "Harbour Lights")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(cellOf(canvasElement, "Glass Steps")).toHaveFocus();
    await userEvent.keyboard("{Control>}a{/Control}");
    await expect(includedTitles(canvasElement)).toBe(TITLES.join(", "));
    // Space is left to the page, such as a player.
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("checkbox", { name: "Include Glass Steps" })).toBeChecked();
  },
};
