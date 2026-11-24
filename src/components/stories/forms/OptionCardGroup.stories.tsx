import { useId, useState } from "react";
import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptionCard, OptionCardGroup, OptionCheckboxCard, OptionCheckboxGroup } from "../../OptionCardGroup";
import { fixture_attachmentImage } from "../fixtures";
import { Field, FieldError, FieldLegend, FieldSet } from "../../Field";
import { Button } from "../../Button";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { assertLayoutContained } from "../../../../.storybook/assertLayoutContained";

type StrategyOptionsProps = Pick<ComponentProps<typeof OptionCard>, "disabled">;

function StrategyOptions({ disabled }: StrategyOptionsProps): ReactElement {
  return (
    <>
      <OptionCard
        value="rolling"
        label="Rolling update"
        description="Replaces instances one at a time. No extra capacity, but a bad release reaches some users."
        disabled={disabled}
      />
      <OptionCard
        value="blue-green"
        label="Blue-green"
        description="Starts a full copy and switches traffic at once. Instant rollback for twice the capacity."
        recommended
        disabled={disabled}
      />
      <OptionCard
        value="recreate"
        label="Recreate"
        description="Stops everything, then starts the new release. Simple, with downtime."
        disabled={disabled}
      />
    </>
  );
}

const meta: Meta<typeof OptionCardGroup> = {
  title: "@alexgorbatchev/shadcn/components/forms/OptionCardGroup",
  component: OptionCardGroup,
  tags: ["autodocs", "test"],
  args: { onValueChange: fn() },
  render: (args) => (
    <FieldSet className="max-w-xl">
      <FieldLegend>Deployment strategy</FieldLegend>
      <OptionCardGroup aria-label="Deployment strategy" {...args}>
        <StrategyOptions disabled={args.disabled} />
      </OptionCardGroup>
    </FieldSet>
  ),
};
export default meta;
type Story = StoryObj<typeof OptionCardGroup>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const rolling = canvas.getByRole("radio", { name: "Rolling update" });
    const blueGreen = canvas.getByRole("radio", { name: "Blue-green Recommended" });
    await expect(canvas.getAllByRole("radio")).toHaveLength(3);
    await expect(rolling).not.toBeChecked();
    await userEvent.click(canvas.getByText("Replaces instances one at a time.", { exact: false }));
    await expect(rolling).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("rolling", expect.objectContaining({ reason: "none" }));
    await userEvent.keyboard("{ArrowDown}");
    await expect(blueGreen).toHaveFocus();
    await expect(blueGreen).toBeChecked();
    await expect(rolling).not.toBeChecked();
    await expect(getComputedStyle(blueGreen).outlineStyle).toBe("solid");
    await userEvent.keyboard("{ArrowUp}");
    await expect(rolling).toBeChecked();
    // No letters: the radio mark alone leads each card, so nothing reads as numbering the author wrote.
    for (const marker of canvasElement.querySelectorAll<HTMLElement>("[data-slot=option-card-marker]"))
      await expect(marker.textContent).toBe("");
    // Each card leads with a radio mark beside its letter, so the choice shows by shape, not only by colour.
    const marks = canvasElement.querySelectorAll<HTMLElement>("[data-slot=option-card-radio]");
    await expect(marks).toHaveLength(3);
    const dot = (mark: HTMLElement | undefined) => mark?.firstElementChild ?? null;
    await expect(getComputedStyle(dot(marks[0]) ?? rolling).display).not.toBe("none");
    await expect(getComputedStyle(dot(marks[1]) ?? rolling).display).toBe("none");
    await assertLayoutContained(canvasElement);
  },
};

/** An unchosen Recommended card keeps the plain frame: only the checked card is framed in colour. */
export const RecommendedNotChosen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recommended = canvas.getByRole("radio", { name: "Blue-green Recommended" });
    const plain = canvas.getByRole("radio", { name: "Rolling update" });
    await expect(recommended).not.toBeChecked();
    await expect(getComputedStyle(recommended).borderTopColor).toBe(getComputedStyle(plain).borderTopColor);
  },
};

