import { useId, useState } from "react";
import type { Separator } from "@base-ui/react/separator";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "../ButtonGroup";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import { Field, FieldGroup } from "../Field";
import { Input } from "../Input";
import { Label } from "../Label";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "../InputGroup";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../DropdownMenu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "../Select";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from "../Popover";
import { fixture_runtimes } from "./fixtures";

const onSave = fn();
const meta: Meta<typeof ButtonGroup> = {
  title: "shadcn-alexgorbatchev/components/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs", "test"],
  args: { "aria-label": "Document actions" },
  argTypes: { orientation: { control: "select", options: ["horizontal", "vertical"] } },
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupText>Draft</ButtonGroupText>
      <Button variant="outline" onClick={onSave}>
        Save
      </Button>
      <ButtonGroupSeparator />
      <Button variant="outline">More</Button>
    </ButtonGroup>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Horizontal: Story = {
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole("group", { name: "Document actions" }));
    await expect(group.getByText("Draft")).toBeVisible();
    await userEvent.click(group.getByRole("button", { name: "Save" }));
    await expect(onSave).toHaveBeenCalledOnce();
    await userEvent.tab();
    await expect(group.getByRole("button", { name: "More" })).toHaveFocus();
  },
};
export const Vertical: Story = { ...Horizontal, args: { orientation: "vertical" } };
export const Compact: Story = { ...Horizontal, args: { density: "compact" } };

const separatorClassName = fn((state: Separator.State) =>
  state.orientation === "vertical" ? "data-[orientation=vertical]:w-2" : "data-[orientation=horizontal]:h-2",
);
const separatorRef = fn();
export const NativeSeparatorCallback: Story = {
  render: (args) => {
    const [orientation, setOrientation] = useState<"horizontal" | "vertical">("vertical");
    return (
      <ButtonGroup {...args} orientation={orientation === "vertical" ? "horizontal" : "vertical"}>
        <Button onClick={() => setOrientation(orientation === "vertical" ? "horizontal" : "vertical")}>
          Change separator orientation
        </Button>
        <ButtonGroupSeparator orientation={orientation} className={separatorClassName} ref={separatorRef} />
        <Button>Save</Button>
      </ButtonGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("separator");
    await expect(separatorClassName).toHaveBeenCalledWith(expect.objectContaining({ orientation: "vertical" }));
    await expect(separatorRef).toHaveBeenCalledWith(separator);
    await expect(separator.getBoundingClientRect().width).toBe(8);
    await expect(getComputedStyle(separator).marginTop).toBe("1px");
    await userEvent.click(canvas.getByRole("button", { name: "Change separator orientation" }));
    await waitFor(() => expect(separator).toHaveAttribute("aria-orientation", "horizontal"));
    await expect(separatorClassName).toHaveBeenCalledWith(expect.objectContaining({ orientation: "horizontal" }));
    await waitFor(() => expect(separator.getBoundingClientRect().height).toBe(8));
    await expect(getComputedStyle(separator).marginLeft).toBe("1px");
  },
};

export const RightToLeft: Story = {
  render: (args) => {
    const [direction, setDirection] = useState<"ltr" | "rtl">("rtl");
    return (
      <DirectionProvider direction={direction}>
        <ButtonGroup {...args} dir={direction}>
          <Button variant="outline" onClick={() => setDirection(direction === "rtl" ? "ltr" : "rtl")}>
            Change direction
          </Button>
          <Button variant="outline">Save</Button>
        </ButtonGroup>
      </DirectionProvider>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "Change direction" });
    const last = canvas.getByRole("button", { name: "Save" });
    await expect(first.getBoundingClientRect().left).toBeGreaterThan(last.getBoundingClientRect().left);
    await expect(getComputedStyle(last).borderLeftWidth).toBe(getComputedStyle(first).borderRightWidth);
    await expect(getComputedStyle(last).borderRightWidth).toBe("0px");
    await expect(getComputedStyle(last).borderTopLeftRadius).toBe(getComputedStyle(first).borderTopRightRadius);
    await expect(getComputedStyle(last).borderTopRightRadius).toBe("0px");
    await expect(getComputedStyle(first).borderTopLeftRadius).toBe("0px");
    await userEvent.click(first);
    await waitFor(() => expect(first.getBoundingClientRect().left).toBeLessThan(last.getBoundingClientRect().left));
    await expect(getComputedStyle(last).borderRightWidth).toBe(getComputedStyle(first).borderLeftWidth);
    await expect(getComputedStyle(last).borderLeftWidth).toBe("0px");
    await expect(getComputedStyle(last).borderTopRightRadius).toBe(getComputedStyle(first).borderTopLeftRadius);
    await expect(getComputedStyle(last).borderTopLeftRadius).toBe("0px");
    await expect(getComputedStyle(first).borderTopRightRadius).toBe("0px");
    await userEvent.tab();
    await expect(last).toHaveFocus();
  },
};

