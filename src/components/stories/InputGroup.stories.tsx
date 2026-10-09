import { useId, useRef, useState } from "react";
import type { InputState } from "@base-ui/react/input";
import type { ButtonState } from "@base-ui/react/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from "../InputGroup";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "../Field";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../DropdownMenu";
import { SearchIcon, CopyIcon } from "lucide-react";
import { expect, fn, waitFor, within } from "storybook/test";

const meta: Meta<typeof InputGroup> = {
  title: "shadcn-alexgorbatchev/components/InputGroup",
  component: InputGroup,
  tags: ["autodocs", "test"],
  args: { onClick: fn() },
  render: (args) => (
    <InputGroup {...args} aria-label="Project search">
      <InputGroupInput aria-label="Search" placeholder="Search projects" />
      <InputGroupAddon aria-label="Search adornment">
        <SearchIcon aria-hidden />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupText>⌘K</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Search: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Search" });
    await userEvent.click(canvas.getByRole("group", { name: "Search adornment" }));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "Project alpha");
    await expect(input).toHaveValue("Project alpha");
  },
};
export const WithAction: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("https://example.com");
    const [result, setResult] = useState("");
    return (
      <Field>
        <InputGroup {...args}>
          <InputGroupInput aria-label="Project URL" value={value} onValueChange={setValue} />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Copy URL"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(value);
                  setResult("URL copied");
                } catch {
                  setResult("Clipboard access denied.");
                }
              }}
            >
              <CopyIcon aria-hidden />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <output aria-label="Copy result">{result}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Copy URL" });
    await userEvent.clear(canvas.getByRole("textbox", { name: "Project URL" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Project URL" }), "https://example.com/project");
    await userEvent.click(button);
    await expect(button).toHaveFocus();
    await expect(canvas.getByRole("status", { name: "Copy result" })).toHaveTextContent("URL copied");
    await expect(await navigator.clipboard.readText()).toBe("https://example.com/project");
  },
};
export const Disabled: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Disabled search" disabled placeholder="Search" />
      <InputGroupAddon aria-label="Disabled adornment">
        <SearchIcon aria-hidden />
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Disabled search" });
    await expect(input).toBeDisabled();
    await userEvent.click(canvas.getByRole("group", { name: "Disabled adornment" }));
    await expect(input).not.toHaveFocus();
    await userEvent.type(input, "ignored");
    await expect(input).toHaveValue("");
  },
};
export const DisabledInputWithAction: Story = {
  render: function Render(args) {
    const [details, setDetails] = useState("Choose Details to inspect the project.");
    return (
      <Field>
        <InputGroup {...args}>
          <InputGroupInput aria-label="Project code" defaultValue="AG-42" disabled />
          <InputGroupAddon>
            <InputGroupText>Project</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={() => setDetails("Project AG-42")}>Details</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <output aria-label="Project details">{details}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Project code" });
    const action = canvas.getByRole("button", { name: "Details" });
    await expect(input).toBeDisabled();
    await expect(input).toHaveValue("AG-42");
    await expect(action).toBeEnabled();
    await userEvent.click(action);
    await expect(canvas.getByRole("status", { name: "Project details" })).toHaveTextContent("Project AG-42");
  },
};
export const Invalid: Story = {
  render: (args) => (
    <Field data-invalid>
      <InputGroup {...args}>
        <InputGroupInput
          aria-label="Invalid search"
          aria-invalid
          defaultValue="?"
          aria-describedby="input-group-error"
        />
        <InputGroupAddon>
          <SearchIcon aria-hidden />
        </InputGroupAddon>
      </InputGroup>
      <FieldError id="input-group-error">Enter a project name.</FieldError>
    </Field>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Invalid search" });
    await expect(input).toHaveAccessibleDescription("Enter a project name.");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.clear(input);
    await userEvent.type(input, "Project alpha");
    await expect(input).toHaveValue("Project alpha");
  },
};
export const Textarea: Story = {
  render: function Render(args) {
    const [result, setResult] = useState("");
    return (
      <form
        aria-label="Comment form"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(String(new FormData(event.currentTarget).get("comment")));
        }}
      >
        <Field>
          <InputGroup {...args}>
            <InputGroupTextarea name="comment" aria-label="Comment" placeholder="Write a comment" />
            <InputGroupAddon align="block-end">
              <InputGroupText>Markdown supported</InputGroupText>
              <InputGroupButton type="submit" variant="default" size="sm">
                Post
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <output aria-label="Posted comment">{result}</output>
        </Field>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Comment" });
    await userEvent.click(canvas.getByText("Markdown supported"));
    await expect(input).toHaveFocus();
    const initialHeight = input.getBoundingClientRect().height;
    await userEvent.type(input, "One{Enter}Two{Enter}Three{Enter}Four{Enter}Five");
    await expect(input.getBoundingClientRect().height).toBeGreaterThan(initialHeight);
    await userEvent.click(canvas.getByRole("button", { name: "Post" }));
    await expect(canvas.getByRole("status", { name: "Posted comment" })).toHaveTextContent("One Two Three Four Five");
  },
};
export const AddonCallback: Story = {
  render: (args) => (
    <InputGroup>
      <InputGroupInput aria-label="Callback search" />
      <InputGroupAddon onClick={args.onClick}>
        <InputGroupText>Search projects</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Search projects"));
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("textbox", { name: "Callback search" })).toHaveFocus();
  },
};
export const CancelledAddonFocus: Story = {
  render: (args) => (
    <FieldGroup>
      <Button>Keep focus</Button>
      <InputGroup {...args}>
        <InputGroupInput aria-label="Cancelled search" />
        <InputGroupAddon onClick={(event) => event.preventDefault()}>
          <InputGroupText>Cancelled addon</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </FieldGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Keep focus" }));
    await userEvent.click(canvas.getByText("Cancelled addon"));
    await expect(canvas.getByRole("textbox", { name: "Cancelled search" })).not.toHaveFocus();
  },
};
export const LinkAddon: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Help search" />
      <InputGroupAddon align="inline-end">
        <a href="#input-group-help" onClick={(event) => event.preventDefault()}>
          Search help
        </a>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Search help" });
    await userEvent.click(link);
    await expect(link).toHaveFocus();
    await expect(canvas.getByRole("textbox", { name: "Help search" })).not.toHaveFocus();
  },
};
export const NativeInputCallbacks: Story = {
  render: function Render(args) {
    const [isDisabled, setIsDisabled] = useState(false);
    return (
      <Field>
        <InputGroup {...args}>
          <InputGroupInput
            aria-label="Native callback input"
            disabled={isDisabled}
            className={(state: InputState) => (state.disabled ? "h-12" : "h-8")}
          />
          <InputGroupAddon>
            <InputGroupText>Native state</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <Button onClick={() => setIsDisabled(true)}>Disable callback input</Button>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Native callback input" });
    await expect(input.getBoundingClientRect().height).toBe(32);
    await userEvent.click(canvas.getByRole("button", { name: "Disable callback input" }));
    await expect(input).toBeDisabled();
    await expect(input.getBoundingClientRect().height).toBe(48);
  },
};
export const NativeButtonCallbacks: Story = {
  render: function Render(args) {
    const [isDisabled, setIsDisabled] = useState(false);
    return (
      <InputGroup {...args}>
        <InputGroupInput aria-label="Native button input" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            disabled={isDisabled}
            className={(state: ButtonState) => (state.disabled ? "h-12" : "h-8")}
            onClick={() => setIsDisabled(true)}
          >
            Disable action
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Disable action" });
    await expect(button.getBoundingClientRect().height).toBe(32);
    await userEvent.click(button);
    await expect(button).toBeDisabled();
    await expect(button.getBoundingClientRect().height).toBe(48);
  },
};
export const NativeRenderAndRefs: Story = {
  render: function Render(args) {
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    return (
      <FieldGroup>
        <InputGroup {...args}>
          <InputGroupInput
            aria-label="Rendered input"
            render={<input data-testid="InputGroup--custom-input" />}
            ref={inputRef}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton render={<button data-testid="InputGroup--custom-button" />} ref={buttonRef}>
              Native button
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea aria-label="Native textarea" ref={textareaRef} />
        </InputGroup>
        <Button onClick={() => inputRef.current?.focus()}>Focus input ref</Button>
        <Button onClick={() => textareaRef.current?.focus()}>Focus textarea ref</Button>
        <Button onClick={() => buttonRef.current?.focus()}>Focus button ref</Button>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Focus input ref" }));
    await expect(canvas.getByTestId("InputGroup--custom-input")).toHaveFocus();
    await userEvent.keyboard("alex");
    await expect(canvas.getByRole("textbox", { name: "Rendered input" })).toHaveValue("alex");
    await userEvent.click(canvas.getByRole("button", { name: "Focus textarea ref" }));
    await expect(canvas.getByRole("textbox", { name: "Native textarea" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Focus button ref" }));
    await expect(canvas.getByTestId("InputGroup--custom-button")).toHaveFocus();
  },
};
export const FormSubmissionAndReset: Story = {
  render: function Render(args) {
    const [result, setResult] = useState("");
    const id = useId();
    return (
      <form
        aria-label="Group form"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={id}>Profile name</FieldLabel>
            <InputGroup {...args}>
              <InputGroupInput id={id} name="name" defaultValue="alex" required />
              <InputGroupAddon align="inline-end">
                <InputGroupButton>Preview</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <InputGroup>
            <InputGroupInput aria-label="Omitted name" name="omitted" defaultValue="hidden" disabled />
          </InputGroup>
          <InputGroup>
            <InputGroupTextarea aria-label="Profile notes" name="notes" defaultValue="Initial notes" />
            <InputGroupAddon align="block-end">
              <InputGroupButton type="submit">Save group</InputGroupButton>
              <InputGroupButton type="reset">Reset group</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <output aria-label="Saved group">{result}</output>
        </FieldGroup>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Profile name" }) as HTMLInputElement;
    await userEvent.click(canvas.getByRole("button", { name: "Preview" }));
    await expect(canvas.getByRole("status", { name: "Saved group" })).toHaveTextContent("");
    await userEvent.clear(input);
    await expect(input.checkValidity()).toBe(false);
    await userEvent.type(input, "blair");
    await userEvent.clear(canvas.getByRole("textbox", { name: "Profile notes" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Profile notes" }), "Updated notes");
    await userEvent.click(canvas.getByRole("button", { name: "Save group" }));
    await expect(canvas.getByRole("status", { name: "Saved group" })).toHaveTextContent(
      '{"name":"blair","notes":"Updated notes"}',
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reset group" }));
    await expect(input).toHaveValue("alex");
    await expect(canvas.getByRole("textbox", { name: "Profile notes" })).toHaveValue("Initial notes");
  },
};
export const BlockStart: Story = {
  render: (args) => (
    <InputGroup {...args} aria-label="Block group">
      <InputGroupInput aria-label="Block name" />
      <InputGroupAddon align="block-start">
        <InputGroupText>Project name</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const addon = canvas.getByText("Project name");
    const input = canvas.getByRole("textbox", { name: "Block name" });
    await expect(addon.getBoundingClientRect().bottom).toBeLessThanOrEqual(input.getBoundingClientRect().top);
    await userEvent.click(addon);
    await expect(input).toHaveFocus();
    await userEvent.type(input, "Alpha");
    await expect(input).toHaveValue("Alpha");
  },
};
export const ReadOnly: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Reference" readOnly defaultValue="REF-001" />
      <InputGroupAddon>
        <InputGroupText>Reference code</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Reference" });
    await userEvent.click(canvas.getByText("Reference code"));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "ignored");
    await expect(input).toHaveValue("REF-001");
  },
};
export const RTL: Story = {
  args: { dir: "rtl" },
  play: async (context) => {
    await Search.play?.(context);
    const canvas = within(context.canvasElement);
    const input = canvas.getByRole("textbox", { name: "Search" });
    const addon = canvas.getByRole("group", { name: "Search adornment" });
    await expect(addon.getBoundingClientRect().left).toBeGreaterThanOrEqual(input.getBoundingClientRect().right);
    const icon = addon.querySelector("svg") as SVGSVGElement;
    await expect(addon.getBoundingClientRect().right - icon.getBoundingClientRect().right).toBe(8);
  },
};
export const Compact: Story = {
  args: { density: "compact" },
  play: async (context) => {
    await Search.play?.(context);
    await expect(
      within(context.canvasElement).getByRole("group", { name: "Project search" }).getBoundingClientRect().height,
    ).toBe(20);
  },
};
export const Comfortable: Story = {
  args: { density: "comfortable" },
  play: async (context) => {
    await Search.play?.(context);
    await expect(
      within(context.canvasElement).getByRole("group", { name: "Project search" }).getBoundingClientRect().height,
    ).toBe(28);
  },
};

export const ButtonSizes: Story = {
  args: { density: "comfortable" },
  render: (args) => (
    <FieldGroup>
      <InputGroup {...args} aria-label="Small action group">
        <InputGroupInput aria-label="Small action input" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="sm">Small action</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args} aria-label="Small icon group">
        <InputGroupInput aria-label="Small icon input" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" aria-label="Small icon action">
            <SearchIcon aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args} aria-label="Extra small action group">
        <InputGroupInput aria-label="Extra small action input" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs">Extra small action</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args} aria-label="Extra small icon group">
        <InputGroupInput aria-label="Extra small icon input" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Extra small icon action">
            <SearchIcon aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </FieldGroup>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    for (const name of ["Small action", "Small icon", "Extra small action", "Extra small icon"]) {
      const group = canvas.getByRole("group", { name: name + " group" });
      const button = within(group).getByRole("button");
      await expect(button.getBoundingClientRect().top).toBeGreaterThanOrEqual(group.getBoundingClientRect().top + 1);
      await expect(button.getBoundingClientRect().bottom).toBeLessThanOrEqual(group.getBoundingClientRect().bottom - 1);
      await userEvent.click(button);
      await expect(button).toHaveFocus();
    }
    await expect(args.onClick).toHaveBeenCalledTimes(4);
  },
};
export const CompactButtonSizes: Story = {
  ...ButtonSizes,
  args: { density: "compact" },
};

export const InlineEnd: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Filter projects" />
      <InputGroupAddon align="inline-end" aria-label="Filter icon">
        <SearchIcon aria-hidden />
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Filter projects" });
    const addon = canvas.getByRole("group", { name: "Filter icon" });
    await expect(addon.getBoundingClientRect().left).toBeGreaterThanOrEqual(input.getBoundingClientRect().right);
    await userEvent.click(addon);
    await expect(input).toHaveFocus();
    await userEvent.type(input, "Alpha");
    await expect(input).toHaveValue("Alpha");
  },
};

export const TextAffixes: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <Field>
        <FieldLabel htmlFor={id}>Budget (USD)</FieldLabel>
        <InputGroup {...args}>
          <InputGroupInput id={id} type="number" min={0} aria-describedby={id + "-help"} />
          <InputGroupAddon>
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription id={id + "-help"}>Enter a nonnegative budget in US dollars.</FieldDescription>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton", { name: "Budget (USD)" }) as HTMLInputElement;
    await expect(input).toHaveAccessibleDescription("Enter a nonnegative budget in US dollars.");
    await userEvent.click(canvas.getByText("$"));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "42");
    await userEvent.click(canvas.getByText("USD", { exact: true }));
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue(42);
    await expect(input.checkValidity()).toBe(true);
  },
};

export const RightToLeftAffixes: Story = {
  ...TextAffixes,
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
    await TextAffixes.play?.(context);
    const canvas = within(context.canvasElement);
    const input = canvas.getByRole("spinbutton", { name: "Budget (USD)" });
    await expect(canvas.getByText("$").getBoundingClientRect().left).toBeGreaterThanOrEqual(
      input.getBoundingClientRect().right,
    );
    await expect(canvas.getByText("USD", { exact: true }).getBoundingClientRect().right).toBeLessThanOrEqual(
      input.getBoundingClientRect().left,
    );
  },
};

