import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactElement } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { TreeSelect, type ITreeSelectNode, type ITreeSelectProps } from "../../tree";

const destinations: ITreeSelectNode[] = [
  {
    id: "website",
    label: "Website redesign",
    children: [
      { id: "homepage", label: "Homepage" },
      { id: "navigation", label: "Navigation" },
      { id: "old", label: "Old explorations", disabledReason: "Archived" },
    ],
  },
  {
    id: "research",
    label: "CUSTOMER RESEARCH SYNTHESIS",
    children: [
      {
        id: "2026",
        label: "2026",
        children: [{ id: "november", label: "November", children: [{ id: "week46", label: "Week 46" }] }],
      },
    ],
  },
  { id: "offsite", label: "Archived: Q3 offsite", disabledReason: "Archived" },
];

const choose = fn();

function Picker(props: Partial<ITreeSelectProps>): ReactElement {
  const [value, setValue] = useState<string | null>("navigation");
  return (
    <div className="w-[360px]">
      <TreeSelect
        nodes={destinations}
        value={value}
        currentId="navigation"
        label="Destination"
        filterLabel="Filter places"
        filterPlaceholder="Filter places"
        onValueChange={(id) => {
          choose(id);
          setValue(id);
        }}
        {...props}
      />
      <output aria-label="Chosen">{value}</output>
    </div>
  );
}

const meta: Meta<typeof TreeSelect> = {
  component: TreeSelect,
  title: "@alexgorbatchev/shadcn/components/navigation/TreeSelect",
  tags: ["autodocs", "test"],
  render: () => <Picker />,
  beforeEach: () => {
    choose.mockClear();
  },
};
export default meta;
type Story = StoryObj<typeof TreeSelect>;

/** Every place shows in its hierarchy; the current place is marked and archived places are listed but not choosable. */
export const Hierarchy: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tree = canvas.getByRole("tree", { name: "Destination" });
    await expect(within(tree).getByRole("treeitem", { name: "Week 46" })).toBeVisible();
    // Places carry no file or folder icon: a leaf place is still a place, and the disclosure shows what holds others.
    await expect(tree.querySelector("[data-slot=tree-item] svg.lucide-file")).toBeNull();
    await expect(within(tree).getByRole("treeitem", { name: "Navigation" })).toHaveAccessibleDescription(
      "Current location",
    );
    const archived = within(tree).getByRole("treeitem", { name: "Old explorations" });
    await expect(archived).toHaveAccessibleDescription("Archived");
    await expect(archived).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(archived);
    await expect(choose).not.toHaveBeenCalled();
    await userEvent.click(within(tree).getByRole("treeitem", { name: "Homepage" }));
    await expect(choose).toHaveBeenCalledWith("homepage");
    await expect(canvas.getByLabelText("Chosen")).toHaveTextContent("homepage");
  },
};

/** The filter matches any place's name and keeps its ancestors in view; ↓ enters the tree and Enter chooses. */
export const FilterAndKeys: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Filter places" }), "week");
    const tree = canvas.getByRole("tree", { name: "Destination" });
    await waitFor(() => expect(within(tree).queryByRole("treeitem", { name: "Homepage" })).not.toBeInTheDocument());
    for (const name of ["CUSTOMER RESEARCH SYNTHESIS", "2026", "November", "Week 46"])
      await expect(within(tree).getByRole("treeitem", { name })).toBeVisible();
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(tree).getByRole("treeitem", { name: "CUSTOMER RESEARCH SYNTHESIS" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    await waitFor(() => expect(within(tree).getByRole("treeitem", { name: "Week 46" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(choose).toHaveBeenCalledWith("week46");
  },
};

/** A filter that matches nothing says so. */
export const NoMatches: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Filter places" }), "zzz");
    await expect(canvas.getByText("No matches")).toHaveAttribute("role", "status");
    await expect(canvas.queryByRole("tree")).not.toBeInTheDocument();
  },
};

/** Space chooses too, and a disabled picker chooses nothing. */
export const SpaceAndDisabled: Story = {
  render: () => <Picker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const homepage = canvas.getByRole("treeitem", { name: "Homepage" });
    homepage.focus();
    await userEvent.keyboard(" ");
    await expect(choose).toHaveBeenCalledWith("homepage");
  },
};

export const Disabled: Story = {
  render: () => <Picker isDisabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("searchbox", { name: "Filter places" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("treeitem", { name: "Homepage" }));
    await expect(choose).not.toHaveBeenCalled();
  },
};
