import { useId, useState } from "react";
import type { InputState } from "@base-ui/react/input";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../Input";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "../Field";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { ButtonGroup } from "../ButtonGroup";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText } from "../InputGroup";
import { DirectionProvider } from "../DirectionProvider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "../Select";
import { fixture_runtimes } from "./fixtures";
import { expect, fn, waitFor, within } from "storybook/test";

const meta: Meta<typeof Input> = {
  title: "shadcn-alexgorbatchev/components/Input",
  component: Input,
  tags: ["autodocs", "test"],
  args: { placeholder: "alex@example.com", onChange: fn() },
  render: (args) => {
    const storyId = useId();
    return (
      <Field data-invalid={args["aria-invalid"]} data-disabled={args.disabled}>
        <FieldLabel htmlFor={`${storyId}-input-demo`}>
          {args.type === "file" ? "Project file" : args.type === "password" ? "Password" : "Email"}
        </FieldLabel>
        <Input
          id={`${storyId}-input-demo`}
          aria-describedby={`${storyId}-input-help`}
          aria-errormessage={args["aria-invalid"] ? `${storyId}-input-error` : undefined}
          {...args}
        />
        <FieldDescription id={`${storyId}-input-help`}>Used for account notifications.</FieldDescription>
        {args["aria-invalid"] && <FieldError id={`${storyId}-input-error`}>Check this value.</FieldError>}
      </Field>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.click(canvas.getByText("Email"));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription("Used for account notifications.");
    await userEvent.type(input, "alex@example.com");
    await expect(input).toHaveValue("alex@example.com");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
export const Filled: Story = {
  args: { defaultValue: "alex@example.com" },
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Email" });
    await expect(input).toHaveValue("alex@example.com");
    await userEvent.clear(input);
    await userEvent.type(input, "blair@example.com");
    await expect(input).toHaveValue("blair@example.com");
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Email" });
    await expect(input).toBeDisabled();
    await userEvent.type(input, "ignored");
    await expect(input).toHaveValue("");
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
  },
};
export const Invalid: Story = {
  ...Default,
  args: { "aria-invalid": true },
  play: async (context) => {
    await Default.play?.(context);
    const canvas = within(context.canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent("Check this value.");
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveAccessibleErrorMessage("Check this value.");
  },
};
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: "Read only value" },
  play: async ({ canvasElement, userEvent, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "ignored");
    await expect(input).toHaveValue("Read only value");
    await expect(input).toHaveFocus();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const Password: Story = {
  args: { type: "password", placeholder: "Password" },
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByLabelText("Password");
    await userEvent.type(input, "correct-horse");
    await expect(input).toHaveValue("correct-horse");
    await expect(input).toHaveAttribute("type", "password");
  },
};
export const FileUpload: Story = {
  args: { type: "file", placeholder: undefined, accept: ".txt" },
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByLabelText("Project file") as HTMLInputElement;
    await userEvent.upload(input, new File(["Project notes"], "notes.txt", { type: "text/plain" }));
    await expect(input.files).toHaveLength(1);
    await expect(input.files?.item(0)?.name).toBe("notes.txt");
    await expect(await input.files?.item(0)?.text()).toBe("Project notes");
  },
};
export const NativeCallbacks: Story = {
  args: { className: (state: InputState) => (state.disabled ? "h-12" : "h-8") },
  render: function Render(args) {
    const [isDisabled, setIsDisabled] = useState(false);
    const id = useId();
    return (
      <Field>
        <FieldLabel htmlFor={id}>Callback input</FieldLabel>
        <Input {...args} id={id} disabled={isDisabled} />
        <Button onClick={() => setIsDisabled(true)}>Disable input</Button>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Callback input" });
    await expect(input.getBoundingClientRect().height).toBe(32);
    await userEvent.click(canvas.getByRole("button", { name: "Disable input" }));
    await expect(input.getBoundingClientRect().height).toBe(48);
    await expect(input).toBeDisabled();
  },
};
export const NativeValueChange: Story = {
  args: { onValueChange: fn() },
  play: async ({ canvasElement, userEvent, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "alex");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("alex", expect.objectContaining({ reason: "none" }));
    await expect(input).toHaveValue("alex");
  },
};
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <Field>
        <Input
          {...args}
          aria-label="Uppercase name"
          value={value}
          onValueChange={(nextValue) => setValue(nextValue.toUpperCase())}
        />
        <output aria-label="Current name">{value}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Uppercase name" }), "alex");
    await expect(canvas.getByRole("textbox", { name: "Uppercase name" })).toHaveValue("ALEX");
    await expect(canvas.getByRole("status", { name: "Current name" })).toHaveTextContent("ALEX");
  },
};
export const NativeRenderAndRef: Story = {
  args: { render: <input data-testid="Input--custom" />, ref: fn() },
  play: async ({ canvasElement, userEvent, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Email" });
    await expect(args.ref).toHaveBeenCalledWith(input);
    await expect(within(canvasElement).getByTestId("Input--custom")).toBe(input);
    await userEvent.type(input, "alex");
    await expect(input).toHaveValue("alex");
  },
};
export const NativeEmailValidation: Story = {
  args: { type: "email", required: true },
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Email" }) as HTMLInputElement;
    await expect(input.checkValidity()).toBe(false);
    await userEvent.type(input, "invalid");
    await expect(input.validity.typeMismatch).toBe(true);
    await userEvent.clear(input);
    await userEvent.type(input, "alex@example.com");
    await expect(input.checkValidity()).toBe(true);
  },
};
export const FormSubmissionAndReset: Story = {
  render: function Render(args) {
    const [result, setResult] = useState("");
    return (
      <form
        aria-label="Profile form"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <Field>
          <Input {...args} name="email" aria-label="Profile email" defaultValue="alex@example.com" />
          <Input name="omitted" aria-label="Disabled profile field" disabled defaultValue="hidden" />
          <Button type="submit">Save profile</Button>
          <Button type="reset">Reset profile</Button>
        </Field>
        <output aria-label="Saved profile">{result}</output>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Profile email" });
    await userEvent.clear(input);
    await userEvent.type(input, "blair@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Save profile" }));
    await expect(canvas.getByRole("status", { name: "Saved profile" })).toHaveTextContent(
      '{"email":"blair@example.com"}',
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reset profile" }));
    await expect(input).toHaveValue("alex@example.com");
  },
};

