import type { ReactElement } from "react";
import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldSeparator,
} from "../../Field";
import { Input } from "../../Input";
import { Checkbox } from "../../Checkbox";
import { Button } from "../../Button";
import { Textarea } from "../../Textarea";
import { RadioGroup, RadioGroupItem } from "../../RadioGroup";
import { Switch } from "../../Switch";
import { Slider } from "../../Slider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../Select";
import { DirectionProvider } from "../../DirectionProvider";
import { fixture_runtimes } from "../fixtures";

const meta: Meta<typeof Field> = {
  title: "@alexgorbatchev/shadcn/components/forms/Field",
  component: Field,
  tags: ["autodocs", "test"],
  args: { orientation: "vertical" },
  render: (args) => {
    const storyId = useId();
    return (
      <Field {...args}>
        <FieldLabel htmlFor={`${storyId}-field-name`}>Project name</FieldLabel>
        <Input id={`${storyId}-field-name`} aria-describedby={`${storyId}-field-help`} defaultValue="my-project" />
        <FieldDescription id={`${storyId}-field-help`}>Choose a recognizable name.</FieldDescription>
      </Field>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Project name" });
    await expect(input).toHaveAccessibleDescription("Choose a recognizable name.");
    await userEvent.click(canvas.getByText("Project name"));
    await expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, "updated-project");
    await expect(input).toHaveValue("updated-project");
    await expect(canvas.getByText("Choose a recognizable name.")).toBeVisible();
  },
};
export const Horizontal: Story = { ...Default, args: { orientation: "horizontal" } };
export const Responsive: Story = {
  render: function Render() {
    const id = useId();
    const [isWide, setIsWide] = useState(false);
    return (
      <>
        <Button onClick={() => setIsWide((current) => !current)}>Resize fields</Button>
        <FieldGroup style={{ width: isWide ? 600 : 360 }}>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor={id}>Responsive name</FieldLabel>
              <FieldDescription id={id + "-help"}>Provide your full name for identification.</FieldDescription>
            </FieldContent>
            <Input id={id} aria-describedby={id + "-help"} />
          </Field>
        </FieldGroup>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Responsive name" });
    const label = canvas.getByText("Responsive name");
    const description = canvas.getByText("Provide your full name for identification.");
    await expect(input).toHaveAccessibleDescription("Provide your full name for identification.");
    await expect(getComputedStyle(description).textWrap).toBe("wrap");
    await expect(input.getBoundingClientRect().top).toBeGreaterThanOrEqual(label.getBoundingClientRect().bottom);
    await userEvent.click(canvas.getByRole("button", { name: "Resize fields" }));
    await waitFor(() =>
      expect(input.getBoundingClientRect().left).toBeGreaterThanOrEqual(label.getBoundingClientRect().right),
    );
    await userEvent.click(label);
    await expect(input).toHaveFocus();
    await expect(getComputedStyle(description).textWrap).toBe("balance");
  },
};
export const Invalid: Story = {
  render: () => {
    const storyId = useId();
    return (
      <Field data-invalid>
        <FieldLabel htmlFor={`${storyId}-invalid-name`}>Project name</FieldLabel>
        <Input
          id={`${storyId}-invalid-name`}
          aria-invalid
          aria-describedby={`${storyId}-invalid-message`}
          defaultValue=""
        />
        <FieldError id={`${storyId}-invalid-message`}>A project name is required.</FieldError>
      </Field>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Project name" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("A project name is required.");
    await expect(canvas.getByRole("alert")).toHaveTextContent("A project name is required.");
  },
};
export const Disabled: Story = {
  render: () => {
    const storyId = useId();
    return (
      <Field data-disabled>
        <FieldLabel htmlFor={`${storyId}-disabled-name`}>Project name</FieldLabel>
        <Input id={`${storyId}-disabled-name`} disabled defaultValue="my-project" />
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Project name" });
    await expect(input).toBeDisabled();
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
  },
};
export const Grouped: Story = {
  render: () => {
    const storyId = useId();
    return (
      <FieldSet aria-describedby={`${storyId}-notify-help`}>
        <FieldLegend>Notifications</FieldLegend>
        <FieldDescription id={`${storyId}-notify-help`}>Select delivery channels.</FieldDescription>
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox id={`${storyId}-notify-email`} aria-describedby={`${storyId}-email-help`} defaultChecked />
            <FieldContent>
              <FieldLabel htmlFor={`${storyId}-notify-email`}>Email</FieldLabel>
              <FieldDescription id={`${storyId}-email-help`}>Weekly updates.</FieldDescription>
            </FieldContent>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field orientation="horizontal">
            <Checkbox id={`${storyId}-notify-desktop`} />
            <FieldLabel htmlFor={`${storyId}-notify-desktop`}>Desktop</FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Notifications" })).toBeVisible();
    await expect(canvas.getByRole("group", { name: "Notifications" })).toHaveAccessibleDescription(
      "Select delivery channels.",
    );
    const email = canvas.getByRole("checkbox", { name: "Email" });
    await expect(email).toHaveAccessibleDescription("Weekly updates.");
    const desktop = canvas.getByRole("checkbox", { name: "Desktop" });
    await expect(email).toBeChecked();
    await userEvent.click(canvas.getByText("Email"));
    await expect(email).not.toBeChecked();
    await userEvent.click(canvas.getByText("Desktop"));
    await expect(desktop).toBeChecked();
    await expect(canvas.getByRole("separator").getBoundingClientRect().height).toBe(1);
  },
};
export const MultipleErrors: Story = {
  render: () => (
    <Field data-invalid>
      <FieldTitle>Validation</FieldTitle>
      <FieldError
        errors={[{ message: "Required field." }, { message: "Invalid format." }, { message: "Required field." }]}
      />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(within(alert).getAllByRole("listitem")).toHaveLength(2);
    await expect(alert).toHaveTextContent("Required field.");
    await expect(alert).toHaveTextContent("Invalid format.");
  },
};

export const EmptyErrors: Story = {
  render: () => (
    <Field>
      <FieldTitle>Validation results</FieldTitle>
      <FieldError errors={[undefined, {}, { message: "" }]} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("alert")).not.toBeInTheDocument();
  },
};

export const SingleError: Story = {
  render: () => (
    <Field>
      <FieldTitle>Validation results</FieldTitle>
      <FieldError errors={[{ message: "A name is required." }, { message: "A name is required." }]} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveTextContent("A name is required.");
    await expect(within(alert).queryByRole("list")).not.toBeInTheDocument();
  },
};

export const RightToLeftErrors: Story = {
  ...MultipleErrors,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  play: async (context) => {
    const alert = within(context.canvasElement).getByRole("alert");
    const list = within(alert).getByRole("list");
    const alertBox = alert.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();
    await expect(alertBox.right - listBox.right).toBeGreaterThan(0);
    await expect(listBox.left).toBe(alertBox.left);
    await MultipleErrors.play?.(context);
  },
};
export const HorizontalDescription: Story = {
  render: function Render() {
    const id = useId();
    const [isHorizontal, setIsHorizontal] = useState(true);
    return (
      <FieldGroup className="w-80">
        <Field orientation={isHorizontal ? "horizontal" : "vertical"}>
          <Checkbox id={id} />
          <FieldContent>
            <FieldLabel htmlFor={id}>Project updates</FieldLabel>
            <FieldDescription>
              Receive weekly project news and important release updates from your team.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Button onClick={() => setIsHorizontal((current) => !current)}>Change orientation</Button>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const description = canvas.getByText("Receive weekly project news and important release updates from your team.");
    await expect(getComputedStyle(description).textWrap).toBe("balance");
    await userEvent.click(canvas.getByRole("button", { name: "Change orientation" }));
    await expect(getComputedStyle(description).textWrap).toBe("wrap");
    await userEvent.click(canvas.getByText("Project updates"));
    await expect(canvas.getByRole("checkbox", { name: "Project updates" })).toBeChecked();
  },
};

export const WithTextarea: Story = {
  render: function Render() {
    const id = useId();
    return (
      <Field className="w-80">
        <FieldLabel htmlFor={id}>Feedback</FieldLabel>
        <Textarea id={id} aria-describedby={id + "-help"} />
        <FieldDescription id={id + "-help"}>Share your thoughts.</FieldDescription>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Feedback"));
    const input = canvas.getByRole("textbox", { name: "Feedback" });
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription("Share your thoughts.");
    await userEvent.type(input, "First line{Enter}Second line");
    await expect(input).toHaveValue("First line\nSecond line");
  },
};
export const WithSelect: Story = {
  render: function Render() {
    const id = useId();
    const [runtime, setRuntime] = useState<string | null>(null);
    return (
      <Field className="w-80">
        <FieldLabel htmlFor={id}>Runtime</FieldLabel>
        <Select<string> items={fixture_runtimes} value={runtime} onValueChange={setRuntime}>
          <SelectTrigger id={id} aria-describedby={id + "-help"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {fixture_runtimes.map((item) => (
                <SelectItem key={item.value ?? "placeholder"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription id={id + "-help"}>Choose the project runtime.</FieldDescription>
        <output aria-label="Selected runtime">{runtime}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Runtime" });
    await expect(trigger).toHaveAccessibleDescription("Choose the project runtime.");
    await userEvent.click(canvas.getByText("Runtime"));
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const option = await within(canvasElement.ownerDocument.body).findByRole("option", { name: "Bun" });
    await waitFor(() => expect(option).toBeVisible());
    await userEvent.click(option);
    await expect(canvas.getByRole("status", { name: "Selected runtime" })).toHaveTextContent("bun");
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(trigger).toHaveTextContent("Bun");
  },
};
export const WithSlider: Story = {
  render: function Render() {
    const id = useId();
    const [range, setRange] = useState([200, 800]);
    return (
      <Field className="w-80">
        <FieldTitle id={id}>Budget range</FieldTitle>
        <FieldDescription id={id + "-help"}>
          Choose a budget from {range[0]} to {range[1]}.
        </FieldDescription>
        <Slider<number[]>
          value={range}
          onValueChange={setRange}
          min={0}
          max={1000}
          step={10}
          getAriaLabel={(index) => ["Minimum budget", "Maximum budget"][index]}
          aria-labelledby={id}
          aria-describedby={id + "-help"}
        />
        <output aria-label="Current budget">{range.join("–")}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const minimum = await canvas.findByRole("slider", { name: "Minimum budget" });
    await expect(canvas.getByRole("group", { name: "Budget range" })).toHaveAccessibleDescription(
      "Choose a budget from 200 to 800.",
    );
    const maximum = canvas.getByRole("slider", { name: "Maximum budget" });
    await userEvent.tab();
    await expect(minimum).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(minimum).toHaveAttribute("aria-valuenow", "210");
    await userEvent.tab();
    await expect(maximum).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(maximum).toHaveAttribute("aria-valuenow", "790");
    await expect(canvas.getByRole("status", { name: "Current budget" })).toHaveTextContent("210–790");
    await expect(canvas.getByText("Choose a budget from 210 to 790.")).toBeVisible();
  },
};
export const WithSwitch: Story = {
  render: function Render() {
    const id = useId();
    return (
      <Field orientation="horizontal" className="w-80">
        <FieldLabel htmlFor={id}>Multi-factor authentication</FieldLabel>
        <Switch id={id} />
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch", { name: "Multi-factor authentication" });
    await userEvent.click(canvas.getByText("Multi-factor authentication"));
    await expect(control).toBeChecked();
    await expect(control).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(control).not.toBeChecked();
  },
};
export const WithRadio: Story = {
  render: function Render() {
    const id = useId();
    return (
      <FieldSet className="w-80">
        <FieldLegend variant="label">Subscription plan</FieldLegend>
        <FieldDescription id={id + "-help"}>Choose how often to renew.</FieldDescription>
        <RadioGroup defaultValue="monthly" aria-label="Subscription plan" aria-describedby={id + "-help"}>
          <Field orientation="horizontal">
            <RadioGroupItem id={id + "-monthly"} value="monthly" />
            <FieldLabel htmlFor={id + "-monthly"}>Monthly</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem id={id + "-yearly"} value="yearly" />
            <FieldLabel htmlFor={id + "-yearly"}>Yearly</FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radiogroup", { name: "Subscription plan" })).toHaveAccessibleDescription(
      "Choose how often to renew.",
    );
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Yearly" })).toBeChecked();
    await userEvent.click(canvas.getByText("Monthly"));
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toBeChecked();
  },
};
export const RadioChoiceCards: Story = {
  render: function Render() {
    const id = useId();
    return (
      <FieldGroup className="w-80">
        <FieldSet>
          <FieldLegend variant="label">Compute environment</FieldLegend>
          <RadioGroup defaultValue="cluster" aria-label="Compute environment">
            <FieldLabel htmlFor={id + "-cluster"}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Cluster</FieldTitle>
                  <FieldDescription>Run workloads together.</FieldDescription>
                </FieldContent>
                <RadioGroupItem id={id + "-cluster"} value="cluster" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor={id + "-vm"}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Virtual machine</FieldTitle>
                  <FieldDescription>Run an isolated workload.</FieldDescription>
                </FieldContent>
                <RadioGroupItem id={id + "-vm"} value="vm" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const cluster = canvas.getByRole("radio", { name: "Cluster Run workloads together." });
    const vm = canvas.getByRole("radio", { name: "Virtual machine Run an isolated workload." });
    const clusterCard = cluster.closest("label") as HTMLLabelElement;
    const vmCard = vm.closest("label") as HTMLLabelElement;
    const selectedColor = getComputedStyle(clusterCard).backgroundColor;
    const plainColor = getComputedStyle(vmCard).backgroundColor;
    await expect(selectedColor).not.toBe(plainColor);
    await userEvent.click(canvas.getByText("Virtual machine"));
    await expect(vm).toBeChecked();
    await expect(cluster).not.toBeChecked();
    await expect(vm).toHaveFocus();
    await expect(getComputedStyle(vmCard).backgroundColor).toBe(selectedColor);
    await expect(getComputedStyle(clusterCard).backgroundColor).toBe(plainColor);
    await userEvent.keyboard("{ArrowUp}");
    await expect(cluster).toBeChecked();
  },
};
export const CheckboxChoiceCard: Story = {
  render: function Render() {
    const id = useId();
    return (
      <FieldGroup className="w-80">
        <FieldLabel htmlFor={id}>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Sync files</FieldTitle>
              <FieldDescription>Keep project files available.</FieldDescription>
            </FieldContent>
            <Checkbox id={id} />
          </Field>
        </FieldLabel>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Sync files Keep project files available." });
    await userEvent.click(canvas.getByText("Keep project files available."));
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};
export const SwitchChoiceCard: Story = {
  render: function Render() {
    const id = useId();
    return (
      <FieldGroup className="w-80">
        <FieldLabel htmlFor={id}>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Enable backup</FieldTitle>
              <FieldDescription>Save a daily snapshot.</FieldDescription>
            </FieldContent>
            <Switch id={id} />
          </Field>
        </FieldLabel>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch", { name: "Enable backup Save a daily snapshot." });
    await userEvent.click(canvas.getByText("Save a daily snapshot."));
    await expect(control).toBeChecked();
    await expect(control).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(control).not.toBeChecked();
  },
};
export const RightToLeftChoiceCards: Story = {
  ...RadioChoiceCards,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const radio = canvas.getByRole("radio", { name: "Cluster Run workloads together." });
    const title = canvas.getByText("Cluster");
    await expect(radio.getBoundingClientRect().right).toBeLessThan(title.getBoundingClientRect().left);
    await RadioChoiceCards.play?.(context);
  },
};
export const RightToLeftGrouped: Story = {
  ...Grouped,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const description = canvas.getByText("Weekly updates.");
    const range = document.createRange();
    range.selectNodeContents(description);
    await expect(range.getBoundingClientRect().right).toBe(description.getBoundingClientRect().right);
    await Grouped.play?.(context);
  },
};

const reportSchema = z.object({
  title: z.string().min(5, "Use at least five characters for the title.").max(40),
  description: z.string().min(12, "Describe the problem in at least twelve characters.").max(120),
  updates: z.boolean(),
});
type ReportValues = z.infer<typeof reportSchema>;

const profileSchema = z.object({
  displayName: z.string().min(3, "Use at least three characters for the name."),
  team: z.string().min(3, "Use at least three characters for the team."),
});
type ProfileValidation = Awaited<ReturnType<(typeof profileSchema)["~standard"]["validate"]>>;

export const StandardSchemaValidation: Story = {
  render: function Render() {
    const id = useId();
    const [issues, setIssues] = useState<ProfileValidation["issues"]>();
    const [result, setResult] = useState("");
    return (
      <form
        aria-label="Standard validation"
        noValidate
        className="w-80"
        onSubmit={async (event) => {
          event.preventDefault();
          const validation = await profileSchema["~standard"].validate(
            Object.fromEntries(new FormData(event.currentTarget)),
          );
          setIssues(validation.issues);
          setResult(validation.issues ? "" : JSON.stringify(validation.value));
        }}
      >
        <FieldGroup>
          <Field data-invalid={!!issues}>
            <FieldLabel htmlFor={id + "-name"}>Display name</FieldLabel>
            <Input
              id={id + "-name"}
              name="displayName"
              aria-invalid={!!issues}
              aria-describedby={issues ? id + "-errors" : undefined}
            />
          </Field>
          <Field data-invalid={!!issues}>
            <FieldLabel htmlFor={id + "-team"}>Team</FieldLabel>
            <Input
              id={id + "-team"}
              name="team"
              aria-invalid={!!issues}
              aria-describedby={issues ? id + "-errors" : undefined}
            />
          </Field>
          <FieldError id={id + "-errors"} errors={issues} />
          <Button type="submit">Validate profile</Button>
          <output aria-label="Validated profile">{result}</output>
        </FieldGroup>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Validate profile" }));
    const alert = await canvas.findByRole("alert");
    await expect(within(alert).getAllByRole("listitem")).toHaveLength(2);
    await expect(canvas.getByRole("textbox", { name: "Display name" })).toHaveAccessibleDescription(
      "Use at least three characters for the name. Use at least three characters for the team.",
    );
    await userEvent.type(canvas.getByRole("textbox", { name: "Display name" }), "Alex");
    await userEvent.type(canvas.getByRole("textbox", { name: "Team" }), "Design");
    await userEvent.click(canvas.getByRole("button", { name: "Validate profile" }));
    await waitFor(() =>
      expect(canvas.getByRole("status", { name: "Validated profile" })).toHaveTextContent(
        '{"displayName":"Alex","team":"Design"}',
      ),
    );
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};

function ReportForm(): ReactElement {
  const id = useId();
  const [result, setResult] = useState("");
  const form = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { title: "", description: "", updates: true },
  });
  return (
    <form
      aria-label="Bug report"
      noValidate
      onSubmit={form.handleSubmit((values) => setResult(JSON.stringify(values)))}
      onReset={() => {
        form.reset();
        setResult("");
      }}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={id + "-title"}>Bug title</FieldLabel>
              <Input
                {...field}
                id={id + "-title"}
                required
                minLength={5}
                maxLength={40}
                aria-invalid={fieldState.invalid}
                aria-describedby={id + "-title-help" + (fieldState.invalid ? " " + id + "-title-error" : "")}
              />
              <FieldDescription id={id + "-title-help"}>Name the affected feature.</FieldDescription>
              {fieldState.invalid && <FieldError id={id + "-title-error"} errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={id + "-description"}>Problem description</FieldLabel>
              <Textarea
                {...field}
                id={id + "-description"}
                required
                minLength={12}
                maxLength={120}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? id + "-description-error" : undefined}
              />
              {fieldState.invalid && <FieldError id={id + "-description-error"} errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="updates"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                ref={field.ref}
                id={id + "-updates"}
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
              />
              <FieldLabel htmlFor={id + "-updates"}>Email updates</FieldLabel>
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button type="reset" variant="outline">
            Reset report
          </Button>
          <Button type="submit">Submit report</Button>
        </Field>
      </FieldGroup>
      <output aria-label="Submitted report">{result}</output>
    </form>
  );
}

export const FormComposition: Story = {
  render: () => <ReportForm />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole("textbox", { name: "Bug title" });
    const description = canvas.getByRole("textbox", { name: "Problem description" });
    await userEvent.click(canvas.getByRole("button", { name: "Submit report" }));
    await waitFor(() => expect(title).toHaveFocus());
    await expect(title).toHaveAttribute("aria-invalid", "true");
    await expect(title).toHaveAccessibleDescription(
      "Name the affected feature. Use at least five characters for the title.",
    );
    await expect(canvas.getAllByRole("alert")).toHaveLength(2);
    await userEvent.type(title, "Broken login");
    await userEvent.type(description, "The login button does not respond.");
    await userEvent.click(canvas.getByText("Email updates"));
    await userEvent.click(canvas.getByRole("button", { name: "Submit report" }));
    await waitFor(() =>
      expect(canvas.getByRole("status", { name: "Submitted report" })).toHaveTextContent(
        '{"title":"Broken login","description":"The login button does not respond.","updates":false}',
      ),
    );
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Reset report" }));
    await expect(title).toHaveValue("");
    await expect(description).toHaveValue("");
    await expect(canvas.getByRole("checkbox", { name: "Email updates" })).toBeChecked();
    await expect(canvas.getByRole("status", { name: "Submitted report" })).toBeEmptyDOMElement();
  },
};
