import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { Toolbar } from "../../Toolbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Select";
import { ToolbarToggleChip, type ToggleChipPressed } from "../../ToolbarToggleChip";

const meta: Meta<typeof ToolbarToggleChip> = {
  title: "@alexgorbatchev/shadcn/components/actions/ToolbarToggleChip",
  component: ToolbarToggleChip,
  tags: ["autodocs", "test"],
  args: { children: "Dark", pressed: "mixed", detail: "2 of 3", shortcut: "k", onPressedChange: fn() },
  render: function Example(args): ReactElement {
    const [pressed, setPressed] = useState<ToggleChipPressed>(args.pressed);
    return (
      <Toolbar aria-label="Tags">
        <ToolbarToggleChip
          {...args}
          pressed={pressed}
          onPressedChange={(next) => {
            setPressed(next);
            args.onPressedChange(next);
          }}
        />
        <ToolbarToggleChip pressed={false} onPressedChange={fn()} shortcut="b">
          Bright
        </ToolbarToggleChip>
      </Toolbar>
    );
  },
};
export default meta;
type Story = StoryObj<typeof ToolbarToggleChip>;
export const Mixed: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole("button", { name: "Dark · 2 of 3" });
    await expect(chip).toHaveAttribute("aria-pressed", "mixed");
    await expect(chip).toHaveAttribute("aria-keyshortcuts", "K");
    // Activating a mixed chip presses it for every target.
    await userEvent.click(chip);
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    chip.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(false);
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Bright" })).toHaveFocus();
  },
};
export const KeepsFocusAndSpace: Story = {
  args: { pressed: false, detail: undefined, focusOnPointer: false, spaceActivates: false },
  render: function Example(args): ReactElement {
    const onSpace = args.onPressedChange;
    return (
      <div
        onKeyDown={(event) => {
          // The application's own Space, which the chip leaves unprevented.
          if (event.key === " " && !event.defaultPrevented) onSpace(false);
        }}
      >
        <button type="button">Outside</button>
        <Toolbar aria-label="Tags">
          <ToolbarToggleChip {...args} onPressedChange={args.onPressedChange} />
        </Toolbar>
      </div>
    );
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const outside = canvas.getByRole("button", { name: "Outside" });
    outside.focus();
    // A pointer press acts without taking focus from what had it.
    await userEvent.click(canvas.getByRole("button", { name: "Dark" }));
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(true);
    await expect(outside).toHaveFocus();
    // Space reaches the surrounding application instead of toggling the chip.
    canvas.getByRole("button", { name: "Dark" }).focus();
    await expect(canvas.getByRole("button", { name: "Dark" })).toHaveAttribute("data-space-activates", "false");
    await userEvent.keyboard(" ");
    await expect(args.onPressedChange).toHaveBeenLastCalledWith(false);
    await expect(args.onPressedChange).toHaveBeenCalledTimes(2);
  },
};
export const Swatches: Story = {
  render: function Example(): ReactElement {
    const [color, setColor] = useState<string | null>(null);
    const choices = [
      { name: "Red", swatch: "#e5484d", key: "1" },
      { name: "Orange", swatch: "#f76b15", key: "2" },
    ];
    return (
      <Toolbar aria-label="Color">
        {choices.map((choice) => (
          <ToolbarToggleChip
            key={choice.name}
            swatch={choice.swatch}
            shortcut={choice.key}
            hideLabel
            pressed={color === choice.name}
            onPressedChange={(next) => setColor(next ? choice.name : null)}
          >
            {choice.name}
          </ToolbarToggleChip>
        ))}
      </Toolbar>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    // Nothing is preselected.
    await expect(canvas.getByRole("button", { name: "Red" })).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByRole("button", { name: "Orange" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Orange" }));
    await expect(canvas.getByRole("button", { name: "Orange" })).toHaveAttribute("aria-pressed", "true");
  },
};
export const DisabledWithReason: Story = {
  args: { pressed: false, detail: undefined, disabledReason: "One track at a time for now" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole("button", { name: "Dark" });
    chip.focus();
    await expect(chip).toHaveFocus();
    await expect(chip).toHaveAccessibleDescription("One track at a time for now");
    await userEvent.keyboard("{Enter}");
    await userEvent.click(chip);
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

/** A pressed chip carries a check, so on and off differ by more than color; a mixed or unpressed one has none. */
export const PressedCheck: Story = {
  args: { pressed: false, detail: undefined },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole("button", { name: "Dark" });
    await expect(chip.querySelector("[data-slot='toolbar-toggle-chip-check']")).toBeNull();
    await expect(chip.querySelector("[data-slot='toolbar-toggle-chip-indicator']")).toBeInTheDocument();
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(chip.querySelector("[data-slot='toolbar-toggle-chip-check']")).toBeInTheDocument();
    await expect(chip.querySelector("[data-slot='toolbar-toggle-chip-indicator']")).toBeNull();
    await expect(
      canvas.getByRole("button", { name: "Bright" }).querySelector("[data-slot='toolbar-toggle-chip-check']"),
    ).toBeNull();
  },
};

/** Toggle chips read as pills with a state indicator in both states, distinct from a rectangular Select beside them. */
export const BesideSelect: Story = {
  render: function Example(): ReactElement {
    const [onlyNew, setOnlyNew] = useState(true);
    const [onlyMine, setOnlyMine] = useState(false);
    const [order, setOrder] = useState("page");
    return (
      <Toolbar aria-label="Filter and sort">
        <ToolbarToggleChip pressed={onlyNew} onPressedChange={setOnlyNew}>
          New
        </ToolbarToggleChip>
        <ToolbarToggleChip pressed={onlyMine} onPressedChange={setOnlyMine}>
          Mine
        </ToolbarToggleChip>
        <Select value={order} onValueChange={(next) => next && setOrder(next)}>
          <SelectTrigger size="sm" aria-label="Sort order">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="page">Page order</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
          </SelectContent>
        </Select>
      </Toolbar>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const mine = canvas.getByRole("button", { name: "Mine" });
    const select = canvas.getByRole("combobox", { name: "Sort order" });
    // An unpressed toggle chip keeps a pill radius and an off-state indicator, distinct from the rectangular select.
    await expect(Number.parseFloat(getComputedStyle(mine).borderTopLeftRadius)).toBeGreaterThan(
      Number.parseFloat(getComputedStyle(select).borderTopLeftRadius),
    );
    await expect(mine.querySelector("[data-slot='toolbar-toggle-chip-indicator']")).toBeInTheDocument();
    await userEvent.click(mine);
    await expect(mine).toHaveAttribute("aria-pressed", "true");
    await expect(mine.querySelector("[data-slot='toolbar-toggle-chip-check']")).toBeInTheDocument();
  },
};