export const InlineSearch: Story = {
  render: function Render(args) {
    const id = useId();
    const [query, setQuery] = useState("");
    return (
      <form
        aria-label="Project search"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(String(new FormData(event.currentTarget).get("query")));
        }}
      >
        <Field orientation="horizontal">
          <FieldLabel htmlFor={id} className="sr-only">
            Search projects
          </FieldLabel>
          <Input {...args} id={id} name="query" required placeholder="Project name" />
          <Button type="submit">Search</Button>
        </Field>
        <output aria-label="Search query">{query}</output>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Search projects" }) as HTMLInputElement;
    const button = canvas.getByRole("button", { name: "Search" });
    await expect(input.checkValidity()).toBe(false);
    await expect(input.getBoundingClientRect().right).toBeLessThanOrEqual(button.getBoundingClientRect().left);
    await userEvent.type(input, "Alpha{Enter}");
    await expect(canvas.getByRole("status", { name: "Search query" })).toHaveTextContent("Alpha");
  },
};

export const GridFields: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <FieldGroup className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor={id + "-first"}>First name</FieldLabel>
          <Input {...args} id={id + "-first"} />
        </Field>
        <Field>
          <FieldLabel htmlFor={id + "-last"}>Last name</FieldLabel>
          <Input {...args} id={id + "-last"} />
        </Field>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("textbox", { name: "First name" });
    const last = canvas.getByRole("textbox", { name: "Last name" });
    await userEvent.click(canvas.getByText("First name"));
    await expect(first).toHaveFocus();
    await userEvent.type(first, "Alex");
    await userEvent.tab();
    await expect(last).toHaveFocus();
    await userEvent.type(last, "Smith");
    await expect(first).toHaveValue("Alex");
    await expect(last).toHaveValue("Smith");
    await expect(first.getBoundingClientRect().top).toBe(last.getBoundingClientRect().top);
    await expect(first.getBoundingClientRect().right).toBeLessThan(last.getBoundingClientRect().left);
  },
};

export const Required: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <Field>
        <FieldLabel htmlFor={id}>
          Project name <span aria-hidden>*</span>
        </FieldLabel>
        <Input {...args} id={id} required aria-describedby={id + "-help"} />
        <FieldDescription id={id + "-help"}>A project name is required.</FieldDescription>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Project name" }) as HTMLInputElement;
    await expect(input).toBeRequired();
    await expect(input).toHaveAccessibleDescription("A project name is required.");
    await expect(input.validity.valueMissing).toBe(true);
    await userEvent.type(input, "Alpha");
    await expect(input.checkValidity()).toBe(true);
  },
};

export const WithBadge: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <Field>
        <FieldLabel htmlFor={id}>
          Webhook URL <Badge variant="secondary">Beta</Badge>
        </FieldLabel>
        <Input {...args} id={id} type="url" placeholder="https://example.com/webhook" />
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Webhook URL Beta" }) as HTMLInputElement;
    await userEvent.click(canvas.getByText("Beta"));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "https://example.com/webhook");
    await expect(input.checkValidity()).toBe(true);
    await expect(input).toHaveValue("https://example.com/webhook");
  },
};

