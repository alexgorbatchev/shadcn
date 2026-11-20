import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SplitView } from "../../resizable/SplitView";
import { Button } from "../../Button";
import { Field, FieldGroup, FieldLabel } from "../../Field";
import { Input } from "../../Input";
import { Switch } from "../../Switch";

const meta: Meta<typeof SplitView> = {
  title: "@alexgorbatchev/shadcn/components/layout/SplitView",
  component: SplitView,
  tags: ["autodocs", "test"],
  args: {
    sidebarLabel: "Navigation",
    contentLabel: "Content",
    resizeLabel: "Resize navigation",
    storageKey: "split-view-story",
    defaultSidebarSize: 220,
  },
  render: function Example(args) {
    const key = useId();
    const [isVisible, setVisible] = useState(true);
    return (
      <div className="flex w-[900px] max-w-full flex-col gap-4">
        <Button onClick={() => setVisible(!isVisible)}>{isVisible ? "Hide panels" : "Show panels"}</Button>
        {isVisible && (
          <SplitView {...args} storageKey={key} sidebar={<h2>Navigation heading</h2>}>
            <h2>Content heading</h2>
            <p>Resizable content</p>
          </SplitView>
        )}
      </div>
    );
  },
};
export default meta;
type Story = StoryObj<typeof SplitView>;
export const Persistent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("separator", { name: "Resize navigation" });
    await expect(handle.getBoundingClientRect().width).toBe(2);
    const sidebar = canvas.getByRole("complementary", { name: "Navigation" });
    const content = canvas.getByRole("region", { name: "Content" });
    await expect(canvas.getByRole("heading", { name: "Navigation heading" }).getBoundingClientRect().y).toBe(
      canvas.getByRole("heading", { name: "Content heading" }).getBoundingClientRect().y,
    );
    await expect(getComputedStyle(sidebar).borderWidth).toBe("0px");
    await expect(getComputedStyle(content).borderWidth).toBe("0px");
    const initial = sidebar.getBoundingClientRect().width;
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBeGreaterThan(initial));
    const changed = sidebar.getBoundingClientRect().width;
    await userEvent.click(canvas.getByRole("button", { name: "Hide panels" }));
    await userEvent.click(canvas.getByRole("button", { name: "Show panels" }));
    await waitFor(() =>
      expect(canvas.getByRole("complementary", { name: "Navigation" }).getBoundingClientRect().width).toBeCloseTo(
        changed,
        0,
      ),
    );
  },
};

export const ExternalStorage: Story = {
  render: function Example(args) {
    const [values] = useState(() => new Map<string, string>());
    const [isSaved, setSaved] = useState(false);
    const [storage] = useState(() => ({
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
        setSaved(true);
      },
    }));
    const [isVisible, setVisible] = useState(true);
    return (
      <div className="flex w-[900px] flex-col gap-4">
        <Button onClick={() => setVisible(!isVisible)}>{isVisible ? "Hide panels" : "Show panels"}</Button>
        {isVisible && (
          <SplitView {...args} storageKey="external-layout" storage={storage} sidebar={<h2>Navigation</h2>}>
            <h2>Content</h2>
          </SplitView>
        )}
        <Button onClick={() => setVisible(values.has("split-view:external-layout:sidebar-px"))}>
          Restore saved panels
        </Button>
        <p role="status">{isSaved ? "Layout saved" : "No saved layout"}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("separator", { name: "Resize navigation" });
    const before = handle.getAttribute("aria-valuenow");
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(handle.getAttribute("aria-valuenow")).not.toBe(before));
    const changed = handle.getAttribute("aria-valuenow");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Layout saved"));
    await userEvent.click(canvas.getByRole("button", { name: "Hide panels" }));
    await userEvent.click(canvas.getByRole("button", { name: "Restore saved panels" }));
    await waitFor(() =>
      expect(
        Number(canvas.getByRole("separator", { name: "Resize navigation" }).getAttribute("aria-valuenow")),
      ).toBeCloseTo(Number(changed), 1),
    );
    await expect(localStorage.getItem("split-view:external-layout:sidebar-px")).toBeNull();
  },
};

