import { useId, useRef, useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import type { SelectRootChangeEventDetails } from "@base-ui/react/select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "../Select";
import { DirectionProvider } from "../DirectionProvider";
import { DensityProvider } from "../DensityProvider";
import { Button } from "../Button";
import { Field, FieldGroup, FieldLabel, FieldError } from "../Field";
import { fixture_runtimes, fixture_runtimeEngines, fixture_projectNumbers } from "./fixtures";
import type { RuntimeEngine } from "./fixtures/types";
import { expect, fn, waitFor, within } from "storybook/test";

type SelectStoryProps = ComponentProps<typeof Select> & {
  triggerClassName?: ComponentProps<typeof SelectTrigger>["className"];
  valueClassName?: ComponentProps<typeof SelectValue>["className"];
  contentClassName?: ComponentProps<typeof SelectContent>["className"];
  groupClassName?: ComponentProps<typeof SelectGroup>["className"];
  labelClassName?: ComponentProps<typeof SelectLabel>["className"];
  itemClassName?: ComponentProps<typeof SelectItem>["className"];
  separatorClassName?: ComponentProps<typeof SelectSeparator>["className"];
};
const meta: Meta<SelectStoryProps> = {
  title: "shadcn-alexgorbatchev/components/Select",
  component: Select,
  tags: ["autodocs", "test"],
  args: { items: fixture_runtimes, onValueChange: fn(), onOpenChange: fn() },
  render: ({
    triggerClassName,
    valueClassName,
    contentClassName,
    groupClassName,
    labelClassName,
    itemClassName,
    separatorClassName,
    ...args
  }) => (
    <Select {...args}>
      <SelectTrigger aria-label="Runtime" className={triggerClassName}>
        <SelectValue className={valueClassName} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        <SelectGroup className={groupClassName}>
          <SelectLabel className={labelClassName}>Runtime</SelectLabel>
          {fixture_runtimes
            .filter((item) => !args.multiple || item.value !== null)
            .map((item) => (
              <SelectItem key={item.value ?? "placeholder"} value={item.value} className={itemClassName}>
                {item.label}
              </SelectItem>
            ))}
          <SelectSeparator className={separatorClassName} data-testid="Select--separator" />
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("combobox", { name: "Runtime" });
    await expect(trigger).toHaveTextContent("Select a runtime");
    await userEvent.click(trigger);
    const list = await body.findByRole("listbox");
    await userEvent.click(within(list).getByRole("option", { name: "Bun" }));
    await expect(trigger).toHaveTextContent("Bun");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("bun", expect.objectContaining({ reason: "item-press" }));
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const Selected: Story = {
  args: { defaultValue: "bun" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("combobox", { name: "Runtime" });
    await expect(trigger).toHaveTextContent("Bun");
    await userEvent.click(trigger);
    const list = await body.findByRole("listbox");
    await expect(within(list).getByRole("option", { name: "Bun" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(within(list).getByRole("option", { name: "Deno" }));
    await expect(trigger).toHaveTextContent("Deno");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "deno",
      expect.objectContaining({ reason: "item-press" }),
    );
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(within(canvasElement.ownerDocument.body).queryByRole("listbox")).not.toBeInTheDocument();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(trigger).not.toHaveFocus();
  },
};
export const Multiple: Story = {
  args: { multiple: true, defaultValue: ["bun", "node"] },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("combobox", { name: "Runtime" });
    await expect(trigger).toHaveTextContent("Bun, Node.js");
    await userEvent.click(trigger);
    const list = await body.findByRole("listbox");
    await userEvent.click(within(list).getByRole("option", { name: "Deno" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ["bun", "node", "deno"],
      expect.objectContaining({ reason: "item-press" }),
    );
    await expect(list).toBeVisible();
    await userEvent.click(within(list).getByRole("option", { name: "Node.js" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ["bun", "deno"],
      expect.objectContaining({ reason: "item-press" }),
    );
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveTextContent("Bun, Deno");
  },
};
export const Small: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger size="sm" aria-label="Runtime">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {fixture_runtimes.map((item) => (
            <SelectItem key={item.value ?? "placeholder"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async (context) => {
    await Default.play?.(context);
    const smallControlHeights: Record<string, number> = { comfortable: 26, compact: 18 };
    await expect(
      within(context.canvasElement).getByRole("combobox", { name: "Runtime" }).getBoundingClientRect().height,
    ).toBe(smallControlHeights[context.globals.density]);
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await userEvent.keyboard("{Home}{ArrowDown}{Enter}");
    await expect(trigger).toHaveTextContent("Bun");
    await expect(args.onValueChange).toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Typeahead: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.tab();
    await userEvent.keyboard("d");
    await expect(trigger).toHaveTextContent("Deno");
  },
};
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: "bun" },
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.click(trigger);
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await userEvent.click(within(list).getByRole("option", { name: "Deno" }));
    await expect(trigger).toHaveTextContent("Bun");
    await userEvent.keyboard("{Escape}");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
export const CancelledSelection: Story = {
  args: {
    defaultValue: "bun",
    onValueChange: fn((_value: unknown, details: SelectRootChangeEventDetails) => details.cancel()),
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.click(trigger);
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await userEvent.click(within(list).getByRole("option", { name: "Deno" }));
    await expect(args.onValueChange).toHaveBeenCalled();
    await expect(trigger).toHaveTextContent("Bun");
    await userEvent.keyboard("{Escape}");
  },
};
export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | null>("bun");
    return (
      <Field>
        <Select<string> items={fixture_runtimes} value={value} onValueChange={setValue}>
          <SelectTrigger aria-label="Controlled runtime">
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
        <output aria-label="Current runtime">{value}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Controlled runtime" }));
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await userEvent.click(within(list).getByRole("option", { name: "Deno" }));
    await expect(canvas.getByRole("status", { name: "Current runtime" })).toHaveTextContent("deno");
  },
};
export const NativeCallbacks: Story = {
  args: {
    triggerClassName: (state) => (state.open ? "w-64" : "w-48"),
    valueClassName: (state) => (state.placeholder ? "flex-none w-20" : "flex-none w-32"),
    contentClassName: () => "p-4",
    groupClassName: () => "p-3",
    labelClassName: () => "h-8",
    itemClassName: (state) => (state.selected ? "h-12" : "h-8"),
    separatorClassName: (state) => (state.orientation === "horizontal" ? "h-2" : "w-2 h-8"),
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("combobox", { name: "Runtime" });
    await expect(trigger.getBoundingClientRect().width).toBe(192);
    await userEvent.click(trigger);
    const list = await body.findByRole("listbox");
    await expect(trigger.getBoundingClientRect().width).toBe(256);
    const group = within(list).getByRole("group", { name: "Runtime" });
    const item = within(group).getByRole("option", { name: "Bun" });
    await expect(item.getBoundingClientRect().left - group.getBoundingClientRect().left).toBe(12);
    await expect(group.getBoundingClientRect().left - list.getBoundingClientRect().left).toBe(0);
    await expect(
      list.getBoundingClientRect().left - (list.parentElement as HTMLElement).getBoundingClientRect().left,
    ).toBe(17);
    await expect(within(group).getByText("Runtime").getBoundingClientRect().height).toBe(32);
    await expect(within(group).getByTestId("Select--separator").getBoundingClientRect().height).toBe(8);
    await expect(item.getBoundingClientRect().height).toBe(32);
    await userEvent.click(item);
    await waitFor(() =>
      expect((trigger.querySelector("[data-slot=select-value]") as HTMLElement).getBoundingClientRect().width).toBe(
        128,
      ),
    );
    await userEvent.click(trigger);
    const reopened = await body.findByRole("listbox");
    await expect(within(reopened).getByRole("option", { name: "Bun" }).getBoundingClientRect().height).toBe(48);
    await userEvent.keyboard("{Escape}");
  },
};
export const DisabledItem: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Runtime">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {fixture_runtimes.map((item) => (
            <SelectItem key={item.value ?? "placeholder"} value={item.value} disabled={item.value === "node"}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(within(list).getByRole("option", { name: "Deno" })).toHaveFocus());
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(within(list).getByRole("option", { name: "Node.js" })).toHaveFocus());
    await expect(within(list).getByRole("option", { name: "Node.js" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveTextContent("Select a runtime");
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect(trigger).toHaveTextContent("Bun");
  },
};
export const Invalid: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <Field data-invalid>
        <FieldLabel htmlFor={id}>Runtime</FieldLabel>
        <Select {...args}>
          <SelectTrigger id={id} aria-invalid aria-describedby={`${id}-error`} aria-errormessage={`${id}-error`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {fixture_runtimes
                .filter((item) => !args.multiple || item.value !== null)
                .map((item) => (
                  <SelectItem key={item.value ?? "placeholder"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldError id={`${id}-error`}>Choose a runtime.</FieldError>
      </Field>
    );
  },
  play: async (context) => {
    const trigger = within(context.canvasElement).getByRole("combobox", { name: "Runtime" });
    await expect(trigger).toHaveAccessibleDescription("Choose a runtime.");
    await expect(trigger).toHaveAccessibleErrorMessage("Choose a runtime.");
    await expect(trigger).toHaveAttribute("aria-invalid", "true");
    await Default.play?.(context);
  },
};
export const NativeRenderAndRef: Story = {
  render: function Render() {
    const ref = useRef<HTMLButtonElement>(null);
    return (
      <Field>
        <Select items={fixture_runtimes}>
          <SelectTrigger aria-label="Runtime" render={<button data-testid="Select--native-trigger" />} ref={ref}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent render={<section data-testid="Select--native-popup" />}>
            <SelectGroup>
              {fixture_runtimes.map((item) => (
                <SelectItem key={item.value ?? "placeholder"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button onClick={() => ref.current?.focus()}>Focus runtime ref</Button>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Focus runtime ref" }));
    await expect(canvas.getByTestId("Select--native-trigger")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(await body.findByTestId("Select--native-popup")).toBeVisible();
    await userEvent.keyboard("{Escape}");
  },
};
export const ObjectValues: Story = {
  render: function Render() {
    const [value, setValue] = useState<RuntimeEngine | null>({ id: "bun", name: "Bun" });
    return (
      <form aria-label="Object engine form">
        <Field>
          <Select<RuntimeEngine>
            name="engine"
            value={value}
            onValueChange={setValue}
            itemToStringLabel={(engine) => engine.name}
            itemToStringValue={(engine) => engine.id}
            isItemEqualToValue={(item, current) => item.id === current.id}
          >
            <SelectTrigger aria-label="Object runtime">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {fixture_runtimeEngines.map((engine) => (
                  <SelectItem key={engine.id} value={engine}>
                    {engine.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <output aria-label="Selected engine">{value?.id}</output>
        </Field>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("combobox", { name: "Object runtime" });
    await expect(trigger).toHaveTextContent("Bun");
    await userEvent.click(trigger);
    const list = await body.findByRole("listbox");
    await expect(within(list).getByRole("option", { name: "Bun" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(within(list).getByRole("option", { name: "Deno" }));
    await expect(canvas.getByRole("status", { name: "Selected engine" })).toHaveTextContent("deno");
    await expect(
      new FormData(canvas.getByRole("form", { name: "Object engine form" }) as HTMLFormElement).get("engine"),
    ).toBe("deno");
  },
};
export const CompactPortal: Story = {
  render: (args) => (
    <DensityProvider density="compact">
      <Select {...args}>
        <SelectTrigger aria-label="Runtime">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {fixture_runtimes.map((item) => (
              <SelectItem key={item.value ?? "placeholder"} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </DensityProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await expect(trigger.getBoundingClientRect().height).toBe(20);
    await userEvent.click(trigger);
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    const item = within(list).getByRole("option", { name: "Bun" });
    await expect(getComputedStyle(item).fontSize).toBe("12px");
    await expect(list.parentElement).toHaveAttribute("data-density", "compact");
    await userEvent.click(item);
    await expect(trigger).toHaveTextContent("Bun");
  },
};
export const RTL: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <Select {...args} defaultValue="bun">
          <SelectTrigger aria-label="Runtime">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {fixture_runtimes.map((item) => (
                <SelectItem key={item.value ?? "placeholder"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.click(trigger);
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    const selected = within(list).getByRole("option", { name: "Bun" });
    const text = within(selected).getByText("Bun"),
      indicator = selected.querySelector("[data-selected]") as HTMLElement;
    await expect(indicator.getBoundingClientRect().right).toBeLessThanOrEqual(text.getBoundingClientRect().left);
    await waitFor(() => expect(selected).toHaveFocus());
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(within(list).getByRole("option", { name: "Deno" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveTextContent("Deno");
  },
};
export const Scrollable: Story = {
  render: (args) => (
    <Select {...args} items={fixture_projectNumbers} defaultValue={10}>
      <SelectTrigger aria-label="Project number">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-48" alignItemWithTrigger={false}>
        <SelectGroup>
          {fixture_projectNumbers.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Project number" });
    await userEvent.click(trigger);
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await waitFor(() => expect(within(list).getByRole("option", { name: "Project 10" })).toHaveFocus());
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(within(list).getByRole("option", { name: "Project 39" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveTextContent("Project 39");
  },
};
export const ScrollCallbacks: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Runtime">
        <SelectValue />
      </SelectTrigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner alignItemWithTrigger={false}>
          <SelectPrimitive.Popup>
            <SelectScrollUpButton keepMounted className={() => "h-10"} data-testid="Select--scroll-up" />
            <SelectPrimitive.List>
              <SelectGroup>
                {fixture_runtimes.map((item) => (
                  <SelectItem key={item.value ?? "placeholder"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectPrimitive.List>
            <SelectScrollDownButton keepMounted className={() => "h-10"} data-testid="Select--scroll-down" />
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </Select>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole("combobox", { name: "Runtime" }));
    await body.findByRole("listbox");
    await expect(body.getByTestId("Select--scroll-up").getBoundingClientRect().height).toBe(40);
    await expect(body.getByTestId("Select--scroll-down").getBoundingClientRect().height).toBe(40);
    await userEvent.keyboard("{Escape}");
  },
};
export const FormSubmissionAndReset: Story = {
  render: function Render() {
    const [runtime, setRuntime] = useState<string | null>(null);
    const [runtimes, setRuntimes] = useState<string[]>(["bun"]);
    const [result, setResult] = useState("");
    const id = useId();
    return (
      <form
        aria-label="Runtime form"
        onReset={() => {
          setRuntime(null);
          setRuntimes(["bun"]);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setResult(
            JSON.stringify({
              runtime: data.get("runtime"),
              runtimes: data.getAll("runtimes"),
              omitted: data.get("omitted"),
            }),
          );
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={id}>Required runtime</FieldLabel>
            <Select<string>
              id={id}
              name="runtime"
              required
              value={runtime}
              onValueChange={setRuntime}
              items={fixture_runtimes}
            >
              <SelectTrigger>
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
          <Select<string, true>
            name="runtimes"
            multiple
            value={runtimes}
            onValueChange={setRuntimes}
            items={fixture_runtimes}
          >
            <SelectTrigger aria-label="Supported runtimes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {fixture_runtimes
                  .filter((item) => item.value !== null)
                  .map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select name="omitted" disabled defaultValue="deno" items={fixture_runtimes}>
            <SelectTrigger aria-label="Disabled runtime">
              <SelectValue />
            </SelectTrigger>
          </Select>
          <Button type="submit">Save runtimes</Button>
          <Button type="reset">Reset runtimes</Button>
          <output aria-label="Saved runtimes">{result}</output>
        </FieldGroup>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const form = canvas.getByRole("form", { name: "Runtime form" }) as HTMLFormElement;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByRole("combobox", { name: "Required runtime" }));
    let list = await body.findByRole("listbox");
    await userEvent.click(within(list).getByRole("option", { name: "Deno" }));
    await waitFor(() => expect(list).not.toBeVisible());
    await waitFor(() => expect(canvas.getByRole("combobox", { name: "Required runtime" })).toHaveFocus());
    await expect(form.checkValidity()).toBe(true);
    await userEvent.click(canvas.getByRole("combobox", { name: "Supported runtimes" }));
    list = await body.findByRole("listbox");
    await userEvent.click(within(list).getByRole("option", { name: "Node.js" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(list).not.toBeVisible());
    await waitFor(() => expect(canvas.getByRole("combobox", { name: "Supported runtimes" })).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Save runtimes" }));
    await expect(canvas.getByRole("status", { name: "Saved runtimes" })).toHaveTextContent(
      '{"runtime":"deno","runtimes":["bun","node"],"omitted":null}',
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reset runtimes" }));
    await expect(canvas.getByRole("combobox", { name: "Required runtime" })).toHaveTextContent("Select a runtime");
    await expect(canvas.getByRole("combobox", { name: "Supported runtimes" })).toHaveTextContent("Bun");
    await expect(form.checkValidity()).toBe(false);
  },
};

export const CancelledOpening: Story = {
  args: { onOpenChange: fn((_open: boolean, details: SelectRootChangeEventDetails) => details.cancel()) },
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(args.onOpenChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: "trigger-press" })),
    );
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(within(canvasElement.ownerDocument.body).queryByRole("listbox")).not.toBeInTheDocument();
  },
};
export const ControlledOpening: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Field>
        <Button onClick={() => setIsOpen(true)}>Open runtime choices</Button>
        <Select open={isOpen} onOpenChange={setIsOpen} items={fixture_runtimes}>
          <SelectTrigger aria-label="Controlled popup">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {fixture_runtimes.map((item) => (
                <SelectItem key={item.value ?? "placeholder"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <output aria-label="Popup state">{String(isOpen)}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Open runtime choices" }));
    const list = await body.findByRole("listbox");
    await expect(canvas.getByRole("status", { name: "Popup state" })).toHaveTextContent("true");
    await userEvent.click(within(list).getByRole("option", { name: "Deno" }));
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Popup state" })).toHaveTextContent("false");
    await expect(canvas.getByRole("combobox", { name: "Controlled popup" })).toHaveTextContent("Deno");
  },
};
export const Grouped: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Runtime">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>Primary runtimes</SelectLabel>
          <SelectItem value="bun">Bun</SelectItem>
          <SelectItem value="node">Node.js</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Alternative runtimes</SelectLabel>
          <SelectItem value="deno">Deno</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.click(trigger);
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await waitFor(() => expect(within(list).getByRole("group", { name: "Primary runtimes" })).toBeVisible());
    const alternatives = within(list).getByRole("group", { name: "Alternative runtimes" });
    await userEvent.click(within(alternatives).getByRole("option", { name: "Deno" }));
    await expect(trigger).toHaveTextContent("Deno");
  },
};

export const AlignedItem: Story = {
  args: { defaultValue: "node", triggerClassName: "w-64" },
  decorators: [
    (Story) => (
      <div className="py-40">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.click(trigger);
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    const selected = within(list).getByRole("option", { name: "Node.js" });
    await waitFor(() => expect(selected).toHaveFocus());
    await waitFor(() => {
      const selectedBounds = within(selected).getByText("Node.js").getBoundingClientRect();
      const valueBounds = (trigger.querySelector('[data-slot="select-value"]') as HTMLElement).getBoundingClientRect();
      const popup = list.closest('[data-slot="select-content"]') as HTMLElement;
      const border = parseFloat(getComputedStyle(popup).borderBottomWidth);
      expect(
        Math.abs((selectedBounds.top + selectedBounds.bottom - valueBounds.top - valueBounds.bottom) / 2),
      ).toBeLessThanOrEqual(border);
    });
    await userEvent.keyboard("{End}{Enter}");
    await expect(trigger).toHaveTextContent("Deno");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const RightToLeftAlignedItem: Story = {
  ...AlignedItem,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl" className="py-40">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
};

export const EdgeAligned: Story = {
  args: { defaultValue: "node" },
  decorators: AlignedItem.decorators,
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Runtime">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {fixture_runtimes.map((item) => (
            <SelectItem key={item.value ?? "placeholder"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await userEvent.click(trigger);
    const list = await within(canvasElement.ownerDocument.body).findByRole("listbox");
    const popup = list.closest('[data-slot="select-content"]') as HTMLElement;
    await waitFor(() =>
      expect(popup.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(3),
    );
    await userEvent.click(within(list).getByRole("option", { name: "Bun" }));
    await expect(trigger).toHaveTextContent("Bun");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const RightToLeftInvalid: Story = {
  ...Invalid,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
};
