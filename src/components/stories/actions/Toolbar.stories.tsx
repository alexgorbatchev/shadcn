import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarInput, ToolbarLink, ToolbarSeparator } from "../../Toolbar";
const meta: Meta<typeof Toolbar> = {
  title: "@alexgorbatchev/shadcn/components/actions/Toolbar",
  component: Toolbar,
  tags: ["autodocs", "test"],
  args: { "aria-label": "Document actions" },
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup aria-label="Editing">
        <ToolbarButton onClick={fn()}>Undo</ToolbarButton>
        <ToolbarButton>Redo</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarInput aria-label="Document title" defaultValue="Untitled" />
      <ToolbarLink href="#toolbar-help">Help</ToolbarLink>
    </Toolbar>
  ),
};
export default meta;
type Story = StoryObj<typeof Toolbar>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const undo = canvas.getByRole("button", { name: "Undo" });
    await userEvent.click(undo);
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Redo" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("textbox", { name: "Document title" })).toHaveFocus();
    await expect(canvas.getByRole("link", { name: "Help" })).toHaveAttribute("href", "#toolbar-help");
    await userEvent.type(canvas.getByRole("textbox", { name: "Document title" }), " report");
    await expect(canvas.getByRole("textbox", { name: "Document title" })).toHaveValue("Untitled report");
  },
};
export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("button", { name: "Redo" })).toHaveFocus();
    await expect(canvas.getByRole("toolbar", { name: "Document actions" })).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  },
};
/** A vertical list of tools in a narrow side panel: each tool spans the panel and starts its label at the same edge. */
export const VerticalTools: Story = {
  render: (args) => (
    <div className="w-64">
      <Toolbar {...args} aria-label="Pages tools" orientation="vertical" variant="plain">
        <ToolbarGroup>
          <ToolbarButton>Find a page…</ToolbarButton>
          <ToolbarButton aria-pressed>Needs you</ToolbarButton>
          <ToolbarButton>New project</ToolbarButton>
          <ToolbarButton>Show archived</ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = ["Find a page…", "Needs you", "New project", "Show archived"].map((name) =>
      canvas.getByRole("button", { name }).getBoundingClientRect(),
    );
    const toolbar = canvas.getByRole("toolbar", { name: "Pages tools" }).getBoundingClientRect();
    await expect(new Set(boxes.map((box) => box.left))).toEqual(new Set([toolbar.left]));
    await expect(new Set(boxes.map((box) => box.width))).toEqual(new Set([toolbar.width]));
    // Each label starts at its button's leading padding, not centred in the row.
    const label = canvas.getByRole("button", { name: "Show archived" });
    await expect(getComputedStyle(label).justifyContent).toBe("flex-start");
  },
};
const toolbarClasses = fn((_state: unknown) => "font-medium");
export const NativeStateCallbacks: Story = {
  render: (args) => (
    <Toolbar
      {...args}
      className={toolbarClasses}
      style={(state) => ({ opacity: state.orientation === "vertical" ? 0.9 : 1 })}
    >
      <ToolbarGroup className={toolbarClasses}>
        <ToolbarButton className={toolbarClasses} disabled style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}>
          Unavailable
        </ToolbarButton>
        <ToolbarButton className={toolbarClasses}>Enabled</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator className={toolbarClasses} />
      <ToolbarInput className={toolbarClasses} aria-label="Title" />
      <ToolbarLink className={toolbarClasses} href="#help">
        Help
      </ToolbarLink>
    </Toolbar>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await expect(toolbarClasses).toHaveBeenCalledWith(expect.objectContaining({ orientation: "horizontal" }));
    await expect(c.getByRole("button", { name: "Unavailable" })).toHaveStyle({ opacity: "0.5" });
    await userEvent.click(c.getByRole("button", { name: "Enabled" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("textbox")).toHaveFocus();
  },
};
const disabledAction = fn();
export const DisabledState: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton disabled onClick={disabledAction}>
        Unavailable
      </ToolbarButton>
      <ToolbarButton>Enabled</ToolbarButton>
    </Toolbar>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    const disabled = c.getByRole("button", { name: "Unavailable" });
    const enabled = c.getByRole("button", { name: "Enabled" });
    await expect(getComputedStyle(disabled).color).not.toBe(getComputedStyle(enabled).color);
    await userEvent.click(disabled);
    await expect(disabledAction).not.toHaveBeenCalled();
    await userEvent.click(enabled);
    await userEvent.keyboard("{ArrowLeft}");
    await expect(disabled).toHaveFocus();
  },
};
/** A plain, vertical toolbar inside another surface, whose groups of chips wrap onto further lines. */
export const PlainWrapping: Story = {
  render: (args) => (
    <div className="w-48">
      <Toolbar {...args} aria-label="Tags" orientation="vertical" variant="plain">
        <ToolbarGroup aria-label="Vibe" wrap>
          {["Dark", "Bright", "Hypnotic", "Warm", "Deep"].map((name) => (
            <ToolbarButton key={name}>{name}</ToolbarButton>
          ))}
        </ToolbarGroup>
      </Toolbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole("toolbar", { name: "Tags" });
    await expect(getComputedStyle(toolbar).borderTopWidth).toBe("0px");
    const group = canvas.getByRole("group", { name: "Vibe" });
    await expect(getComputedStyle(group).flexWrap).toBe("wrap");
    const dark = canvas.getByRole("button", { name: "Dark" }).getBoundingClientRect();
    const bright = canvas.getByRole("button", { name: "Bright" }).getBoundingClientRect();
    // Chips share rows inside the vertical toolbar, starting at its leading edge.
    await expect(bright.top).toBe(dark.top);
    await expect(dark.left).toBe(group.getBoundingClientRect().left);
    const deep = canvas.getByRole("button", { name: "Deep" }).getBoundingClientRect();
    await expect(deep.top).toBeGreaterThan(dark.top);
    await expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
  },
};