export const Fill: Story = {
  args: { layout: "fill", sidebarPadding: "none", contentPadding: "none" },
  render: (args) => (
    <div style={{ height: 400 }}>
      <SplitView {...args} sidebar={<div style={{ height: 800 }}>Scrollable navigation</div>}>
        <h2>Bounded content</h2>
      </SplitView>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvas.getByRole("complementary", { name: "Navigation" });
    const content = canvas.getByRole("region", { name: "Content" });
    await expect(getComputedStyle(sidebar).paddingTop).toBe("0px");
    await expect(getComputedStyle(content).paddingTop).toBe("0px");
    await expect(sidebar.scrollHeight).toBeGreaterThan(sidebar.clientHeight);
    sidebar.scrollTop = 300;
    await expect(sidebar.scrollTop).toBeGreaterThan(0);
    await expect(content.getBoundingClientRect().height).toBeLessThanOrEqual(400);
  },
};

export const TrailingSidebar: Story = {
  args: { sidebarPosition: "end" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvas.getByRole("complementary", { name: "Navigation" });
    const content = canvas.getByRole("region", { name: "Content" });
    await expect(sidebar.getBoundingClientRect().left).toBeGreaterThan(content.getBoundingClientRect().left);
    const handle = canvas.getByRole("separator", { name: "Resize navigation" });
    const before = sidebar.getBoundingClientRect().width;
    handle.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBeGreaterThan(before));
    const changed = sidebar.getBoundingClientRect().width;
    await userEvent.click(canvas.getByRole("button", { name: "Hide panels" }));
    await userEvent.click(canvas.getByRole("button", { name: "Show panels" }));
    await waitFor(() =>
      expect(canvas.getByRole("complementary", { name: "Navigation" }).getBoundingClientRect().width).toBeCloseTo(
        changed,
        0,
      ),
    );
  },
};

export const ToggleTrailingSidebar: Story = {
  render: function Example(args) {
    const [open, setOpen] = useState(true);
    return (
      <div className="h-96 w-[900px]">
        <SplitView {...args} sidebarPosition="end" sidebarOpen={open} layout="fill" sidebar={<h2>Discussion</h2>}>
          <Button onClick={() => setOpen(!open)}>Toggle discussion</Button>
          <input aria-label="Draft answer" defaultValue="" />
        </SplitView>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: "Draft answer" });
    await userEvent.type(field, "Keep this unsaved answer");
    const sidebar = canvas.getByRole("complementary", { name: "Navigation" });
    const initial = sidebar.getBoundingClientRect().width;
    canvas.getByRole("separator", { name: "Resize navigation" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBeGreaterThan(initial));
    const resized = sidebar.getBoundingClientRect().width;
    await userEvent.click(canvas.getByRole("button", { name: "Toggle discussion" }));
    await expect(canvas.queryByRole("heading", { name: "Discussion" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: "Draft answer" })).toBe(field);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle discussion" }));
    await expect(canvas.getByRole("heading", { name: "Discussion" })).toBeVisible();
    await expect(field).toHaveValue("Keep this unsaved answer");
    await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBeCloseTo(resized, 0));
  },
};

