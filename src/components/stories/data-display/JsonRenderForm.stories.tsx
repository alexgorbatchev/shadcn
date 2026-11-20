import { useEffect, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStateStore, defineCatalog, type Spec } from "@json-render/core";
import { JSONUIProvider, Renderer, defineRegistry } from "@json-render/react";
import { schema } from "@json-render/react/schema";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { z } from "zod";
import { Button } from "../../Button";
import {
  components,
  componentDefinitions,
  JsonFormProvider,
  stripRequiredMark,
  useJsonReveal,
  type JsonFormMode,
} from "../../json-render/index";

/** Reveal functions of the probes, by name, so a story's own button can open the containers hiding a probe. */
const revealers = new Map<string, () => void>();

function RevealProbe({ props }: { props: { name: string } }): ReactElement {
  const reveal = useJsonReveal();
  useEffect(() => {
    revealers.set(props.name, reveal);
  }, [props.name, reveal]);
  return (
    <p tabIndex={-1} data-probe={props.name}>
      Probe {props.name}
    </p>
  );
}

const catalog = defineCatalog(schema, {
  components: {
    ...componentDefinitions,
    RevealProbe: { props: z.object({ name: z.string() }), description: "Story-only reveal target." },
  },
  actions: {},
});
const { registry } = defineRegistry(catalog, { components: { ...components, RevealProbe } });

interface IJsonFormExampleProps {
  spec: Spec;
  state?: Record<string, unknown>;
  mode?: JsonFormMode;
  errors?: Record<string, string>;
  /** Probe names, each with a button outside the spec that reveals and focuses the probe. */
  reveal?: string[];
}