export const DropdownAction: Story = {
  render: function Render(args) {
    const [format, setFormat] = useState("Markdown");
    return (
      <Field>
        <InputGroup {...args}>
          <InputGroupInput aria-label="File name" />
          <InputGroupAddon align="inline-end">
            <DropdownMenu>
              <DropdownMenuTrigger render={<InputGroupButton aria-label="File actions" />}>Format</DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setFormat("Markdown")}>Markdown</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFormat("Plain text")}>Plain text</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        </InputGroup>
        <output aria-label="File format">{format}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("textbox", { name: "File name" });
    const trigger = canvas.getByRole("button", { name: "File actions" });
    await userEvent.type(input, "notes");
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const menu = await body.findByRole("menu", { name: "File actions" });
    await waitFor(() => expect(menu).toBeVisible());
    await userEvent.keyboard("{End}");
    await expect(within(menu).getByRole("menuitem", { name: "Plain text" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "File format" })).toHaveTextContent("Plain text");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(input).toHaveValue("notes");
  },
};

export const RightToLeftDropdown: Story = {
  ...DropdownAction,
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
    await DropdownAction.play?.(context);
    const canvas = within(context.canvasElement);
    const input = canvas.getByRole("textbox", { name: "File name" });
    const trigger = canvas.getByRole("button", { name: "File actions" });
    await expect(trigger.getBoundingClientRect().right).toBeLessThanOrEqual(input.getBoundingClientRect().left);
  },
};

