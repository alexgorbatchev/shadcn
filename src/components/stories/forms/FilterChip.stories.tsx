import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { FilterChip } from "../../FilterChip";

const meta: Meta<typeof FilterChip> = {
  title: "@alexgorbatchev/shadcn/components/forms/FilterChip",
  component: FilterChip,
  tags: ["autodocs", "test"],
  args: { children: "Showing 1 of 4 threads on ‘type scale and palette’", onClear: fn() },
  render: (args) => (
    <div className="w-96">
      <FilterChip {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof FilterChip>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole("group", { name: "Showing 1 of 4 threads on ‘type scale and palette’" });
    await expect(chip).toBeVisible();
    await userEvent.click(within(chip).getByRole("button", { name: "Show all" }));
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};

export const EscapeClears: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const clear = canvas.getByRole("button", { name: "Show all" });
    await expect(clear).toHaveAttribute("aria-keyshortcuts", "Escape");
    clear.focus();
    await userEvent.keyboard("{Escape}");
    await expect(args.onClear).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Enter}");
    await expect(args.onClear).toHaveBeenCalledTimes(2);
  },
};

/** A consumer that handles Escape itself, for example to close a popover inside the chip, keeps the filter. */
export const ConsumerHandlesEscape: Story = {
  args: {
    onKeyDown: (event) => {
      if (event.key === "Escape") event.preventDefault();
    },
  },
  play: async ({ canvasElement, userEvent, args }) => {
    within(canvasElement).getByRole("button", { name: "Show all" }).focus();
    await userEvent.keyboard("{Escape}");
    await expect(args.onClear).not.toHaveBeenCalled();
  },
};

export const CustomClearLabel: Story = {
  args: { clearLabel: "Clear filter", children: "Mine · 3 of 12 threads" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Clear filter" })).toBeVisible();
  },
};

/** The chip disappears with its filter; a list owner renders it only while the filter is active. */
export const FilteredList: Story = {
  render: function Render() {
    const items = ["Hero layout", "type scale and palette", "Footer links", "Pricing table"];
    const [filter, setFilter] = useState<string | undefined>("type scale and palette");
    const shown = filter ? items.filter((item) => item === filter) : items;
    return (
      <div className="flex w-96 flex-col gap-2">
        {filter && (
          <FilterChip onClear={() => setFilter(undefined)}>
            Showing {shown.length} of {items.length} threads on ‘{filter}’
          </FilterChip>
        )}
        <ul aria-label="Threads">
          {shown.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(within(canvas.getByRole("list", { name: "Threads" })).getAllByRole("listitem")).toHaveLength(1);
    await userEvent.click(canvas.getByRole("button", { name: "Show all" }));
    await expect(within(canvas.getByRole("list", { name: "Threads" })).getAllByRole("listitem")).toHaveLength(4);
    await expect(canvas.queryByRole("group")).toBeNull();
  },
};

/** Keeps breathing room between the summary label and the clear button, with the button inset from the chip edges. */
export const NarrowSpacing: Story = {
  render: () => (
    <div className="w-[280px]">
      <FilterChip onClear={fn()}>Showing 2 of 2 threads · New</FilterChip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole("group");
    const label = chip.querySelector<HTMLElement>("[data-slot='filter-chip-label']");
    const clear = within(chip).getByRole("button", { name: "Show all" });
    await expect(label).not.toBeNull();
    const chipRect = chip.getBoundingClientRect();
    const labelRect = label!.getBoundingClientRect();
    const clearRect = clear.getBoundingClientRect();
    await expect(clearRect.left - labelRect.right).toBeGreaterThanOrEqual(7);
    await expect(chipRect.right - clearRect.right).toBeGreaterThanOrEqual(3);
  },
};