export const StatefulPanels: Story = {
  render: function Example(args) {
    const key = useId();
    return (
      <div className="w-[900px] max-w-full">
        <SplitView
          {...args}
          storageKey={key}
          sidebar={
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${key}-filter`}>Filter pages</FieldLabel>
                <Input id={`${key}-filter`} />
              </Field>
              <Field orientation="horizontal">
                <Switch id={`${key}-archived`} />
                <FieldLabel htmlFor={`${key}-archived`}>Show archived</FieldLabel>
              </Field>
            </FieldGroup>
          }
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${key}-answer`}>Draft answer</FieldLabel>
              <Input id={`${key}-answer`} />
            </Field>
            <Field orientation="horizontal">
              <Switch id={`${key}-notify`} />
              <FieldLabel htmlFor={`${key}-notify`}>Notify me</FieldLabel>
            </Field>
          </FieldGroup>
        </SplitView>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = within(canvas.getByRole("complementary", { name: "Navigation" }));
    const content = within(canvas.getByRole("region", { name: "Content" }));
    await userEvent.type(sidebar.getByRole("textbox", { name: "Filter pages" }), "Roadmap");
    await userEvent.click(sidebar.getByRole("switch", { name: "Show archived" }));
    await userEvent.type(content.getByRole("textbox", { name: "Draft answer" }), "Keep this answer");
    await userEvent.click(content.getByRole("switch", { name: "Notify me" }));
    await expect(sidebar.getByRole("textbox", { name: "Filter pages" })).toHaveValue("Roadmap");
    await expect(sidebar.getByRole("switch", { name: "Show archived" })).toBeChecked();
    await expect(content.getByRole("textbox", { name: "Draft answer" })).toHaveValue("Keep this answer");
    await expect(content.getByRole("switch", { name: "Notify me" })).toBeChecked();
  },
};

/** A trailing dock: no divider while closed, bounded widths, and Expand to its maximum and back. */
export const Dock: Story = {
  render: function Example(args) {
    const key = useId();
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="flex h-96 w-[1000px] flex-col gap-2">
        <div className="flex gap-2">
          <Button onClick={() => setOpen(!open)}>{open ? "Close dock" : "Open dock"}</Button>
          <Button onClick={() => setExpanded(!expanded)}>{expanded ? "Restore width" : "Expand"}</Button>
        </div>
        <SplitView
          {...args}
          storageKey={key}
          sidebarLabel="Dock"
          resizeLabel="Resize dock"
          sidebarPosition="end"
          sidebarOpen={open}
          sidebarExpanded={expanded}
          defaultSidebarSize={400}
          minSidebarSize={320}
          maxSidebarSize="60%"
          layout="fill"
          sidebar={<h2>Review</h2>}
        >
          <input aria-label="Draft answer" defaultValue="" />
        </SplitView>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByRole("region", { name: "Content" });
    const group = (): number => content.parentElement?.closest("[data-group]")?.getBoundingClientRect().width ?? 0;
    // Closed, the dock leaves no divider behind and the content keeps the whole width.
    await expect(canvas.queryByRole("separator", { name: "Resize dock" })).toBeNull();
    await userEvent.type(canvas.getByRole("textbox", { name: "Draft answer" }), "Keep this");
    await userEvent.click(canvas.getByRole("button", { name: "Open dock" }));
    const dock = canvas.getByRole("complementary", { name: "Dock" });
    await waitFor(() => expect(dock.getBoundingClientRect().width).toBeCloseTo(400, -1));
    const handle = canvas.getByRole("separator", { name: "Resize dock" });
    await expect(handle).toBeVisible();
    // It never narrows below its minimum.
    handle.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(dock.getBoundingClientRect().width).toBeGreaterThanOrEqual(319));
    await expect(dock.getBoundingClientRect().width).toBeLessThan(330);
    // Expand widens it to its maximum, and turning Expand off restores the width it had.
    await userEvent.click(canvas.getByRole("button", { name: "Expand" }));
    await waitFor(() => expect(dock.getBoundingClientRect().width / group()).toBeCloseTo(0.6, 1));
    await userEvent.click(canvas.getByRole("button", { name: "Restore width" }));
    await waitFor(() => expect(dock.getBoundingClientRect().width).toBeLessThan(330));
    await userEvent.click(canvas.getByRole("button", { name: "Close dock" }));
    await waitFor(() => expect(canvas.queryByRole("separator", { name: "Resize dock" })).toBeNull());
    await expect(canvas.getByRole("textbox", { name: "Draft answer" })).toHaveValue("Keep this");
  },
};

/** Below the breakpoint, an open dock takes over the content's place, which stays mounted with its draft. */
export const NarrowTakeover: Story = {
  render: function Example(args) {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex h-96 w-[600px] flex-col gap-2">
        <Button onClick={() => setOpen(!open)}>{open ? "Back to content" : "Open dock"}</Button>
        <SplitView
          {...args}
          sidebarLabel="Dock"
          resizeLabel="Resize dock"
          sidebarPosition="end"
          sidebarOpen={open}
          wideQuery="(min-width: 100000px)"
          narrowLayout="takeover"
          layout="fill"
          sidebar={<h2>Review</h2>}
        >
          <input aria-label="Draft answer" defaultValue="" />
        </SplitView>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: "Draft answer" });
    await userEvent.type(field, "Keep this");
    await userEvent.click(canvas.getByRole("button", { name: "Open dock" }));
    const dock = canvas.getByRole("complementary", { name: "Dock" });
    await expect(dock).toBeVisible();
    await expect(canvas.queryByRole("region", { name: "Content" })).toBeNull();
    await expect(canvas.queryByRole("separator")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Back to content" }));
    await expect(canvas.getByRole("textbox", { name: "Draft answer" })).toBe(field);
    await expect(field).toHaveValue("Keep this");
  },
};

