import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStateStore, defineCatalog, type Spec } from "@json-render/core";
import { JSONUIProvider, Renderer, defineRegistry } from "@json-render/react";
import { schema } from "@json-render/react/schema";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { components, componentDefinitions } from "../../json-render/index";

const catalog = defineCatalog(schema, { components: componentDefinitions, actions: {} });
const { registry } = defineRegistry(catalog, { components });

interface IJsonExampleProps {
  spec: Spec;
  state?: Record<string, unknown>;
}
function JsonExample({ spec, state = {} }: IJsonExampleProps): ReactElement {
  const [store] = useState(() => createStateStore(state));
  return (
    <JSONUIProvider registry={registry} store={store}>
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  );
}

const meta: Meta<typeof JsonExample> = {
  title: "@alexgorbatchev/shadcn/components/data-display/JsonRender",
  component: JsonExample,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof JsonExample>;

export const Form: Story = {
  args: {
    spec: {
      root: "form",
      elements: {
        form: {
          type: "Stack",
          props: {},
          children: [
            "input",
            "textarea",
            "select",
            "checkbox",
            "radio",
            "switch",
            "slider",
            "toggle",
            "toggles",
            "buttons",
          ],
        },
        input: { type: "Input", props: { label: "Name", value: "Ada" } },
        textarea: { type: "Textarea", props: { label: "Notes", value: "Initial notes" } },
        select: { type: "Select", props: { label: "Plan", options: ["Free", "Pro"], value: "Free" } },
        checkbox: { type: "Checkbox", props: { label: "Agree" } },
        radio: { type: "Radio", props: { label: "Frequency", options: ["Daily", "Weekly"] } },
        switch: { type: "Switch", props: { label: "Notifications" } },
        slider: { type: "Slider", props: { label: "Volume", min: 0, max: 10 } },
        toggle: { type: "Toggle", props: { label: "Bold" } },
        toggles: {
          type: "ToggleGroup",
          props: {
            type: "multiple",
            items: [
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ],
          },
        },
        buttons: {
          type: "ButtonGroup",
          props: {
            buttons: [
              { label: "Day", value: "day" },
              { label: "Month", value: "month" },
            ],
          },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveValue("Ada");
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), " Lovelace{Enter}");
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveValue("Ada Lovelace");
    await userEvent.type(canvas.getByRole("textbox", { name: "Notes" }), " edited");
    await expect(canvas.getByRole("textbox", { name: "Notes" })).toHaveValue("Initial notes edited");
    await userEvent.click(canvas.getByRole("combobox", { name: "Plan" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Pro" }));
    await expect(canvas.getByRole("combobox", { name: "Plan" })).toHaveTextContent("Pro");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Agree" }));
    await expect(canvas.getByRole("checkbox", { name: "Agree" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Weekly" }));
    await expect(canvas.getByRole("radio", { name: "Weekly" })).toBeChecked();
    await userEvent.click(canvas.getByRole("switch", { name: "Notifications" }));
    await expect(canvas.getByRole("switch", { name: "Notifications" })).toBeChecked();
    canvas.getByRole("slider", { name: "Volume" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-valuenow", "1");
    await userEvent.click(canvas.getByRole("button", { name: "Bold" }));
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Right" }));
    await expect(canvas.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "Right" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Month" }));
    await expect(canvas.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "false");
  },
};

export const Overlays: Story = {
  args: {
    spec: {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: {},
          children: ["tabs", "accordion", "collapse", "tooltip", "popover", "dropdown"],
        },
        tabs: {
          type: "Tabs",
          props: {
            tabs: [
              { value: "one", label: "First tab" },
              { value: "two", label: "Second tab" },
            ],
          },
        },
        accordion: {
          type: "Accordion",
          props: {
            type: "multiple",
            items: [
              { title: "Details", content: "Expanded details" },
              { title: "More", content: "More details" },
            ],
          },
        },
        collapse: { type: "Collapsible", props: { title: "Expand section", defaultOpen: false }, children: ["text"] },
        text: { type: "Text", props: { text: "Collapsed content" } },
        tooltip: { type: "Tooltip", props: { content: "Keyboard help", text: "Help trigger" } },
        popover: { type: "Popover", props: { trigger: "Show popover", content: "Popover content" } },
        dropdown: {
          type: "DropdownMenu",
          props: { label: "Open menu", items: [{ label: "Choose item", value: "item" }] },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Second tab" }));
    await expect(canvas.getByRole("tab", { name: "Second tab" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    await userEvent.click(canvas.getByRole("button", { name: "More" }));
    await expect(canvas.getByText("Expanded details")).toBeVisible();
    await expect(canvas.getByText("More details")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Expand section" }));
    await expect(canvas.getByText("Collapsed content")).toBeVisible();
    await userEvent.hover(canvas.getByRole("button", { name: "Help trigger" }));
    await waitFor(() =>
      expect(document.querySelector('[data-slot="tooltip-content"]')).toHaveTextContent("Keyboard help"),
    );
    await userEvent.unhover(canvas.getByRole("button", { name: "Help trigger" }));
    await userEvent.keyboard("{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: "Show popover" }));
    await waitFor(() => expect(within(document.body).getByText("Popover content")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
    await userEvent.click(await within(document.body).findByRole("menuitem", { name: "Choose item" }));
    await waitFor(() => expect(within(document.body).queryByRole("menu")).not.toBeInTheDocument());
  },
};

export const Display: Story = {
  args: {
    spec: {
      root: "card",
      elements: {
        card: {
          type: "Card",
          props: { title: "Archive", description: "Rendered from JSON", maxWidth: "full" },
          children: ["grid", "table", "progress", "spinner", "skeleton", "separator", "carousel"],
        },
        grid: {
          type: "Grid",
          props: { columns: 2 },
          children: ["heading", "text", "badge", "alert", "avatar", "image", "link", "button"],
        },
        heading: { type: "Heading", props: { text: "Measurements", level: "h2" } },
        text: { type: "Text", props: { text: "Last updated today", variant: "muted" } },
        badge: { type: "Badge", props: { text: "Ready", variant: "secondary" } },
        alert: { type: "Alert", props: { title: "Synced", message: "All records imported", type: "success" } },
        avatar: { type: "Avatar", props: { name: "Ada Lovelace" } },
        image: {
          type: "Image",
          props: {
            src: new URL("../fixtures/avatar.svg", import.meta.url).href,
            alt: "Profile",
            width: 40,
            height: 40,
          },
        },
        link: { type: "Link", props: { label: "Read documentation", href: "#docs" } },
        button: { type: "Button", props: { label: "Sync records", variant: "secondary" } },
        table: {
          type: "Table",
          props: { caption: "Measurements", columns: ["Day", "Score"], rows: [["Monday", "80"]] },
        },
        progress: { type: "Progress", props: { value: 50, max: 100, label: "Import progress" } },
        spinner: { type: "Spinner", props: { size: "md", label: "Loading records" } },
        skeleton: { type: "Skeleton", props: { width: "100%", height: "20px" } },
        separator: { type: "Separator", props: {} },
        carousel: {
          type: "Carousel",
          props: {
            items: [
              { title: "First slide", description: "First record" },
              { title: "Second slide", description: "Second record" },
            ],
          },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Measurements" })).toBeVisible();
    // A card's title heads its content: a subheading, larger and bolder than the text under it.
    const title = canvas.getByRole("heading", { level: 2, name: "Archive" });
    const body = canvas.getByText("Rendered from JSON");
    await expect(Number.parseFloat(getComputedStyle(title).fontSize)).toBeGreaterThan(
      Number.parseFloat(getComputedStyle(body).fontSize) + 2,
    );
    await expect(Number(getComputedStyle(title).fontWeight)).toBeGreaterThanOrEqual(600);
    await expect(canvas.getByRole("table")).toHaveTextContent("Monday80");
    await expect(canvas.getByRole("alert")).toHaveTextContent("SyncedAll records imported");
    await expect(canvas.getByRole("link", { name: "Read documentation" })).toHaveAttribute("href", "#docs");
    await userEvent.click(canvas.getByRole("button", { name: "Sync records" }));
    await expect(canvas.getByRole("status", { name: "Loading records" })).toBeVisible();
  },
};

export const BoundForm: Story = {
  args: {
    state: {
      name: "Ada",
      notes: "Initial notes",
      plan: "Free",
      agree: false,
      frequency: "Daily",
      notifications: false,
      volume: 0,
      bold: false,
      position: "left",
      period: "day",
    },
    spec: {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: {},
          children: [
            "input",
            "textarea",
            "select",
            "checkbox",
            "radio",
            "switch",
            "slider",
            "toggle",
            "toggles",
            "buttons",
          ],
        },
        input: {
          type: "Input",
          props: {
            label: "Name",
            value: { $bindState: "/name" },
            checks: [{ type: "required", message: "Name required" }],
            validateOn: "change",
          },
        },
        textarea: {
          type: "Textarea",
          props: {
            label: "Notes",
            value: { $bindState: "/notes" },
            checks: [{ type: "required", message: "Notes required" }],
            validateOn: "blur",
          },
        },
        select: {
          type: "Select",
          props: {
            label: "Plan",
            options: ["Free", "Pro"],
            value: { $bindState: "/plan" },
            checks: [{ type: "required", message: "Plan required" }],
          },
        },
        checkbox: {
          type: "Checkbox",
          props: {
            label: "Agree",
            checked: { $bindState: "/agree" },
            checks: [{ type: "matches", args: { other: true }, message: "Agreement required" }],
          },
        },
        radio: {
          type: "Radio",
          props: {
            label: "Frequency",
            options: ["Daily", "Weekly"],
            value: { $bindState: "/frequency" },
            checks: [{ type: "required", message: "Frequency required" }],
          },
        },
        switch: {
          type: "Switch",
          props: {
            label: "Notifications",
            checked: { $bindState: "/notifications" },
            checks: [{ type: "matches", args: { other: true }, message: "Notification preference required" }],
          },
        },
        slider: { type: "Slider", props: { label: "Volume", min: 0, max: 10, value: { $bindState: "/volume" } } },
        toggle: { type: "Toggle", props: { label: "Bold", pressed: { $bindState: "/bold" } } },
        toggles: {
          type: "ToggleGroup",
          props: {
            type: "multiple",
            value: { $bindState: "/position" },
            items: [
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ],
          },
        },
        buttons: {
          type: "ButtonGroup",
          props: {
            selected: { $bindState: "/period" },
            buttons: [
              { label: "Day", value: "day" },
              { label: "Month", value: "month" },
            ],
          },
        },
      },
    },
  },
  play: async (context) => {
    await Form.play?.(context);
    const canvas = within(context.canvasElement);
    await userEvent.clear(canvas.getByRole("textbox", { name: "Name" }));
    await expect(canvas.getByText("Name required")).toBeVisible();
    await userEvent.clear(canvas.getByRole("textbox", { name: "Notes" }));
    await userEvent.tab();
    await expect(canvas.getByText("Notes required")).toBeVisible();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Agree" }));
    await expect(canvas.getByText("Agreement required")).toBeVisible();
    await userEvent.click(canvas.getByRole("switch", { name: "Notifications" }));
    await expect(canvas.getByText("Notification preference required")).toBeVisible();
  },
};

export const MissingBoundValues: Story = {
  args: { ...BoundForm.args, state: {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveValue("");
    await expect(canvas.getByRole("textbox", { name: "Notes" })).toHaveValue("");
    await expect(canvas.getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-valuenow", "0");
    await expect(canvas.getByRole("checkbox", { name: "Agree" })).not.toBeChecked();
    await expect(canvas.getByRole("switch", { name: "Notifications" })).not.toBeChecked();
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Grace");
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveValue("Grace");
    await userEvent.click(canvas.getByRole("button", { name: "Day" }));
    await expect(canvas.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("radio", { name: "Daily" }));
    await expect(canvas.getByRole("radio", { name: "Daily" })).toBeChecked();
    await userEvent.click(canvas.getByRole("combobox", { name: "Plan" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Free" }));
    await expect(canvas.getByRole("combobox", { name: "Plan" })).toHaveTextContent("Free");
  },
};

export const PaginationAndDialog: Story = {
  args: {
    state: { page: 1, show: false, drawer: false },
    spec: {
      root: "root",
      elements: {
        root: { type: "Stack", props: {}, children: ["pagination", "open", "dialog", "openDrawer", "drawer"] },
        pagination: { type: "Pagination", props: { page: { $bindState: "/page" }, totalPages: 20 } },
        open: {
          type: "Button",
          props: { label: "Open dialog" },
          on: { press: { action: "setState", params: { statePath: "/show", value: true } } },
        },
        dialog: {
          type: "Dialog",
          props: { title: "Confirm import", description: "Import your records", openPath: "/show" },
        },
        openDrawer: {
          type: "Button",
          props: { label: "Open drawer" },
          on: { press: { action: "setState", params: { statePath: "/drawer", value: true } } },
        },
        drawer: {
          type: "Drawer",
          props: { title: "Archive details", description: "Stored records", openPath: "/drawer" },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("link", { name: "Go to next page" }));
    await expect(canvas.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("link", { name: "20" }));
    await userEvent.click(canvas.getByRole("link", { name: "Go to next page" }));
    await expect(canvas.getByRole("link", { name: "20" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("link", { name: "Go to previous page" }));
    await expect(canvas.getByRole("link", { name: "19" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("link", { name: "1" }));
    await userEvent.click(canvas.getByRole("link", { name: "Go to previous page" }));
    await expect(canvas.getByRole("link", { name: "1" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    await waitFor(() => expect(within(document.body).getByRole("dialog", { name: "Confirm import" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: "Open drawer" }));
    await waitFor(() => expect(within(document.body).getByRole("dialog", { name: "Archive details" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const TypographyAndPlaceholders: Story = {
  args: {
    spec: {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: { direction: "horizontal", gap: "lg", align: "center", justify: "between" },
          children: [
            "small",
            "medium",
            "large",
            "empty",
            "placeholder",
            "avatar",
            "spinner",
            "skeleton",
            "progress",
            "separator",
            "table",
          ],
        },
        small: {
          type: "Card",
          props: { maxWidth: "sm", centered: true, title: "Small card" },
          children: ["h1", "caption", "alert"],
        },
        medium: {
          type: "Card",
          props: { maxWidth: "md", description: "Medium card" },
          children: ["h3", "lead", "warning"],
        },
        large: { type: "Card", props: { maxWidth: "lg" }, children: ["h4", "code", "info"] },
        empty: { type: "Card", props: {}, children: ["body", "badge"] },
        h1: { type: "Heading", props: { text: "Page heading", level: "h1" } },
        h3: { type: "Heading", props: { text: "Section heading", level: "h3" } },
        h4: { type: "Heading", props: { text: "Detail heading", level: "h4" } },
        caption: { type: "Text", props: { text: "Caption", variant: "caption" } },
        lead: { type: "Text", props: { text: "Lead paragraph", variant: "lead" } },
        code: { type: "Text", props: { text: "const ready = true", variant: "code" } },
        body: { type: "Text", props: { text: "Body paragraph" } },
        badge: { type: "Badge", props: { text: "Default badge" } },
        alert: { type: "Alert", props: { title: "Import failed", type: "error" } },
        warning: { type: "Alert", props: { title: "Warning", type: "warning" } },
        info: { type: "Alert", props: { title: "Default notice" } },
        placeholder: { type: "Image", props: { src: null, alt: "Missing photograph" } },
        avatar: { type: "Avatar", props: { name: "", size: "lg" } },
        spinner: { type: "Spinner", props: { size: "sm" } },
        skeleton: { type: "Skeleton", props: { rounded: true } },
        progress: { type: "Progress", props: { value: 20 } },
        separator: { type: "Separator", props: { orientation: "vertical" } },
        table: { type: "Table", props: { columns: ["Name"], rows: [["Ada"]] } },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Page heading" })).toBeVisible();
    await expect(canvas.getByRole("heading", { level: 3, name: "Section heading" })).toBeVisible();
    await expect(canvas.getByRole("heading", { level: 4, name: "Detail heading" })).toBeVisible();
    await expect(canvas.getByText("const ready = true").tagName).toBe("CODE");
    await expect(canvas.getByText("Missing photograph")).toBeVisible();
    await expect(canvas.getByText("?")).toBeVisible();
    await expect(canvas.getByText("Import failed")).toBeVisible();
    await expect(canvas.getByRole("status", { name: "Loading" })).toBeVisible();
    await expect(canvas.getByRole("table")).toHaveTextContent("Ada");
  },
};

export const InitialSelections: Story = {
  args: {
    spec: {
      root: "root",
      elements: {
        root: {
          type: "Grid",
          props: { columns: 1, gap: "sm" },
          children: [
            "buttons",
            "tabs",
            "toggles",
            "pagination",
            "slider",
            "accordion",
            "image",
            "avatar",
            "spinner",
            "button",
          ],
        },
        buttons: {
          type: "ButtonGroup",
          props: {
            selected: "month",
            buttons: [
              { label: "Day view", value: "day" },
              { label: "Month view", value: "month" },
            ],
          },
        },
        tabs: {
          type: "Tabs",
          props: {
            value: "second",
            tabs: [
              { label: "One", value: "first" },
              { label: "Two", value: "second" },
            ],
          },
        },
        toggles: { type: "ToggleGroup", props: { value: "", items: [{ label: "Pin", value: "pin" }] } },
        pagination: { type: "Pagination", props: { totalPages: 3 } },
        slider: { type: "Slider", props: { value: 20 } },
        accordion: { type: "Accordion", props: { items: [{ title: "Single details", content: "Single expanded" }] } },
        image: {
          type: "Image",
          props: { src: new URL("../fixtures/avatar.svg", import.meta.url).href, alt: "Small profile" },
        },
        avatar: {
          type: "Avatar",
          props: { name: "Ada", size: "sm", src: new URL("../fixtures/avatar.svg", import.meta.url).href },
        },
        spinner: { type: "Spinner", props: { size: "lg", label: "Large loader" } },
        button: { type: "Button", props: { label: "Delete", variant: "danger", disabled: true } },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Month view" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Month view" }));
    await expect(canvas.getByRole("button", { name: "Month view" })).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("tab", { name: "One" }));
    await expect(canvas.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Pin" }));
    await expect(canvas.getByRole("button", { name: "Pin" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Pin" }));
    await expect(canvas.getByRole("button", { name: "Pin" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(canvas.getByRole("link", { name: "Go to next page" }));
    await expect(canvas.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("link", { name: "3" }));
    await userEvent.click(canvas.getByRole("link", { name: "Go to previous page" }));
    await expect(canvas.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("slider", { name: "Value" })).toHaveAttribute("aria-valuenow", "20");
    await userEvent.click(canvas.getByRole("button", { name: "Single details" }));
    await expect(canvas.getByText("Single expanded")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Delete" })).toBeDisabled();
  },
};

export const FullWidthTextFields: Story = {
  args: {
    spec: {
      root: "fields",
      elements: {
        fields: { type: "Stack", props: { align: "start" }, children: ["name", "notes"] },
        name: { type: "Input", props: { label: "Full width name" } },
        notes: { type: "Textarea", props: { label: "Full width notes" } },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "Full width name" });
    const notes = canvas.getByRole("textbox", { name: "Full width notes" });
    const stack = name.parentElement?.parentElement;
    await expect(stack).not.toBeNull();
    await expect(name.getBoundingClientRect().width).toBeCloseTo(stack?.getBoundingClientRect().width ?? 0, 0);
    await expect(notes.getBoundingClientRect().width).toBeCloseTo(stack?.getBoundingClientRect().width ?? 0, 0);
    await userEvent.type(notes, "Still editable");
    await expect(notes).toHaveValue("Still editable");
  },
};

const tableAlignments = ["default", "start", "center", "end"] as const;
const wideColumns = Array.from({ length: 12 }, (_, index) => `Metric ${index + 1}`);

export const TableInStack: Story = {
  args: {
    spec: {
      root: "root",
      elements: {
        root: {
          type: "Stack",
          props: { direction: null, gap: null, align: null, justify: null, className: null },
          children: [...tableAlignments.map((alignment) => `stack-${alignment}`), "wide-stack"],
        },
        ...Object.fromEntries(
          tableAlignments.flatMap((alignment) => [
            [
              `stack-${alignment}`,
              {
                type: "Stack",
                props: { align: alignment === "default" ? null : alignment },
                children: [`table-${alignment}`],
              },
            ],
            [
              `table-${alignment}`,
              {
                type: "Table",
                props: {
                  caption: `Benchmarks aligned ${alignment}`,
                  columns: ["Option", "Latency", "Cost"],
                  rows: [
                    ["Blue-green", "120 ms", "$40"],
                    ["Canary", "95 ms", "$55"],
                  ],
                },
              },
            ],
          ]),
        ),
        "wide-stack": { type: "Stack", props: { align: null }, children: ["wide-table"] },
        "wide-table": {
          type: "Table",
          props: {
            caption: "Wide benchmarks",
            columns: wideColumns,
            rows: [wideColumns.map((_, index) => `measured value ${index + 1}`)],
          },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const alignment of tableAlignments) {
      const table = canvas.getByRole("table", { name: `Benchmarks aligned ${alignment}` });
      const wrapper = table.closest('[data-slot="table-container"]')?.parentElement;
      const stack = wrapper?.parentElement;
      const firstColumn = within(table).getByRole("columnheader", { name: "Option" });
      await expect(wrapper).toBeInstanceOf(HTMLElement);
      await expect(wrapper?.getBoundingClientRect().width).toBeGreaterThanOrEqual(
        firstColumn.getBoundingClientRect().width,
      );
      await expect(wrapper?.getBoundingClientRect().width).toBeCloseTo(stack?.getBoundingClientRect().width ?? 0, 0);
      await expect(within(table).getByRole("cell", { name: "Canary" })).toBeVisible();
    }
    const wide = canvas.getByRole("table", { name: "Wide benchmarks" });
    const container = wide.closest('[data-slot="table-container"]');
    await expect(container).toBeInstanceOf(HTMLElement);
    await expect(container?.clientWidth).toBeGreaterThan(0);
    await expect(container?.scrollWidth).toBeGreaterThan(container?.clientWidth ?? 0);
    await expect(getComputedStyle(container ?? document.body).overflowX).toBe("auto");
  },
};

export const TabsWithPanels: Story = {
  args: {
    spec: {
      root: "tabs",
      elements: {
        tabs: {
          type: "Tabs",
          props: {
            tabs: [
              { value: "summary", label: "Summary" },
              { value: "risks", label: "Risks" },
            ],
          },
          children: ["summary", "risks", "footer"],
        },
        summary: { type: "Text", props: { text: "Summary panel content" } },
        risks: { type: "Collapsible", props: { title: "Risk details", defaultOpen: true }, children: ["risk-text"] },
        "risk-text": { type: "Text", props: { text: "Risks panel content" } },
        footer: { type: "Text", props: { text: "Shown under every tab" } },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summaryTab = canvas.getByRole("tab", { name: "Summary" });
    const risksTab = canvas.getByRole("tab", { name: "Risks" });
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Summary panel content");
    await expect(summaryTab).toHaveAttribute("aria-controls", canvas.getByRole("tabpanel").id);
    await expect(canvas.getByText("Risks panel content")).not.toBeVisible();
    await expect(canvas.getByText("Shown under every tab")).toBeVisible();
    await userEvent.click(risksTab);
    await expect(risksTab).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(canvas.getByRole("tabpanel")).toHaveTextContent("Risks panel content"));
    await expect(risksTab).toHaveAttribute("aria-controls", canvas.getByRole("tabpanel").id);
    await expect(canvas.getByText("Summary panel content")).not.toBeVisible();
    await expect(canvas.getByText("Summary panel content")).toBeInTheDocument();
    await expect(canvas.getByText("Shown under every tab")).toBeVisible();
  },
};

const rolloutOptions = [
  ["Rolling update", "Replaces pods in batches of 10% while traffic keeps flowing.", "Rollback: 6 min"],
  ["Blue-green", "Brings up a full second fleet and switches traffic at the load balancer.", "Rollback: 10 s"],
  ["Canary", "Sends 5% of traffic to the new release and widens it while errors stay flat.", "Rollback: 30 s"],
] as const;

const rolloutGrid: Spec = {
  root: "grid",
  elements: {
    grid: {
      type: "Grid",
      props: { columns: 3, gap: "md" },
      children: rolloutOptions.map((_, index) => `card${index}`),
    },
    ...Object.fromEntries(
      rolloutOptions.flatMap(([title, text, rollback], index) => [
        [
          `card${index}`,
          {
            type: "Card",
            props: { title, description: null, maxWidth: "full" },
            children: [`text${index}`, `badge${index}`],
          },
        ],
        [`text${index}`, { type: "Text", props: { text } }],
        [`badge${index}`, { type: "Badge", props: { text: rollback, variant: "outline" } }],
      ]),
    ),
  },
};

/** Container widths and the columns a `columns: 3` grid shows in each with the default 240 px minimum column width. */
const reflowWidths = [
  [320, 1],
  [342, 1],
  [390, 1],
  [508, 2],
  [748, 3],
  [768, 3],
  [1280, 3],
] as const;

function GridReflowExample(): ReactElement {
  return (
    <div className="flex flex-col gap-8">
      {reflowWidths.map(([width]) => (
        <section key={width} data-width={width} style={{ width: `${width}px` }}>
          <JsonExample spec={rolloutGrid} />
        </section>
      ))}
    </div>
  );
}

/**
 * Grid stacks by its own width, not the viewport's: `columns` is a maximum, and the grid shows only as many columns as
 * fit at 240 px each, so cards never squeeze into unreadable slivers or clip their badges on a phone.
 */
export const GridReflow: Story = {
  render: () => <GridReflowExample />,
  play: async ({ canvasElement }) => {
    for (const [width, expected] of reflowWidths) {
      const section = canvasElement.querySelector<HTMLElement>(`[data-width="${width}"]`);
      const grid = section?.querySelector<HTMLElement>('[data-slot="json-grid"]');
      await expect(grid).not.toBeNull();
      const cells = [...(grid?.children ?? [])].filter((cell): cell is HTMLElement => cell instanceof HTMLElement);
      const columns = new Set(cells.map((cell) => Math.round(cell.getBoundingClientRect().left))).size;
      await expect({ width, columns }).toEqual({ width, columns: expected });
      for (const cell of cells) {
        await expect(cell.scrollWidth).toBeLessThanOrEqual(cell.clientWidth);
        const badge = within(cell).getByText(/^Rollback: /);
        await expect(badge.getBoundingClientRect().right).toBeLessThanOrEqual(cell.getBoundingClientRect().right);
        await expect(badge.scrollWidth).toBeLessThanOrEqual(badge.clientWidth);
      }
    }
  },
};

/** minColumnWidth picks the library Grid's sizes: at xs (128 px) a 342 px phone column fits two of three cards. */
export const GridMinColumnWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: "342px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    spec: {
      ...rolloutGrid,
      elements: {
        ...rolloutGrid.elements,
        grid: {
          type: "Grid",
          props: { columns: 3, gap: "md", minColumnWidth: "xs" },
          children: ["card0", "card1", "card2"],
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector<HTMLElement>('[data-slot="json-grid"]');
    const lefts = [...(grid?.children ?? [])].map((cell) => Math.round(cell.getBoundingClientRect().left));
    await expect(new Set(lefts).size).toBe(2);
  },
};