export const BlockStartTextarea: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupTextarea aria-label="Markdown notes" />
      <InputGroupAddon align="block-start">
        <InputGroupText>Markdown editor</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Markdown notes" });
    const label = canvas.getByText("Markdown editor");
    await expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(input.getBoundingClientRect().top);
    await userEvent.click(label);
    await expect(input).toHaveFocus();
    await userEvent.type(input, "# Project{Enter}Notes");
    await expect(input).toHaveValue("# Project\nNotes");
  },
};

export const CustomControl: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <Field>
        <FieldLabel htmlFor={id}>Custom notes</FieldLabel>
        <InputGroup {...args} aria-label="Custom notes group">
          <textarea
            id={id}
            data-slot="input-group-control"
            aria-describedby={id + "-help"}
            className="field-sizing-content min-h-16 w-full resize-none bg-transparent px-control-x py-2 text-base outline-none"
          />
          <InputGroupAddon align="block-end">
            <InputGroupText>Notes editor</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription id={id + "-help"}>The native custom control grows with its content.</FieldDescription>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Custom notes" });
    const group = canvas.getByRole("group", { name: "Custom notes group" });
    await expect(input).toHaveAccessibleDescription("The native custom control grows with its content.");
    const initialHeight = input.getBoundingClientRect().height;
    await expect(getComputedStyle(group).boxShadow).toBe("none");
    await userEvent.click(canvas.getByText("Notes editor"));
    await expect(input).toHaveFocus();
    await expect(getComputedStyle(group).boxShadow).not.toBe("none");
    await userEvent.type(input, "One{Enter}Two{Enter}Three{Enter}Four{Enter}Five");
    await expect(input).toHaveValue("One\nTwo\nThree\nFour\nFive");
    await expect(input.getBoundingClientRect().height).toBeGreaterThan(initialHeight);
    await expect(canvas.getByText("Notes editor").getBoundingClientRect().top).toBeGreaterThanOrEqual(
      input.getBoundingClientRect().bottom,
    );
  },
};

export const RightToLeftCustomControl: Story = {
  ...CustomControl,
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
};