/** Below the breakpoint, an open persistent panel sits above the content as a resizable strip; both stay usable. */
export const NarrowStrip: Story = {
  render: function Example(args) {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex h-96 w-[600px] flex-col gap-2">
        <Button onClick={() => setOpen(!open)}>{open ? "Close tags" : "Open tags"}</Button>
        <SplitView
          {...args}
          sidebarLabel="Tags"
          resizeLabel="Resize tags"
          sidebarPosition="end"
          sidebarOpen={open}
          wideQuery="(min-width: 100000px)"
          narrowLayout="strip"
          layout="fill"
          sidebar={<button type="button">Dark</button>}
        >
          <input aria-label="Draft answer" defaultValue="" />
        </SplitView>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: "Draft answer" });
    await userEvent.type(field, "Keep this");
    await userEvent.click(canvas.getByRole("button", { name: "Open tags" }));
    const strip = canvas.getByRole("complementary", { name: "Tags" });
    await expect(strip).toBeVisible();
    // The content stays in view below the strip, with its draft.
    await expect(canvas.getByRole("region", { name: "Content" })).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Draft answer" })).toBe(field);
    const handle = canvas.getByRole("separator", { name: "Resize tags" });
    await expect(handle).toHaveAttribute("aria-orientation", "horizontal");
    await expect(strip.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const before = strip.getBoundingClientRect().height;
    handle.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect(strip.getBoundingClientRect().height).toBeGreaterThan(before);
    await userEvent.click(canvas.getByRole("button", { name: "Close tags" }));
    await expect(field).toHaveValue("Keep this");
  },
};

/** A dock closed while its workspace was still narrow opens at its default width once there is room. */
export const DockOpensAtDefaultWidth: Story = {
  render: function Example(args) {
    const key = useId();
    const [open, setOpen] = useState(false);
    const [isWideFrame, setWideFrame] = useState(false);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button onClick={() => setWideFrame(true)}>Widen workspace</Button>
          <Button onClick={() => setOpen(!open)}>{open ? "Close dock" : "Open dock"}</Button>
        </div>
        <div className={isWideFrame ? "h-80 w-[1000px]" : "h-80 w-[300px]"}>
          <SplitView
            {...args}
            storageKey={key}
            sidebarLabel="Dock"
            resizeLabel="Resize dock"
            sidebarPosition="end"
            sidebarOpen={open}
            defaultSidebarSize={400}
            minSidebarSize={320}
            maxSidebarSize="60%"
            layout="fill"
            sidebar={<h2>Review</h2>}
          >
            <p>Workspace</p>
          </SplitView>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Widen workspace" }));
    await userEvent.click(canvas.getByRole("button", { name: "Open dock" }));
    const dock = canvas.getByRole("complementary", { name: "Dock" });
    await waitFor(() => expect(dock.getBoundingClientRect().width).toBeCloseTo(400, -1));
    // A width the person chose comes back when the dock opens again.
    canvas.getByRole("separator", { name: "Resize dock" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(dock.getBoundingClientRect().width).toBeGreaterThan(420));
    const chosen = dock.getBoundingClientRect().width;
    await userEvent.click(canvas.getByRole("button", { name: "Close dock" }));
    await userEvent.click(canvas.getByRole("button", { name: "Open dock" }));
    await waitFor(() => expect(dock.getBoundingClientRect().width).toBeCloseTo(chosen, 0));
  },
};

/** The transition durations of an open overlay: under reduced motion it appears at once or fades within 150 ms. */
function getLongestTransition(element: HTMLElement): number {
  return Math.max(
    ...getComputedStyle(element)
      .transitionDuration.split(",")
      .map((value) => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000)),
  );
}

