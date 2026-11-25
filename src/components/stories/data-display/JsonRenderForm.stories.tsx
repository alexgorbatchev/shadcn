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
  JsonFieldValue,
  JsonFormProvider,
  stripRequiredMark,
  useJsonField,
  useJsonReveal,
  type JsonFormMode,
} from "../../json-render/index";
import { assertLayoutContained } from "../../../../.storybook/assertLayoutContained";

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
  /** Binding paths whose value is still the author's default. */
  defaults?: string[];
  /** Binding paths whose value differs from the last submitted answer. */
  changed?: string[];
  /** Probe names, each with a button outside the spec that reveals and focuses the probe. */
  reveal?: string[];
}

function JsonFormExample({
  spec,
  state = {},
  mode,
  errors,
  defaults,
  changed,
  reveal = [],
}: IJsonFormExampleProps): ReactElement {
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
        <JsonFormProvider mode={mode} errors={errors} defaults={defaults} changed={changed}>
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
    // A read-only value asks for nothing, so no field carries a Required tag.
    await expect(canvas.queryByText("Required")).not.toBeInTheDocument();
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

const settingsSpec: Spec = {
  root: "root",
  elements: {
    root: { type: "Stack", props: {}, children: ["oncall", "notify", "budget", "risk", "pilot", "agree"] },
    oncall: {
      type: "Switch",
      props: { label: "Page the on-call team", name: "oncall", checked: { $bindState: "/answers/oncall" } },
    },
    notify: {
      type: "Switch",
      props: { label: "Notify support", name: "notify", checked: { $bindState: "/answers/notify" } },
    },
    budget: {
      type: "Slider",
      props: { label: "Budget cap", min: 1, max: 20, value: { $bindState: "/answers/budget" } },
    },
    risk: {
      type: "Slider",
      props: { label: "Acceptable risk", min: 1, max: 5, value: { $bindState: "/answers/risk" } },
    },
    pilot: { type: "Toggle", props: { label: "Pilot first", pressed: { $bindState: "/answers/pilot" } } },
    agree: { type: "Checkbox", props: { label: "Agree", checked: { $bindState: "/answers/agree" } } },
  },
};

export const DefaultTagsAndNotSet: Story = {
  args: {
    spec: settingsSpec,
    state: { answers: { oncall: false, notify: null, budget: 5, risk: null, pilot: false, agree: false } },
    defaults: ["/answers/oncall", "/answers/budget", "/answers/pilot", "/answers/agree"],
    changed: ["/answers/budget"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each control still at the author's value carries a "Default" tag; changed controls carry "Changed" beside their label.
    await expect(canvas.getAllByText("Default")).toHaveLength(4);
    await expect(canvas.getAllByText("Changed")).toHaveLength(1);
    // A switch and a slider left null read "Not answered" and render indeterminate visuals instead of off or their minimum.
    await expect(canvas.getAllByText("Not answered")).toHaveLength(2);
    const notify = canvas.getByRole("switch", { name: "Notify support" });
    const oncall = canvas.getByRole("switch", { name: "Page the on-call team" });
    await expect(notify).toHaveAccessibleDescription("Not answered");
    await expect(notify).toHaveAttribute("data-indeterminate");
    await expect(oncall).not.toHaveAccessibleDescription("Not answered");
    await expect(oncall).not.toHaveAttribute("data-indeterminate");
    // The switch sits beside its label on the left, matching checkboxes rather than stretching to the far right.
    const notifyLabel = canvas.getByText("Notify support");
    await expect(notify.getBoundingClientRect().right).toBeLessThanOrEqual(
      notifyLabel.getBoundingClientRect().left + 1,
    );
    const risk = canvas.getByRole("slider", { name: "Acceptable risk" });
    await expect(risk).toHaveAttribute("aria-valuetext", "Not answered");
    await expect(risk.closest("[data-slot=slider]")).toHaveAttribute("data-indeterminate");
    await expect(canvas.getByRole("slider", { name: "Budget cap" })).not.toHaveAttribute(
      "aria-valuetext",
      "Not answered",
    );
    // Choosing a value replaces "Not answered" and clears indeterminate.
    await userEvent.click(notify);
    await waitFor(() => expect(canvas.getAllByText("Not answered")).toHaveLength(1));
    await expect(notify).toHaveAttribute("aria-checked", "true");
    await expect(notify).not.toHaveAttribute("data-indeterminate");
  },
};

export const NotSetReadOnly: Story = {
  args: {
    spec: settingsSpec,
    state: { answers: { oncall: true, notify: null, budget: 5, risk: null, pilot: false, agree: false } },
    changed: ["/answers/budget"],
    mode: "values",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Notify support" })).toHaveTextContent("Not answered");
    await expect(canvas.getByRole("group", { name: "Acceptable risk" })).toHaveTextContent("Not answered");
    await expect(canvas.getByRole("group", { name: "Page the on-call team" })).toHaveTextContent("On");
    await expect(canvas.getByRole("group", { name: "Budget cap" })).toHaveTextContent("5");
    await expect(canvas.queryByText("Default")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Changed")).not.toBeInTheDocument();
  },
};

const channelsSpec: Spec = {
  root: "root",
  elements: {
    root: { type: "Stack", props: {}, children: ["channels", "view"] },
    channels: {
      type: "ToggleGroup",
      props: {
        type: "multiple",
        label: "Which channels should the voice cover?",
        description: "Choose every channel that applies.",
        items: [
          { label: "Email", value: "email" },
          { label: "Chat", value: "chat" },
          { label: "Phone", value: "phone" },
        ],
        value: { $bindState: "/answers/channels" },
        checks: [{ type: "required", message: "Choose at least one channel" }],
      },
    },
    view: {
      type: "ToggleGroup",
      props: {
        items: [
          { label: "List", value: "list" },
          { label: "Cards", value: "cards" },
        ],
        value: { $bindState: "/ui/view" },
      },
    },
  },
};

export const ToggleGroupQuestion: Story = {
  args: { spec: channelsSpec, state: { answers: { channels: "email" }, ui: { view: "list" } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Which channels should the voice cover?" });
    await expect(group).toHaveAttribute("aria-required", "true");
    await expect(group).toHaveAccessibleDescription("Choose every channel that applies.");
    await expect(canvas.getByText("Required")).toBeVisible();
    const email = within(group).getByRole("button", { name: "Email" });
    const chat = within(group).getByRole("button", { name: "Chat" });
    // Pressed options show a check, not only a darker fill.
    await expect(email.querySelector('[data-slot="toggle-group-item-check"]')).not.toBeNull();
    await expect(chat.querySelector('[data-slot="toggle-group-item-check"]')).toBeNull();
    await userEvent.click(chat);
    await waitFor(() => expect(chat.querySelector('[data-slot="toggle-group-item-check"]')).not.toBeNull());
    await expect(chat).toHaveAttribute("aria-pressed", "true");
    // A group bound to /ui switches a view and stays unnamed by any question.
    await expect(canvas.getByRole("button", { name: "Cards" })).toBeEnabled();
  },
};

export const ToggleGroupQuestionValues: Story = {
  args: { spec: channelsSpec, state: { answers: { channels: "email,phone" }, ui: { view: "list" } }, mode: "values" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Which channels should the voice cover?" })).toHaveTextContent(
      "Email, Phone",
    );
  },
};

export const ToggleGroupOwnValidation: Story = {
  render: () => {
    const [store] = useState(() => createStateStore({ answers: { channels: "email" } }));
    return (
      <JSONUIProvider registry={registry} store={store}>
        <Renderer spec={channelsSpec} registry={registry} />
      </JSONUIProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Outside a JsonFormProvider the group shows its own check's message once the person clears it.
    await userEvent.click(canvas.getByRole("button", { name: "Email" }));
    await expect(await canvas.findByText("Choose at least one channel")).toBeVisible();
    await expect(canvas.getByRole("group", { name: "Which channels should the voice cover?" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  },
};

function FieldValueSamples(): ReactElement {
  const hiddenPlain = useJsonField({
    path: "/answers/plain",
    label: "Which rollout path should we ship first?",
  });
  const hiddenDefault = useJsonField({
    path: "/answers/defaulted",
    label: "Keep the existing retry window?",
  });
  const visibleNarrow = useJsonField({
    path: "/answers/narrow",
    label: "very-long-unbroken-deployment-configuration-key-name-for-mobile-viewports",
  });
  return (
    <div className="flex w-60 flex-col gap-4" data-testid="narrow-values">
      <JsonFieldValue field={hiddenPlain} text="Blue-green deployment" hideLabel />
      <JsonFieldValue field={hiddenDefault} text="Yes, keep 30 seconds" hideLabel />
      <JsonFieldValue
        field={visibleNarrow}
        text="https://deploy.example.com/releases/very-long-unbroken-artifact-identifier-2026"
      />
    </div>
  );
}

export const FieldValueHideLabelAndNarrowWrap: Story = {
  render: () => (
    <JsonFormProvider mode="values" defaults={["/answers/defaulted"]}>
      <FieldValueSamples />
    </JsonFormProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plainGroup = canvas.getByRole("group", { name: "Which rollout path should we ship first?" });
    await expect(plainGroup).toHaveTextContent("Blue-green deployment");
    await expect(within(plainGroup).queryByText("Which rollout path should we ship first?")).not.toBeInTheDocument();
    await expect(plainGroup.querySelector('[data-slot="json-field-label"]')).toBeNull();

    const defaultGroup = canvas.getByRole("group", { name: "Keep the existing retry window?" });
    await expect(defaultGroup).toHaveTextContent("Yes, keep 30 seconds");
    await expect(within(defaultGroup).queryByText("Keep the existing retry window?")).not.toBeInTheDocument();
    await expect(within(defaultGroup).getByText("Default")).toBeVisible();

    const narrowGroup = canvas.getByRole("group", {
      name: "very-long-unbroken-deployment-configuration-key-name-for-mobile-viewports",
    });
    const narrowBox = canvas.getByTestId("narrow-values");
    await expect(narrowGroup.scrollWidth).toBeLessThanOrEqual(narrowBox.clientWidth + 1);
    await assertLayoutContained(canvasElement);
  },
};