export const WithInputGroup: Story = {
  render: function Render() {
    const id = useId();
    return (
      <Field>
        <FieldLabel htmlFor={id}>Website domain</FieldLabel>
        <InputGroup>
          <InputGroupInput id={id} aria-describedby={id + "-help"} />
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription id={id + "-help"}>Enter the domain without its protocol.</FieldDescription>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Website domain" });
    await expect(input).toHaveAccessibleDescription("Enter the domain without its protocol.");
    await userEvent.click(canvas.getByText("https://"));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "example.com");
    await expect(input).toHaveValue("example.com");
  },
};

export const WithButtonGroup: Story = {
  render: function Render(args) {
    const id = useId();
    const [query, setQuery] = useState("");
    return (
      <form
        aria-label="Joined project search"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(String(new FormData(event.currentTarget).get("query")));
        }}
      >
        <Field>
          <FieldLabel htmlFor={id}>Joined search</FieldLabel>
          <ButtonGroup>
            <Input {...args} id={id} name="query" required />
            <Button type="submit" variant="outline">
              Find
            </Button>
          </ButtonGroup>
        </Field>
        <output aria-label="Joined search query">{query}</output>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Joined search" });
    await userEvent.type(input, "Beta");
    await userEvent.tab();
    const button = canvas.getByRole("button", { name: "Find" });
    await expect(button).toHaveFocus();
    await expect(
      Math.abs(input.getBoundingClientRect().right - button.getBoundingClientRect().left),
    ).toBeLessThanOrEqual(1);
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Joined search query" })).toHaveTextContent("Beta");
  },
};

export const ProfileForm: Story = {
  render: function Render(args) {
    const id = useId();
    const [result, setResult] = useState("");
    const [runtime, setRuntime] = useState<string | null>("bun");
    return (
      <form
        aria-label="Project profile"
        className="w-80"
        onReset={() => setRuntime("bun")}
        onSubmit={(event) => {
          event.preventDefault();
          setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={id + "-name"}>Name</FieldLabel>
            <Input {...args} id={id + "-name"} name="name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor={id + "-email"}>Contact email</FieldLabel>
            <Input id={id + "-email"} type="email" name="email" aria-describedby={id + "-help"} />
            <FieldDescription id={id + "-help"}>Used for project updates.</FieldDescription>
          </Field>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor={id + "-phone"}>Phone</FieldLabel>
              <Input id={id + "-phone"} type="tel" name="phone" />
            </Field>
            <Field>
              <FieldLabel htmlFor={id + "-runtime"}>Runtime</FieldLabel>
              <Select items={fixture_runtimes} name="runtime" value={runtime} onValueChange={setRuntime}>
                <SelectTrigger id={id + "-runtime"}>
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
            </Field>
          </FieldGroup>
          <Field>
            <FieldLabel htmlFor={id + "-address"}>Address</FieldLabel>
            <Input id={id + "-address"} name="address" />
          </Field>
          <Field orientation="horizontal">
            <Button type="reset" variant="outline">
              Reset
            </Button>
            <Button type="submit">Submit profile</Button>
          </Field>
        </FieldGroup>
        <output aria-label="Submitted project profile">{result}</output>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Submit profile" }));
    const name = canvas.getByRole("textbox", { name: "Name" });
    await expect(name).toHaveFocus();
    await userEvent.type(name, "Alex");
    const email = canvas.getByRole("textbox", { name: "Contact email" });
    await expect(email).toHaveAccessibleDescription("Used for project updates.");
    await userEvent.type(email, "alex@example.com");
    await userEvent.type(canvas.getByRole("textbox", { name: "Phone" }), "+1 555 1234");
    await userEvent.type(canvas.getByRole("textbox", { name: "Address" }), "123 Main St");
    const trigger = canvas.getByRole("combobox", { name: "Runtime" });
    await userEvent.click(trigger);
    const option = await within(canvasElement.ownerDocument.body).findByRole("option", { name: "Deno" });
    await waitFor(() => expect(option).toBeVisible());
    await userEvent.click(option);
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Submit profile" }));
    await expect(canvas.getByRole("status", { name: "Submitted project profile" })).toHaveTextContent(
      '{"name":"Alex","email":"alex@example.com","phone":"+1 555 1234","runtime":"deno","address":"123 Main St"}',
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(name).toHaveValue("");
    await expect(email).toHaveValue("");
    await expect(trigger).toHaveTextContent("Bun");
  },
};

export const RightToLeft: Story = {
  args: { dir: "rtl" },
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl" className="w-80">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async (context) => {
    await Default.play?.(context);
    const description = within(context.canvasElement).getByText("Used for account notifications.");
    const range = description.ownerDocument.createRange();
    range.selectNodeContents(description);
    await expect(
      Math.abs(range.getBoundingClientRect().right - description.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(1);
  },
};