/** On a phone, navigation opens as a modal full-height panel from its own edge, with a Close button and a swipe. */
export const NarrowSheet: Story = {
  render: function Example(args) {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex w-[600px] flex-col gap-2">
        <Button onClick={() => setOpen(true)}>Pages</Button>
        <SplitView
          {...args}
          sidebarLabel="Pages"
          sidebarOpen={open}
          onSidebarOpenChange={setOpen}
          wideQuery="(min-width: 100000px)"
          narrowLayout="sheet"
          layout="fill"
          sidebar={
            <nav aria-label="Projects and pages">
              <button type="button" onClick={() => setOpen(false)}>
                Brand questionnaire
              </button>
            </nav>
          }
        >
          <h2>Incident review</h2>
        </SplitView>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const opener = canvas.getByRole("button", { name: "Pages" });
    await expect(canvas.getByRole("heading", { name: "Incident review" })).toBeVisible();
    await userEvent.click(opener);
    const dialog = await body.findByRole("dialog", { name: "Pages" });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(getLongestTransition(dialog) <= 150).toBe(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(opener).toHaveFocus();
    await userEvent.click(opener);
    await userEvent.click(await body.findByRole("button", { name: "Brand questionnaire" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

/** On a phone, comments open as a modal bottom drawer at 85% height that a consumer raises to full height. */
export const NarrowDrawer: Story = {
  render: function Example(args) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="flex w-[600px] flex-col gap-2">
        <Button onClick={() => setOpen(true)}>Comments</Button>
        <SplitView
          {...args}
          sidebarLabel="Comments"
          sidebarPosition="end"
          sidebarOpen={open}
          sidebarExpanded={expanded}
          onSidebarOpenChange={setOpen}
          wideQuery="(min-width: 100000px)"
          narrowLayout="drawer"
          layout="fill"
          sidebar={
            <div className="flex gap-2 p-panel">
              <Button variant="outline" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Collapse" : "Full height"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close comments
              </Button>
            </div>
          }
        >
          <h2>Incident review</h2>
        </SplitView>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const view = canvasElement.ownerDocument.defaultView!;
    const opener = canvas.getByRole("button", { name: "Comments" });
    await userEvent.click(opener);
    const dialog = await body.findByRole("dialog", { name: "Comments" });
    await waitFor(() =>
      expect(Math.abs(dialog.getBoundingClientRect().height - view.innerHeight * 0.85)).toBeLessThanOrEqual(1),
    );
    await expect(getLongestTransition(dialog) <= 150).toBe(view.matchMedia("(prefers-reduced-motion: reduce)").matches);
    await userEvent.click(within(dialog).getByRole("button", { name: "Full height" }));
    await waitFor(() =>
      expect(Math.abs(dialog.getBoundingClientRect().height - view.innerHeight)).toBeLessThanOrEqual(1),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Close comments" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(opener).toHaveFocus();
  },
};

/**
 * `drawerHeight="half"` opens the drawer at half the viewport height, so what it refers to, such as a region on an
 * image above it, stays in view; Full height still raises it to the whole viewport.
 */
export const NarrowHalfDrawer: Story = {
  render: function Example(args) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="flex w-[600px] flex-col gap-2">
        <Button onClick={() => setOpen(true)}>Comment on region</Button>
        <SplitView
          {...args}
          sidebarLabel="Comments on this image"
          sidebarPosition="end"
          sidebarOpen={open}
          sidebarExpanded={expanded}
          drawerHeight="half"
          onSidebarOpenChange={setOpen}
          wideQuery="(min-width: 100000px)"
          narrowLayout="drawer"
          layout="fill"
          sidebar={
            <div className="flex gap-2 p-panel">
              <Button variant="outline" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Collapse" : "Full height"}
              </Button>
            </div>
          }
        >
          <h2>Deploy monitor screenshot</h2>
        </SplitView>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const view = canvasElement.ownerDocument.defaultView!;
    await userEvent.click(canvas.getByRole("button", { name: "Comment on region" }));
    const dialog = await body.findByRole("dialog", { name: "Comments on this image" });
    await waitFor(() =>
      expect(Math.abs(dialog.getBoundingClientRect().height - view.innerHeight * 0.5)).toBeLessThanOrEqual(1),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Full height" }));
    await waitFor(() =>
      expect(Math.abs(dialog.getBoundingClientRect().height - view.innerHeight)).toBeLessThanOrEqual(1),
    );
  },
};