export const RecommendedOption: Story = {
  args: { defaultValue: "blue-green" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const blueGreen = canvas.getByRole("radio", { name: "Blue-green Recommended" });
    await expect(blueGreen).toBeChecked();
    await expect(blueGreen).toHaveAttribute("data-recommended");
    await expect(blueGreen).toHaveAccessibleDescription(
      "Starts a full copy and switches traffic at once. Instant rollback for twice the capacity.",
    );
    await expect(within(blueGreen).getByText("Recommended")).toBeVisible();
    await expect(canvas.getByRole("radio", { name: "Rolling update" })).not.toHaveAttribute("data-recommended");
    await expect(canvas.queryAllByText("Recommended")).toHaveLength(1);
  },
};

export const KeyboardSelection: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const rolling = canvas.getByRole("radio", { name: "Rolling update" });
    await userEvent.tab();
    await expect(rolling).toHaveFocus();
    await expect(rolling).not.toBeChecked();
    await userEvent.keyboard(" ");
    await expect(rolling).toBeChecked();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("radio", { name: "Recreate" })).toHaveFocus();
    await expect(canvas.getByRole("radio", { name: "Recreate" })).toBeChecked();
    await userEvent.keyboard("{ArrowDown}");
    await expect(rolling).toHaveFocus();
    await expect(rolling).toBeChecked();
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "rolling" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const recreate = canvas.getByRole("radio", { name: "Recreate" });
    await expect(canvas.getByRole("radiogroup", { name: "Deployment strategy" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await userEvent.click(recreate);
    await expect(recreate).not.toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Rolling update" })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledOption: Story = {
  render: (args) => (
    <OptionCardGroup aria-label="Deployment strategy" {...args}>
      <OptionCard value="rolling" label="Rolling update" />
      <OptionCard value="blue-green" label="Blue-green" description="Needs twice the capacity." disabled />
      <OptionCard value="recreate" label="Recreate" />
    </OptionCardGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const blueGreen = canvas.getByRole("radio", { name: "Blue-green" });
    await userEvent.click(blueGreen);
    await expect(blueGreen).not.toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Rolling update" }));
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Recreate" })).toHaveFocus();
    await expect(canvas.getByRole("radio", { name: "Recreate" })).toBeChecked();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: "recreate" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radiogroup")).toHaveAttribute("aria-readonly", "true");
    await userEvent.click(canvas.getByRole("radio", { name: "Rolling update" }));
    await expect(canvas.getByRole("radio", { name: "Recreate" })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("rolling");
    return (
      <FieldSet className="max-w-xl">
        <FieldLegend>Deployment strategy</FieldLegend>
        <OptionCardGroup {...args} aria-label="Deployment strategy" value={value} onValueChange={setValue}>
          <StrategyOptions />
        </OptionCardGroup>
        <output aria-label="Chosen strategy">{value}</output>
      </FieldSet>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Recreate" }));
    await expect(canvas.getByRole("status", { name: "Chosen strategy" })).toHaveTextContent("recreate");
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("status", { name: "Chosen strategy" })).toHaveTextContent("blue-green");
  },
};

export const CustomMarkers: Story = {
  render: (args) => (
    <OptionCardGroup aria-label="Release window" {...args}>
      <OptionCard value="tonight" marker="1" label="Tonight" description="Fewest users online." />
      <OptionCard value="weekend" marker="2" label="This weekend" description="More time to watch it." />
    </OptionCardGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const tonight = canvas.getByRole("radio", { name: "Tonight" });
    await expect(tonight).toHaveTextContent("1TonightFewest users online.");
    await userEvent.click(canvas.getByRole("radio", { name: "This weekend" }));
    await expect(canvas.getByRole("radio", { name: "This weekend" })).toBeChecked();
  },
};

export const RequiredForm: Story = {
  args: { required: true, name: "strategy" },
  render: function Render(args) {
    const [result, setResult] = useState("");
    const [value, setValue] = useState<string | null>(null);
    return (
      <form
        aria-label="Strategy form"
        onReset={() => setValue(null)}
        onSubmit={(event) => {
          event.preventDefault();
          setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <FieldSet className="max-w-xl">
          <FieldLegend>Deployment strategy</FieldLegend>
          <OptionCardGroup {...args} aria-label="Deployment strategy" value={value} onValueChange={setValue}>
            <StrategyOptions />
          </OptionCardGroup>
          <Field orientation="horizontal">
            <Button type="submit">Save strategy</Button>
            <Button type="reset">Reset strategy</Button>
          </Field>
        </FieldSet>
        <output aria-label="Saved strategy">{result}</output>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "Strategy form" });
    await expect(form).toBeInstanceOf(HTMLFormElement);
    await expect(form instanceof HTMLFormElement && form.checkValidity()).toBe(false);
    await expect(canvas.getByRole("radiogroup")).toHaveAttribute("aria-required", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Save strategy" }));
    await expect(canvas.getByRole("status", { name: "Saved strategy" })).toBeEmptyDOMElement();
    await userEvent.click(canvas.getByRole("radio", { name: "Blue-green Recommended" }));
    await expect(form instanceof HTMLFormElement && form.checkValidity()).toBe(true);
    await userEvent.click(canvas.getByRole("button", { name: "Save strategy" }));
    await expect(canvas.getByRole("status", { name: "Saved strategy" })).toHaveTextContent('{"strategy":"blue-green"}');
    await userEvent.click(canvas.getByRole("button", { name: "Reset strategy" }));
    await waitFor(() => expect(canvas.getByRole("radio", { name: "Blue-green Recommended" })).not.toBeChecked());
  },
};

export const Invalid: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <FieldSet className="max-w-xl">
        <FieldLegend>Deployment strategy</FieldLegend>
        <OptionCardGroup {...args} aria-label="Deployment strategy" aria-invalid>
          <OptionCard value="rolling" label="Rolling update" aria-invalid aria-errormessage={`${id}-error`} />
          <OptionCard
            value="blue-green"
            label="Blue-green"
            recommended
            aria-invalid
            aria-errormessage={`${id}-error`}
          />
        </OptionCardGroup>
        <FieldError id={`${id}-error`}>Choose a deployment strategy.</FieldError>
      </FieldSet>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const rolling = canvas.getByRole("radio", { name: "Rolling update" });
    const blueGreen = canvas.getByRole("radio", { name: "Blue-green Recommended" });
    const errorColor = getComputedStyle(canvas.getByRole("alert")).color;
    await expect(rolling).toHaveAccessibleErrorMessage("Choose a deployment strategy.");
    await expect(blueGreen).toHaveAccessibleErrorMessage("Choose a deployment strategy.");
    await expect(getComputedStyle(blueGreen).borderTopColor).toBe(errorColor);
    await userEvent.click(blueGreen);
    await expect(blueGreen).toBeChecked();
    await waitFor(() => expect(getComputedStyle(blueGreen).borderTopColor).not.toBe(errorColor));
    await expect(getComputedStyle(rolling).borderTopColor).toBe(errorColor);
  },
};

export const NativeStateCallbacks: Story = {
  args: { disabled: false, className: (state) => (state.disabled ? "gap-2" : "gap-6") },
  render: (args) => (
    <OptionCardGroup aria-label="Deployment strategy" {...args}>
      <OptionCard
        value="rolling"
        label="Rolling update"
        className={(state) => (state.checked ? "min-h-24" : "min-h-16")}
      />
      <OptionCard value="recreate" label="Recreate" />
    </OptionCardGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const rolling = canvas.getByRole("radio", { name: "Rolling update" });
    await expect(getComputedStyle(canvas.getByRole("radiogroup")).rowGap).toBe("24px");
    await expect(rolling.getBoundingClientRect().height).toBe(64);
    await userEvent.click(rolling);
    await waitFor(() => expect(rolling.getBoundingClientRect().height).toBe(96));
  },
};

export const NarrowWidth: Story = {
  args: { defaultValue: "blue-green" },
  render: (args) => (
    <div className="w-72">
      <OptionCardGroup aria-label="Deployment strategy" {...args}>
        <StrategyOptions />
        <OptionCard
          value="canary-with-a-very-long-unbroken-identifier"
          label="Canary-release-to-one-percent-of-traffic-first"
          description="A long label wraps inside its card instead of widening the group."
        />
      </OptionCardGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", { name: "Canary-release-to-one-percent-of-traffic-first" })).toBeVisible();
    await assertLayoutContained(canvasElement);
  },
};

const LONG_TRADE_OFF =
  "Starts a full copy of the service beside the running one and switches traffic over at once. Rollback is instant because the old copy keeps running until the switch is confirmed. It needs twice the capacity during the release, which matters on the database tier, where a second copy also doubles connection pool usage and replication lag for the length of the cut-over.";

function HeroOption({ value, label }: { value: string; label: string }): ReactElement {
  return (
    <OptionCard
      value={value}
      label={label}
      description="A hero direction for the homepage."
      image={<img src={fixture_attachmentImage} alt={label} className="block h-auto w-full" />}
    />
  );
}

export const RowLayout: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="w-[56rem]" data-testid="wide">
        <OptionCardGroup aria-label="Hero direction" layout="row" {...args}>
          <HeroOption value="quiet" label="Quiet" />
          <HeroOption value="bold" label="Bold" />
          <HeroOption value="playful" label="Playful" />
        </OptionCardGroup>
      </div>
      <div className="w-72" data-testid="narrow">
        <OptionCheckboxGroup aria-label="Hero directions" layout="row">
          <OptionCheckboxCard value="quiet" label="Quiet narrow" />
          <OptionCheckboxCard value="bold" label="Bold narrow" />
        </OptionCheckboxGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Three image options sit in one row at equal widths, each image uncropped: its rendered box keeps the source shape.
    const tops = ["Quiet", "Bold", "Playful"].map((name) =>
      canvas.getByRole("radio", { name }).getBoundingClientRect(),
    );
    await expect(new Set(tops.map((box) => Math.round(box.top))).size).toBe(1);
    await expect(Math.abs(tops[0]!.width - tops[2]!.width)).toBeLessThan(1);
    const image = canvas.getByRole("img", { name: "Quiet" }) as HTMLImageElement;
    await waitFor(() => expect(image.naturalWidth).toBeGreaterThan(0));
    const box = image.getBoundingClientRect();
    await expect(box.width / box.height).toBeCloseTo(image.naturalWidth / image.naturalHeight, 1);
    // A narrow group falls back to one card per row.
    const narrow = ["Quiet narrow", "Bold narrow"].map((name) =>
      canvas.getByRole("checkbox", { name }).getBoundingClientRect(),
    );
    await expect(narrow[1]!.top).toBeGreaterThan(narrow[0]!.bottom);
    await assertLayoutContained(canvasElement);
  },
};

export const RowLayoutWithFullSpanOption: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="w-[56rem]" data-testid="radio-row">
        <OptionCardGroup aria-label="Hero direction" layout="row" {...args}>
          <OptionCard
            value="quiet"
            label="Quiet"
            description="Short description."
            image={<img src={fixture_attachmentImage} alt="Quiet" className="block h-auto w-full" />}
          />
          <OptionCard
            value="bold"
            label="Bold"
            description="A noticeably longer trade-off description that wraps onto multiple lines so sibling row cards must stretch to match its height."
            image={<img src={fixture_attachmentImage} alt="Bold" className="block h-auto w-full" />}
          />
          <OptionCard
            value="playful"
            label="Playful"
            description="Medium copy."
            image={<img src={fixture_attachmentImage} alt="Playful" className="block h-auto w-full" />}
          />
          <OptionCard value="other" label="Something else" span="full" />
        </OptionCardGroup>
      </div>
      <div className="w-[56rem]" data-testid="checkbox-row">
        <OptionCheckboxGroup aria-label="Extra directions" layout="row">
          <OptionCheckboxCard value="a" label="Alpha" description="Short." />
          <OptionCheckboxCard
            value="b"
            label="Beta"
            description="Multiple lines of description text that make this card taller than its sibling."
          />
          <OptionCheckboxCard value="other" label="Other direction" span="full" />
        </OptionCheckboxGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const radioRow = canvas.getByTestId("radio-row");
    const radioGroup = within(radioRow).getByRole("radiogroup", { name: "Hero direction" });
    const rowCards = ["Quiet", "Bold", "Playful"].map((name) =>
      within(radioRow).getByRole("radio", { name }).getBoundingClientRect(),
    );
    // Sibling cards in the same row match height even when descriptions differ in length.
    await expect(new Set(rowCards.map((box) => Math.round(box.top))).size).toBe(1);
    await expect(Math.abs(rowCards[0]!.height - rowCards[1]!.height)).toBeLessThanOrEqual(1);
    await expect(Math.abs(rowCards[1]!.height - rowCards[2]!.height)).toBeLessThanOrEqual(1);
    // The full-span card sits below the row and stretches across the entire group width.
    const otherRadio = within(radioRow).getByRole("radio", { name: "Something else" });
    const otherRadioBox = otherRadio.getBoundingClientRect();
    const radioGroupBox = radioGroup.getBoundingClientRect();
    await expect(otherRadioBox.top).toBeGreaterThanOrEqual(rowCards[1]!.bottom);
    await expect(Math.abs(otherRadioBox.width - radioGroupBox.width)).toBeLessThanOrEqual(1);
    await expect(otherRadio.closest('[data-slot="option-card-item"]')).toHaveAttribute("data-span", "full");
    await userEvent.click(otherRadio);
    await expect(otherRadio).toBeChecked();

    // Checkbox cards share the same equal-height and full-span row behavior.
    const checkboxRow = canvas.getByTestId("checkbox-row");
    const checkboxGroup = within(checkboxRow).getByRole("group", { name: "Extra directions" });
    const alphaBox = within(checkboxRow).getByRole("checkbox", { name: "Alpha" }).getBoundingClientRect();
    const betaBox = within(checkboxRow).getByRole("checkbox", { name: "Beta" }).getBoundingClientRect();
    await expect(Math.abs(alphaBox.height - betaBox.height)).toBeLessThanOrEqual(1);
    const otherCheckbox = within(checkboxRow).getByRole("checkbox", { name: "Other direction" });
    const otherCheckboxBox = otherCheckbox.getBoundingClientRect();
    await expect(otherCheckboxBox.top).toBeGreaterThanOrEqual(betaBox.bottom);
    await expect(Math.abs(otherCheckboxBox.width - checkboxGroup.getBoundingClientRect().width)).toBeLessThanOrEqual(1);
    await userEvent.click(otherCheckbox);
    await expect(otherCheckbox).toBeChecked();
    await assertLayoutContained(canvasElement);
  },
};