export const LabeledInput: Story = {
  render: (args) => {
    const id = useId();
    const [submitted, setSubmitted] = useState("");
    return (
      <form
        aria-label="Project search"
        className="w-80"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get("query")));
        }}
      >
        <FieldGroup>
          <Field>
            <ButtonGroup {...args} className="w-full">
              <ButtonGroupText render={<Label htmlFor={id} />}>Search</ButtonGroupText>
              <Input id={id} name="query" required />
              <Button variant="outline" type="submit">
                Find
              </Button>
            </ButtonGroup>
          </Field>
          <output aria-label="Search result">{submitted}</output>
        </FieldGroup>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Search" });
    await userEvent.click(canvas.getByText("Search", { selector: "label" }));
    await expect(input).toHaveFocus();
    await expect(input.getBoundingClientRect().width).toBeGreaterThan(100);
    await userEvent.type(input, "storybook{Enter}");
    await expect(canvas.getByRole("status", { name: "Search result" })).toHaveTextContent("storybook");
    await userEvent.clear(input);
    await userEvent.type(input, "components");
    await userEvent.click(canvas.getByRole("button", { name: "Find" }));
    await expect(canvas.getByRole("status", { name: "Search result" })).toHaveTextContent("components");
  },
};

export const NestedInputGroup: Story = {
  render: (args) => {
    const [message, setMessage] = useState("");
    const [sent, setSent] = useState("");
    return (
      <FieldGroup>
        <Field>
          <ButtonGroup {...args} aria-label="Message composer">
            <ButtonGroup aria-label="Message actions">
              <Button variant="outline" onClick={() => setMessage("")}>
                Clear
              </Button>
            </ButtonGroup>
            <ButtonGroup aria-label="Message input">
              <InputGroup aria-label="Message entry">
                <InputGroupInput aria-label="Message" value={message} onValueChange={setMessage} />
                <InputGroupAddon align="inline-end" aria-label="Send action">
                  <InputGroupButton disabled={!message} onClick={() => setSent(message)}>
                    Send
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </ButtonGroup>
          </ButtonGroup>
        </Field>
        <output aria-label="Sent message">{sent}</output>
      </FieldGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const send = canvas.getByRole("button", { name: "Send" });
    await expect(send).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await userEvent.tab();
    const input = canvas.getByRole("textbox", { name: "Message" });
    await expect(input).toHaveFocus();
    await userEvent.type(input, "Hello team");
    await userEvent.tab();
    await expect(send).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Sent message" })).toHaveTextContent("Hello team");
    const actions = canvas.getByRole("group", { name: "Message actions" }).getBoundingClientRect();
    const entry = canvas.getByRole("group", { name: "Message input" }).getBoundingClientRect();
    await expect(entry.left).toBeGreaterThan(actions.right);
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(input).toHaveValue("");
    await expect(send).toBeDisabled();
  },
};

export const SmallButtons: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup {...args}>
        <Button variant="outline" size="sm" onClick={onSave}>
          Save
        </Button>
        <Button variant="outline" size="sm">
          Archive
        </Button>
      </ButtonGroup>
      <Button variant="outline">Default size</Button>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole("button", { name: "Save" });
    await expect(save.getBoundingClientRect().height).toBeLessThan(
      canvas.getByRole("button", { name: "Default size" }).getBoundingClientRect().height,
    );
    await userEvent.click(save);
    await expect(onSave).toHaveBeenCalledOnce();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Archive" })).toHaveFocus();
  },
};

export const LargeButtons: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup {...args}>
        <Button variant="outline" size="lg" onClick={onSave}>
          Save
        </Button>
        <Button variant="outline" size="lg">
          Archive
        </Button>
      </ButtonGroup>
      <Button variant="outline">Default size</Button>
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole("button", { name: "Save" });
    await expect(save.getBoundingClientRect().height).toBeGreaterThan(
      canvas.getByRole("button", { name: "Default size" }).getBoundingClientRect().height,
    );
    await userEvent.click(save);
    await expect(onSave).toHaveBeenCalledOnce();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Archive" })).toHaveFocus();
  },
};

export const SplitDropdown: Story = {
  render: (args) => {
    const [result, setResult] = useState("Draft");
    return (
      <div className="flex flex-col items-start gap-4">
        <ButtonGroup {...args}>
          <Button onClick={() => setResult("Saved")}>Save</Button>
          <ButtonGroupSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button />}>Save options</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setResult("Saved as copy")}>Save a copy</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
        <output aria-label="Save result">{result}</output>
      </div>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(canvas.getByRole("status", { name: "Save result" })).toHaveTextContent("Saved");
    await userEvent.tab();
    const trigger = canvas.getByRole("button", { name: "Save options" });
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const item = await body.findByRole("menuitem", { name: "Save a copy" });
    await waitFor(() => expect(item).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Save result" })).toHaveTextContent("Saved as copy");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const WithSelect: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Select items={fixture_runtimes} defaultValue="bun">
        <SelectTrigger aria-label="Runtime">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {fixture_runtimes.map((runtime) => (
              <SelectItem key={runtime.label} value={runtime.value}>
                {runtime.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onSave}>
        Run
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Runtime" });
    await userEvent.click(trigger);
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("option", { name: "Node.js" }));
    await waitFor(() => expect(trigger).toHaveTextContent("Node.js"));
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Run" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onSave).toHaveBeenCalledOnce();
  },
};

export const WithPopover: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline" onClick={onSave}>
        Run
      </Button>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>Run details</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Local workspace</PopoverTitle>
            <PopoverDescription>Run the project using your selected runtime.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Run" }));
    await expect(onSave).toHaveBeenCalledOnce();
    await userEvent.tab();
    const trigger = canvas.getByRole("button", { name: "Run details" });
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Local workspace" });
    await expect(dialog).toHaveAccessibleDescription("Run the project using your selected runtime.");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
