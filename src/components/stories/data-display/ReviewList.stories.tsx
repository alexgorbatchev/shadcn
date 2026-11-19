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

interface ITreeNode {
  id: string;
  children?: readonly ITreeNode[];
}

const TREE: readonly ITreeNode[] = [
  { id: "Crates", children: [{ id: "Peak Time" }, { id: "Warmup" }] },
  { id: "Closing" },
  { id: "Archive", children: [{ id: "2025" }] },
];

function leavesOf(node: ITreeNode): string[] {
  return node.children ? node.children.flatMap(leavesOf) : [node.id];
}

function TreeReviewListExample(): ReactElement {
  const [included, setIncluded] = useState<ReadonlySet<string>>(() => new Set(TREE.flatMap(leavesOf)));
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set(["Crates"]));
  const byId = new Map<string, ITreeNode>();
  const rows: IReviewListRow[] = [];
  const add = (nodes: readonly ITreeNode[], level: number): void => {
    for (const node of nodes) {
      byId.set(node.id, node);
      const leaves = leavesOf(node);
      const count = leaves.filter((leaf) => included.has(leaf)).length;
      rows.push({
        id: node.id,
        level,
        isIncluded: count === leaves.length,
        isIndeterminate: count > 0 && count < leaves.length,
        ...(node.children && { isExpanded: expanded.has(node.id) }),
        checkboxLabel: `Include ${node.id}`,
        content: <span>{node.id}</span>,
      });
      if (node.children && expanded.has(node.id)) add(node.children, level + 1);
    }
  };
  add(TREE, 1);
  return (
    <div className="flex w-[480px] flex-col gap-2">
      <p data-testid="included">
        {TREE.flatMap(leavesOf)
          .filter((leaf) => included.has(leaf))
          .join(", ") || "none"}
      </p>
      <ReviewList
        label="Playlists"
        rows={rows}
        onExpandedChange={(id, isExpanded) =>
          setExpanded((current) => {
            const next = new Set(current);
            if (isExpanded) next.add(id);
            else next.delete(id);
            return next;
          })
        }
        onIncludedChange={(ids, isIncluded) =>
          setIncluded((current) => {
            const next = new Set(current);
            for (const leaf of ids.flatMap((id) => leavesOf(byId.get(id) ?? { id }))) {
              if (isIncluded) next.add(leaf);
              else next.delete(leaf);
            }
            return next;
          })
        }
      />
    </div>
  );
}

/** A tree review: Enter or the disclosure shows a folder's rows, a partly included folder is mixed, Shift+↓ ranges. */
export const TreeGestures: Story = {
  render: () => <TreeReviewListExample />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const tree = canvas.getByRole("treegrid", { name: "Playlists" });
    const row = (name: string): HTMLElement | null => canvas.getByText(name).closest("[role='row']");
    await expect(row("Peak Time")).toHaveAttribute("aria-level", "2");
    await expect(row("Crates")).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.queryByText("2025")).toBeNull();
    await userEvent.tab();
    // ↓ to Peak Time, X excludes it, and its folder turns mixed.
    await userEvent.keyboard("{ArrowDown}x");
    await expect(canvas.getByRole("checkbox", { name: "Include Crates" })).toHaveAttribute("aria-checked", "mixed");
    // Shift+↓ sets the range from the anchor (Peak Time) to the cursor to the anchor's state: excluded.
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await expect(includedTitlesOf(canvasElement)).toBe("Closing, 2025");
    await expect(canvas.getByRole("checkbox", { name: "Include Crates" })).not.toBeChecked();
    // Enter on a folder shows its rows; a click on the disclosure hides them again and never changes inclusion.
    await userEvent.keyboard("{End}{Enter}");
    await expect(row("Archive")).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText("2025")).toBeVisible();
    await expect(tree.querySelectorAll("[role='row']")).toHaveLength(6);
    const disclosure = row("Archive")?.querySelector<HTMLElement>("[data-slot='review-list-disclosure']");
    if (!disclosure) throw new Error("Archive has no disclosure");
    await userEvent.click(disclosure);
    await expect(canvas.queryByText("2025")).toBeNull();
    await expect(includedTitlesOf(canvasElement)).toBe("Closing, 2025");
    // Enter on a row without children does nothing.
    await userEvent.keyboard("{Home}{ArrowDown}{Enter}");
    await expect(tree.querySelectorAll("[role='row']")).toHaveLength(5);
  },
};

function includedTitlesOf(canvasElement: HTMLElement): string {
  return within(canvasElement).getByTestId("included").textContent ?? "";
}