export const FoldedDescription: Story = {
  render: (args) => (
    <div className="w-96">
      <OptionCardGroup aria-label="Deployment strategy" {...args}>
        <OptionCard value="blue-green" label="Blue-green" description={LONG_TRADE_OFF} descriptionLines={3} />
        <OptionCard value="recreate" label="Recreate" description="Stops everything first." descriptionLines={3} />
      </OptionCardGroup>
    </div>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    // Only the description longer than three lines gets a More button, and pressing it changes no choice.
    const more = await canvas.findByRole("button", { name: "More" });
    await expect(canvas.getAllByRole("button", { name: "More" })).toHaveLength(1);
    const card = canvas.getByRole("radio", { name: "Blue-green" });
    const folded = card.getBoundingClientRect().height;
    await userEvent.click(more);
    await waitFor(() => expect(card.getBoundingClientRect().height).toBeGreaterThan(folded));
    // Unfolded for good: More goes away, nothing offers Less, and focus moves to the card's control.
    await expect(canvas.queryByRole("button", { name: "More" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Less" })).not.toBeInTheDocument();
    await expect(card).toHaveFocus();
    await expect(card).not.toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const RecommendedWithReasonAndImage: Story = {
  render: (args) => (
    <div className="w-96">
      <OptionCardGroup aria-label="Hero layout" {...args}>
        <OptionCard
          value="split"
          label="Split hero"
          image={<img src={fixture_attachmentImage} alt="Split hero layout" className="block w-full" />}
          description="Text on the left, product shot on the right."
          recommended
          reason="It keeps the call to action above the fold at every width."
        />
        <OptionCard value="full" label="Full-bleed hero" description="One large image behind the headline." />
      </OptionCardGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("radio", { name: "Split hero Recommended" });
    // The reason reads as part of the card's description, after the trade-off, and the image sits above the label.
    await expect(card).toHaveAccessibleDescription(
      "Text on the left, product shot on the right. Why: It keeps the call to action above the fold at every width.",
    );
    const image = canvas.getByRole("img", { name: "Split hero layout" });
    await expect(image.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      canvas.getByText("Split hero").getBoundingClientRect().top,
    );
  },
};

export const MultipleChoice: Story = {
  render: () => {
    function Example(): ReactElement {
      const [value, setValue] = useState<string[]>([]);
      return (
        <div className="w-96">
          <OptionCheckboxGroup aria-label="Projects" value={value} onValueChange={setValue}>
            <OptionCheckboxCard value="web" label="Web" description="The customer site." />
            <OptionCheckboxCard value="api" label="API" description="Public endpoints." recommended />
            <OptionCheckboxCard value="docs" label="Docs" />
          </OptionCheckboxGroup>
          <output aria-label="Chosen projects">{value.join(",")}</output>
        </div>
      );
    }
    return <Example />;
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const web = canvas.getByRole("checkbox", { name: "Web" });
    const docs = canvas.getByRole("checkbox", { name: "Docs" });
    await userEvent.click(web);
    await userEvent.click(docs);
    await expect(web).toBeChecked();
    await expect(docs).toBeChecked();
    await expect(canvas.getByLabelText("Chosen projects")).toHaveTextContent("web,docs");
    await userEvent.click(web);
    await expect(web).not.toBeChecked();
    await expect(canvas.getByLabelText("Chosen projects")).toHaveTextContent("docs");
    // Choose-any cards show a checkbox in the leading column instead of a letter.
    await expect(docs.querySelector("[data-slot=option-checkbox-indicator]")).not.toBeNull();
  },
};

export const CompactProseDescription: Story = {
  render: (args) => (
    <div className="w-96">
      <OptionCardGroup aria-label="Rollout" {...args}>
        <OptionCard
          value="blue-green"
          label="Blue-green"
          description={
            <span className="typeset typeset-compact block" data-testid="compact">
              <p>Starts a full copy and switches traffic at once.</p>
              <p>Rollback is instant.</p>
            </span>
          }
        />
        <OptionCard
          value="recreate"
          label="Recreate"
          description={
            <span className="typeset block" data-testid="regular">
              <p>Stops everything, then starts the new release.</p>
              <p>Simple, with downtime.</p>
            </span>
          }
        />
      </OptionCardGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const compact = canvas.getByTestId("compact");
    // Compact prose keeps the card's text size at every width and spaces its blocks more tightly than regular prose.
    await expect(getComputedStyle(compact).fontSize).toBe(getComputedStyle(canvas.getByText("Blue-green")).fontSize);
    const gap = (element: Element) => Number.parseFloat(getComputedStyle(element).marginBlockStart);
    const compactGap = gap(compact.querySelectorAll("p")[1]!);
    const regularGap = gap(canvas.getByTestId("regular").querySelectorAll("p")[1]!);
    await expect(compactGap).toBeGreaterThan(0);
    await expect(compactGap).toBeLessThan(regularGap);
    // Compact prose takes the card's muted description colour instead of the prose foreground.
    const slot = compact.closest<HTMLElement>("[data-slot=option-card-description]")!;
    await expect(getComputedStyle(compact).color).toBe(getComputedStyle(slot).color);
    await expect(getComputedStyle(compact).color).not.toBe(getComputedStyle(canvas.getByText("Blue-green")).color);
  },
};

export const FoldedProse: Story = {
  render: (args) => (
    <div className="w-80">
      <OptionCardGroup aria-label="Rollout" {...args}>
        <OptionCard
          value="blue-green"
          label="Blue-green"
          descriptionLines={3}
          description={
            <span className="typeset typeset-compact block" data-testid="prose">
              <p>{LONG_TRADE_OFF}</p>
            </span>
          }
          recommended
          reason={
            <span className="typeset typeset-compact block">
              <p>Payment retries are where a slow rollback costs the most.</p>
            </span>
          }
        />
      </OptionCardGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("radio", { name: "Blue-green Recommended" });
    const description = card.querySelector<HTMLElement>("[data-slot=option-card-description]")!;
    const prose = canvas.getByTestId("prose").querySelector("p")!;
    const line = Number.parseFloat(getComputedStyle(prose).lineHeight);
    // Folded to whole lines of the prose it holds, never through the middle of one.
    await waitFor(() => expect(description.getBoundingClientRect().height).toBeCloseTo(3 * line, 0));
    // More sits inside the card's border.
    const more = await canvas.findByRole("button", { name: "More" });
    await expect(more.getBoundingClientRect().bottom).toBeLessThanOrEqual(card.getBoundingClientRect().bottom);
    await userEvent.click(more);
    // The reason's first line runs beside its "Why:" label.
    const why = within(card).getByText("Why:");
    const reasonText = within(card).getByText("Payment retries are where a slow rollback costs the most.");
    await expect(Math.abs(why.getBoundingClientRect().top - reasonText.getBoundingClientRect().top)).toBeLessThan(4);
    // The reason reads in the description's muted colour, not the label's.
    await expect(getComputedStyle(reasonText).color).toBe(getComputedStyle(description).color);
    await expect(getComputedStyle(why).color).toBe(getComputedStyle(description).color);
  },
};