function JsonFormExample({ spec, state = {}, mode, errors, reveal = [] }: IJsonFormExampleProps): ReactElement {
  const [store] = useState(() => createStateStore(state));
  return (
    <div className="flex flex-col gap-4">
      {reveal.map((name) => (
        <Button
          key={name}
          type="button"
          variant="outline"
          onClick={() => {
            revealers.get(name)?.();
            requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-probe="${name}"]`)?.focus());
          }}
        >
          Go to {name}
        </Button>
      ))}
      <JSONUIProvider registry={registry} store={store}>
        <JsonFormProvider mode={mode} errors={errors}>
          <Renderer spec={spec} registry={registry} />
        </JsonFormProvider>
      </JSONUIProvider>
    </div>
  );
}

const meta: Meta<typeof JsonFormExample> = {
  title: "@alexgorbatchev/shadcn/components/data-display/JsonRenderForm",
  component: JsonFormExample,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof JsonFormExample>;

const required = [{ type: "required", message: "Enter a name" }];

const answerSpec: Spec = {
  root: "root",
  elements: {
    root: {
      type: "Stack",
      props: {},
      children: [
        "company",
        "notes",
        "plan",
        "frequency",
        "agree",
        "alerts",
        "volume",
        "region",
        "bold",
        "channels",
        "view",
        "tabs",
      ],
    },
    company: {
      type: "Input",
      props: { label: "Company name *", value: { $bindState: "/answers/company" }, checks: required },
    },
    notes: { type: "Textarea", props: { label: "Notes", value: { $bindState: "/answers/notes" } } },
    plan: {
      type: "Select",
      props: { label: "Plan", options: ["Free", "Pro"], value: { $bindState: "/answers/plan" }, checks: required },
    },
    frequency: {
      type: "Radio",
      props: {
        label: "Frequency",
        options: ["Daily", "Weekly"],
        value: { $bindState: "/answers/frequency" },
        checks: required,
      },
    },
    agree: {
      type: "Checkbox",
      props: { label: "Agree", checked: { $bindState: "/answers/agree" }, checks: required },
    },
    alerts: { type: "Switch", props: { label: "Alerts", checked: { $bindState: "/answers/alerts" } } },
    volume: { type: "Slider", props: { label: "Volume", min: 0, max: 10, value: { $bindState: "/answers/volume" } } },
    region: {
      type: "DropdownMenu",
      props: {
        label: "Preferred region",
        items: [
          { label: "us-east-1", value: "us-east-1" },
          { label: "eu-west-1", value: "eu-west-1" },
        ],
        value: { $bindState: "/answers/region" },
      },
    },
    bold: { type: "Toggle", props: { label: "Bold", pressed: { $bindState: "/answers/bold" } } },
    channels: {
      type: "ToggleGroup",
      props: {
        type: "multiple",
        items: [
          { label: "Email", value: "email" },
          { label: "Chat", value: "chat" },
        ],
        value: { $bindState: "/answers/channels" },
      },
    },
    view: {
      type: "ButtonGroup",
      props: {
        buttons: [
          { label: "List", value: "list" },
          { label: "Cards", value: "cards" },
        ],
        selected: { $bindState: "/answers/view" },
      },
    },
    tabs: {
      type: "Tabs",
      props: {
        tabs: [
          { value: "overview", label: "Overview" },
          { value: "details", label: "Details" },
        ],
      },
      children: ["overview", "details"],
    },
    overview: { type: "Text", props: { text: "Overview panel" } },
    details: { type: "Collapsible", props: { title: "More details" }, children: ["detailText"] },
    detailText: { type: "Text", props: { text: "Detail panel" } },
  },
};

const answers = {
  company: "Northwind Studio",
  notes: "",
  plan: "Pro",
  frequency: "Weekly",
  agree: true,
  alerts: false,
  volume: 3,
  region: "eu-west-1",
  bold: true,
  channels: "email,chat",
  view: "cards",
};

export const RequiredAndMessages: Story = {
  args: {
    spec: answerSpec,
    state: { answers: { company: "", notes: "", plan: "", frequency: "", agree: false, alerts: false, volume: 0 } },
    errors: { "/answers/company": "Company name: Enter a name" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const company = canvas.getByRole("textbox", { name: "Company name" });
    await expect(canvas.queryByText("Company name *")).not.toBeInTheDocument();
    await expect(company).toHaveAttribute("aria-required", "true");
    await expect(company).toHaveAttribute("aria-invalid", "true");
    await expect(company).toHaveAccessibleDescription("Company name: Enter a name");
    await expect(canvas.getAllByText("Required")).toHaveLength(4);
    const notes = canvas.getByRole("textbox", { name: "Notes" });
    await expect(notes).not.toHaveAttribute("aria-required");
    await expect(notes).not.toHaveAttribute("aria-invalid");
    await expect(canvas.getByRole("radiogroup", { name: "Frequency" })).toHaveAttribute("aria-required", "true");
    await expect(canvas.getByRole("checkbox", { name: "Agree" })).toHaveAttribute("aria-required", "true");
    // Inside a provider the control's own checks never show a message: the consumer decides when messages show.
    await userEvent.click(canvas.getByRole("combobox", { name: "Plan" }));
    await userEvent.keyboard("{Escape}");
    await userEvent.click(notes);
    await userEvent.tab();
    await expect(canvas.getAllByText(/Enter a name/)).toHaveLength(1);
    await expect(stripRequiredMark("Launch deadline **")).toBe("Launch deadline");
  },
};

export const LockedKeepsReadingControls: Story = {
  args: { spec: answerSpec, state: { answers }, mode: "locked" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Company name" })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "Notes" })).toBeDisabled();
    await expect(canvas.getByRole("checkbox", { name: "Agree" })).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("button", { name: "Bold" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Email" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "List" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Cards" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("tab", { name: "Details" }));
    await expect(canvas.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("button", { name: "More details" }));
    await waitFor(() => expect(canvas.getByText("Detail panel")).toBeVisible());
  },
};

export const ReadOnlyValues: Story = {
  args: { spec: answerSpec, state: { answers }, mode: "values" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("radiogroup")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("checkbox")).not.toBeInTheDocument();
    await expect(canvas.getByRole("group", { name: "Company name" })).toHaveTextContent("Northwind Studio");
    await expect(canvas.getByRole("group", { name: "Notes" })).toHaveTextContent("No answer");
    await expect(canvas.getByRole("group", { name: "Plan" })).toHaveTextContent("Pro");
    await expect(canvas.getByRole("group", { name: "Frequency" })).toHaveTextContent("Weekly");
    await expect(canvas.getByRole("group", { name: "Agree" })).toHaveTextContent("Yes");
    await expect(canvas.getByRole("group", { name: "Alerts" })).toHaveTextContent("Off");
    await expect(canvas.getByRole("group", { name: "Volume" })).toHaveTextContent("3");
    await expect(canvas.getByRole("group", { name: "Preferred region" })).toHaveTextContent("eu-west-1");
    await expect(canvas.getByRole("group", { name: "Bold" })).toHaveTextContent("On");
    await expect(canvas.getByText("Email, Chat")).toBeVisible();
    await expect(canvas.getByText("Cards")).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "List" })).not.toBeInTheDocument();
    // Reading controls keep working on a read-only page.
    await userEvent.click(canvas.getByRole("tab", { name: "Details" }));
    await expect(canvas.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("button", { name: "More details" }));
    await waitFor(() => expect(canvas.getByText("Detail panel")).toBeVisible());
  },
};

export const DropdownMenuChoice: Story = {
  args: { spec: answerSpec, state: { answers: {} } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Preferred region Choose…" });
    await expect(trigger).toHaveTextContent("Choose…");
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("menuitemradio", { name: "eu-west-1" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    const chosen = canvas.getByRole("button", { name: "Preferred region eu-west-1" });
    await expect(chosen).toHaveTextContent("eu-west-1");
    await userEvent.click(chosen);
    await expect(await body.findByRole("menuitemradio", { name: "eu-west-1" })).toHaveAttribute("aria-checked", "true");
    await expect(body.getByRole("menuitemradio", { name: "us-east-1" })).toHaveAttribute("aria-checked", "false");
    await userEvent.keyboard("{Escape}");
  },
};

export const RevealOpensHidingContainers: Story = {
  args: {
    reveal: ["inSection", "inTab"],
    spec: {
      root: "tabs",
      elements: {
        tabs: {
          type: "Tabs",
          props: {
            tabs: [
              { value: "overview", label: "Overview" },
              { value: "decide", label: "Decide" },
            ],
          },
          children: ["overview", "decide"],
        },
        overview: { type: "Text", props: { text: "Overview panel" } },
        decide: { type: "Stack", props: {}, children: ["inTab", "section"] },
        inTab: { type: "RevealProbe", props: { name: "inTab" } },
        section: { type: "Collapsible", props: { title: "Advanced" }, children: ["inSection"] },
        inSection: { type: "RevealProbe", props: { name: "inSection" } },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Probe inSection")).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Go to inSection" }));
    await waitFor(() => expect(canvas.getByText("Probe inSection")).toBeVisible());
    await expect(canvas.getByRole("tab", { name: "Decide" })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(canvas.getByText("Probe inSection")).toHaveFocus());
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await expect(canvas.getByText("Probe inTab")).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Go to inTab" }));
    await waitFor(() => expect(canvas.getByText("Probe inTab")).toHaveFocus());
    await expect(canvas.getByText("Probe inTab")).toBeVisible();
  },
};
