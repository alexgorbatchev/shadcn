import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComboboxRootChangeEventDetails } from "@base-ui/react/combobox";
import { useId, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
} from "../Combobox";
import { ComboboxMultipleExample } from "./helpers";
import { fixture_technologies, fixture_technologyGroups, fixture_runtimeEngines } from "./fixtures";
import type { TechnologyGroup, RuntimeEngine } from "./fixtures/types";
import { Button } from "../Button";
import { DensityProvider } from "../DensityProvider";
import { DirectionProvider } from "../DirectionProvider";
import { Input } from "../Input";
import { InputGroupAddon } from "../InputGroup";
import { Field, FieldError, FieldLabel, FieldGroup } from "../Field";
import { Item, ItemContent, ItemTitle, ItemDescription } from "../Item";

type ComboboxStoryProps = ComponentProps<typeof Combobox> & {
  inputClassName?: ComponentProps<typeof ComboboxInput>["className"];
  inputRef?: ComponentProps<typeof ComboboxInput>["ref"];
  contentClassName?: ComponentProps<typeof ComboboxContent>["className"];
  listClassName?: ComponentProps<typeof ComboboxList>["className"];
  groupClassName?: ComponentProps<typeof ComboboxGroup>["className"];
  labelClassName?: ComponentProps<typeof ComboboxLabel>["className"];
  itemClassName?: ComponentProps<typeof ComboboxItem>["className"];
  separatorClassName?: ComponentProps<typeof ComboboxSeparator>["className"];
  triggerClassName?: ComponentProps<typeof ComboboxTrigger>["className"];
  chipsClassName?: ComponentProps<typeof ComboboxChips>["className"];
  chipClassName?: ComponentProps<typeof ComboboxChip>["className"];
  chipsInputClassName?: ComponentProps<typeof ComboboxChipsInput>["className"];
  emptyClassName?: ComponentProps<typeof ComboboxEmpty>["className"];
};
const meta: Meta<ComboboxStoryProps> = {
  title: "shadcn-alexgorbatchev/components/Combobox",
  component: Combobox,
  tags: ["autodocs", "test"],
  args: { items: fixture_technologies, onValueChange: fn(), onOpenChange: fn(), onInputValueChange: fn() },
  render: ({
    inputClassName,
    inputRef,
    contentClassName,
    listClassName,
    groupClassName,
    labelClassName,
    itemClassName,
    separatorClassName,
    emptyClassName,
    triggerClassName: _triggerClassName,
    chipsClassName: _chipsClassName,
    chipClassName: _chipClassName,
    chipsInputClassName: _chipsInputClassName,
    ...args
  }) => (
    <Combobox {...args}>
      <ComboboxInput
        aria-label="Technology"
        placeholder="Search technologies"
        showClear
        className={inputClassName}
        ref={inputRef}
      />
      <ComboboxContent className={contentClassName}>
        <ComboboxEmpty className={emptyClassName}>No technology found.</ComboboxEmpty>
        <ComboboxList className={listClassName}>
          <ComboboxGroup className={groupClassName}>
            <ComboboxLabel className={labelClassName}>Technologies</ComboboxLabel>
            <ComboboxCollection>
              {(item: string) => (
                <ComboboxItem key={item} value={item} className={itemClassName}>
                  <span>{item}</span>
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
          <ComboboxSeparator className={separatorClassName} data-testid="Combobox--separator" />
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("combobox", { name: "Technology" });
    await userEvent.click(input);
    const list = await body.findByRole("listbox");
    await waitFor(() => expect(within(list).getByRole("option", { name: "Bun" })).toBeVisible());
    await userEvent.click(within(list).getByRole("option", { name: "Bun" }));
    await expect(input).toHaveValue("Bun");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("Bun", expect.objectContaining({ reason: "item-press" }));
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));
    await expect(input).toHaveFocus();
    await waitFor(() => expect(list).not.toBeVisible());
  },
};
export const Selected: Story = {
  args: { defaultValue: "Bun" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Technology" });
    await expect(input).toHaveValue("Bun");
    await userEvent.click(canvas.getByRole("button", { name: "Clear selection" }));
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null, expect.objectContaining({ reason: "clear-press" }));
  },
};
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Bun" },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Technology" });
    await expect(input).toBeDisabled();
    await expect(within(canvasElement).getByRole("button", { name: "Clear selection" })).toBeDisabled();
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};
export const Multiple: Story = {
  render: (args) => <ComboboxMultipleExample onValueChange={args.onValueChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("combobox", { name: "Technologies" });
    await userEvent.type(input, "Type");
    const list = await body.findByRole("listbox");
    await userEvent.click(within(list).getByRole("option", { name: "TypeScript" }));
    await expect(canvas.getByText("TypeScript")).toBeVisible();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ["Bun", "React", "TypeScript"],
      expect.objectContaining({ reason: "item-press" }),
    );
    await userEvent.click(within(canvas.getByText("Bun")).getByRole("button", { name: "Remove item" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ["React", "TypeScript"],
      expect.objectContaining({ reason: "chip-remove-press" }),
    );
    await expect(canvas.queryByText("Bun")).not.toBeInTheDocument();
    await expect(input).toHaveFocus();
  },
};
export const Filtering: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("combobox", { name: "Technology" });
    await userEvent.type(input, "Deno");
    const list = await body.findByRole("listbox");
    await expect(within(list).getAllByRole("option")).toHaveLength(1);
    await expect(within(list).getByRole("option", { name: "Deno" })).toBeVisible();
    await expect(args.onInputValueChange).toHaveBeenLastCalledWith(
      "Deno",
      expect.objectContaining({ reason: "input-change" }),
    );
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("Deno");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "Deno",
      expect.objectContaining({ reason: "item-press" }),
    );
  },
};
export const EmptySearch: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Technology" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(input);
    await body.findByRole("listbox");
    const status = body.getByRole("status");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toHaveTextContent("");
    await userEvent.type(input, "No matching technology");
    await expect(await body.findByText("No technology found.")).toBeVisible();
    await expect(status).toHaveTextContent("No technology found.");
    await userEvent.clear(input);
    await expect(status).toHaveTextContent("");
    await expect(body.getByRole("status")).toBe(status);
    await expect(body.getAllByRole("option")).toHaveLength(fixture_technologies.length);
  },
};
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Technology" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const list = await body.findByRole("listbox");
    await expect(input).toHaveAttribute("aria-activedescendant", within(list).getByRole("option", { name: "Bun" }).id);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("Node.js");
    await expect(input).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Escape}");
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));
    await expect(input).toHaveFocus();
  },
};
export const AutoHighlight: Story = {
  args: { autoHighlight: true },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Technology" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.type(input, "React");
    const option = await body.findByRole("option", { name: "React" });
    await expect(input).toHaveAttribute("aria-activedescendant", option.id);
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("React");
  },
};
export const CancelledSelection: Story = {
  args: {
    defaultValue: "Bun",
    onValueChange: fn((_value: unknown, details: ComboboxRootChangeEventDetails) => details.cancel()),
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Technology" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(input);
    await userEvent.click(await body.findByRole("option", { name: "Deno" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("Deno", expect.objectContaining({ reason: "item-press" }));
    await expect(input).toHaveValue("Bun");
  },
};
export const CancelledOpening: Story = {
  args: { onOpenChange: fn((_open: boolean, details: ComboboxRootChangeEventDetails) => details.cancel()) },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Technology" });
    await userEvent.click(input);
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalled());
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(within(canvasElement.ownerDocument.body).queryByRole("listbox")).not.toBeInTheDocument();
  },
};
export const InputStateCallback: Story = {
  args: { inputClassName: fn(() => "min-w-24"), inputRef: fn() },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Technology" });
    await expect(args.inputRef).toHaveBeenCalledWith(input);
    await userEvent.click(input);
    await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await expect(args.inputClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true, disabled: false }));
    await expect(Number.parseFloat(getComputedStyle(input).minWidth)).toBeGreaterThan(0);
  },
};
export const NativePartCallbacks: Story = {
  args: {
    contentClassName: fn(() => "min-w-64"),
    listClassName: fn(() => "p-2"),
    groupClassName: fn(() => "py-1"),
    labelClassName: fn(() => "py-2"),
    itemClassName: fn(() => "py-2"),
    separatorClassName: fn(() => "my-2"),
    emptyClassName: fn(() => ""),
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox", { name: "Technology" }));
    const body = within(canvasElement.ownerDocument.body),
      list = await body.findByRole("listbox");
    await expect(args.contentClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
    await expect(args.listClassName).toHaveBeenCalledWith(expect.objectContaining({ empty: false }));
    await expect(args.groupClassName).toHaveBeenCalled();
    await expect(args.labelClassName).toHaveBeenCalled();
    await expect(args.itemClassName).toHaveBeenCalledWith(expect.objectContaining({ disabled: false }));
    await expect(args.separatorClassName).toHaveBeenCalledWith(expect.objectContaining({ orientation: "horizontal" }));
    await expect(args.emptyClassName).toHaveBeenCalled();
    await expect(within(list).getByRole("option", { name: "Bun" }).getBoundingClientRect().height).toBeGreaterThan(24);
  },
};
export const Groups: Story = {
  render: (args) => (
    <Combobox items={fixture_technologyGroups} onValueChange={args.onValueChange}>
      <ComboboxInput aria-label="Grouped technology" />
      <ComboboxContent>
        <ComboboxEmpty>No technology found.</ComboboxEmpty>
        <ComboboxList>
          {(group: TechnologyGroup, index: number) => (
            <ComboboxGroup key={group.label} items={group.items}>
              <ComboboxLabel>{group.label}</ComboboxLabel>
              <ComboboxCollection>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
              {index === 0 && <ComboboxSeparator />}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Grouped technology" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(input);
    const list = await body.findByRole("listbox");
    await waitFor(() => expect(within(list).getByRole("group", { name: "Runtimes" })).toBeVisible());
    await waitFor(() => expect(within(list).getByRole("group", { name: "Tools" })).toBeVisible());
    await userEvent.type(input, "React");
    await expect(body.getAllByRole("option")).toHaveLength(1);
    await userEvent.click(body.getByRole("option", { name: "React" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "React",
      expect.objectContaining({ reason: "item-press" }),
    );
  },
};
export const ObjectItems: Story = {
  render: (args) => (
    <Combobox<RuntimeEngine>
      items={fixture_runtimeEngines}
      defaultValue={{ id: "bun", name: "Bun" }}
      itemToStringLabel={(item) => item.name}
      itemToStringValue={(item) => item.id}
      isItemEqualToValue={(item, value) => item.id === value.id}
      onValueChange={args.onValueChange}
    >
      <ComboboxInput aria-label="Runtime engine" />
      <ComboboxContent>
        <ComboboxList>
          {(item: RuntimeEngine) => (
            <ComboboxGroup key={item.id}>
              <ComboboxItem value={item}>{item.name}</ComboboxItem>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Runtime engine" });
    const body = within(canvasElement.ownerDocument.body);
    await expect(input).toHaveValue("Bun");
    await userEvent.click(input);
    await expect(await body.findByRole("option", { name: "Bun" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(body.getByRole("option", { name: "Deno" }));
    await expect(input).toHaveValue("Deno");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      fixture_runtimeEngines[2],
      expect.objectContaining({ reason: "item-press" }),
    );
  },
};
export const PopupInput: Story = {
  args: { triggerClassName: fn(() => "gap-4") },
  render: (args) => (
    <Combobox items={fixture_technologies} onValueChange={args.onValueChange}>
      <ComboboxTrigger
        aria-label="Choose technology"
        className={args.triggerClassName}
        render={<Button variant="outline" />}
      >
        <ComboboxValue placeholder="Choose technology" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput aria-label="Filter technologies" showTrigger={false} />
        <ComboboxEmpty>No technology found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxCollection>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Choose technology" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const input = await body.findByRole("combobox", { name: "Filter technologies" });
    await expect(args.triggerClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true, disabled: false }));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "Deno");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(trigger).toHaveTextContent("Deno");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "Deno",
      expect.objectContaining({ reason: "item-press" }),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(Number.parseFloat(getComputedStyle(trigger).gap)).toBeGreaterThan(0);
  },
};
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>("Bun");
    return (
      <div className="flex flex-col gap-4">
        <Combobox items={fixture_technologies} value={value} onValueChange={setValue}>
          <ComboboxInput aria-label="Controlled technology" showClear />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxGroup>
                <ComboboxCollection>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <output aria-label="Selected technology">{value ?? "none"}</output>
        <Button onClick={() => setValue("React")}>Set React</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Controlled technology" });
    await expect(input).toHaveValue("Bun");
    await userEvent.click(canvas.getByRole("button", { name: "Set React" }));
    await expect(input).toHaveValue("React");
    await expect(canvas.getByLabelText("Selected technology")).toHaveTextContent("React");
    await userEvent.click(canvas.getByRole("button", { name: "Clear selection" }));
    await expect(canvas.getByLabelText("Selected technology")).toHaveTextContent("none");
  },
};
export const InputAddon: Story = {
  render: () => (
    <Combobox items={fixture_technologies}>
      <ComboboxInput aria-label="Technology with addon" showTrigger={false}>
        <InputGroupAddon align="inline-start">Stack</InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxCollection>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Stack"));
    await expect(canvas.getByRole("combobox", { name: "Technology with addon" })).toHaveFocus();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const DensityAndDirection: Story = {
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <DensityProvider density="compact">
          <div dir="rtl">
            <Story />
          </div>
        </DensityProvider>
      </DirectionProvider>
    ),
  ],
  args: { defaultValue: "Bun" },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox", { name: "Technology" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(input);
    const option = await body.findByRole("option", { name: "Bun" });
    const popup = option.closest("[data-slot=combobox-content]");
    await expect(popup).toHaveAttribute("data-density", "compact");
    await expect(popup).toHaveAttribute("dir", "rtl");
    const label = within(option).getByText("Bun").getBoundingClientRect();
    await expect(option.querySelector("svg")?.getBoundingClientRect().right ?? Infinity).toBeLessThan(label.left);
    await expect(Number.parseFloat(getComputedStyle(option).fontSize)).toBeLessThan(14);
    await expect(getComputedStyle(popup as HTMLElement).animationName === "none").toBe(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  },
};

export const MultipleStateCallbacks: Story = {
  args: {
    chipsClassName: fn(() => "min-w-64"),
    chipClassName: fn(() => "px-2"),
    chipsInputClassName: fn(() => "min-w-24"),
  },
  render: (args) => (
    <Combobox<string, true>
      items={fixture_technologies}
      multiple
      defaultValue={["Bun", "React"]}
      onValueChange={args.onValueChange}
    >
      <ComboboxChips className={args.chipsClassName}>
        <ComboboxValue>
          {(values: string[]) =>
            values.map((value) => (
              <ComboboxChip key={value} className={args.chipClassName}>
                {value}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput aria-label="Selected technologies" className={args.chipsInputClassName} />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxCollection>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Selected technologies" });
    await expect(args.chipsClassName).toHaveBeenCalled();
    await expect(args.chipClassName).toHaveBeenCalledWith(expect.objectContaining({ disabled: false }));
    await userEvent.click(input);
    await expect(args.chipsInputClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
    await expect(Number.parseFloat(getComputedStyle(input).minWidth)).toBeGreaterThan(64);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));
    await userEvent.click(within(canvas.getByText("React")).getByRole("button", { name: "Remove item" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ["Bun"],
      expect.objectContaining({ reason: "chip-remove-press" }),
    );
  },
};
export const CompactMultiple: Story = {
  decorators: [
    (Story) => (
      <DensityProvider density="compact">
        <div className="w-96">
          <Story />
        </div>
      </DensityProvider>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-4">
      <ComboboxMultipleExample density="compact" />
      <Input aria-label="Reference control" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Technologies" });
    const chips = input.closest("[data-slot=combobox-chips]");
    await expect(chips).not.toBeNull();
    await expect(chips?.getBoundingClientRect().height).toBe(
      canvas.getByRole("textbox", { name: "Reference control" }).getBoundingClientRect().height,
    );
    await userEvent.type(input, "Deno");
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("option", { name: "Deno" })).toBeVisible();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByText("Deno")).toBeVisible();
  },
};
export const ComfortableMultiple: Story = {
  ...CompactMultiple,
  decorators: [
    (Story) => (
      <DensityProvider density="comfortable">
        <div className="w-96">
          <Story />
        </div>
      </DensityProvider>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-4">
      <ComboboxMultipleExample density="comfortable" />
      <Input aria-label="Reference control" />
    </div>
  ),
};

export const Invalid: Story = {
  render: function Render(args) {
    const id = useId();
    return (
      <Field data-invalid className="w-80">
        <FieldLabel htmlFor={id}>Technology</FieldLabel>
        <Combobox items={fixture_technologies} onValueChange={args.onValueChange}>
          <ComboboxInput id={id} aria-invalid aria-describedby={`${id}-error`} aria-errormessage={`${id}-error`} />
          <ComboboxContent>
            <ComboboxEmpty>No technology found.</ComboboxEmpty>
            <ComboboxList>
              <ComboboxGroup>
                <ComboboxCollection>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldError id={`${id}-error`}>Choose a technology.</FieldError>
      </Field>
    );
  },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const input = canvas.getByRole("combobox", { name: "Technology" });
    await expect(input).toHaveAccessibleErrorMessage("Choose a technology.");
    await expect(input).toHaveAccessibleDescription("Choose a technology.");
    await expect(getComputedStyle(canvas.getByText("Technology")).color).toBe(
      getComputedStyle(canvas.getByRole("alert")).color,
    );
    await Default.play?.(context);
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

export const CustomItems: Story = {
  render: (args) => (
    <Combobox<RuntimeEngine>
      items={fixture_runtimeEngines}
      defaultValue={fixture_runtimeEngines[0]}
      itemToStringLabel={(item) => item.name}
      itemToStringValue={(item) => item.id}
      onValueChange={args.onValueChange}
    >
      <ComboboxInput aria-label="Runtime engine" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxCollection>
              {(item: RuntimeEngine) => (
                <ComboboxItem key={item.id} value={item} aria-label={item.name}>
                  <Item size="xs" className="p-0">
                    <ItemContent>
                      <ItemTitle>{item.name}</ItemTitle>
                      <ItemDescription>Engine identifier: {item.id}</ItemDescription>
                    </ItemContent>
                  </Item>
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async (context) => {
    const input = within(context.canvasElement).getByRole("combobox", { name: "Runtime engine" });
    await userEvent.click(input);
    const list = await within(context.canvasElement.ownerDocument.body).findByRole("listbox");
    const description = within(await within(list).findByRole("option", { name: "Deno" })).getByText(
      "Engine identifier: deno",
    );
    await waitFor(() => expect(description).toBeVisible());
    await userEvent.clear(input);
    await userEvent.type(input, "Deno");
    await expect(within(list).getAllByRole("option")).toHaveLength(1);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("Deno");
    await expect(context.args.onValueChange).toHaveBeenLastCalledWith(
      fixture_runtimeEngines[2],
      expect.objectContaining({ reason: "item-press" }),
    );
  },
};

export const RightToLeftMultiple: Story = {
  ...Multiple,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl" className="w-96">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async (context) => {
    await Multiple.play?.(context);
    const canvas = within(context.canvasElement);
    const input = canvas.getByRole("combobox", { name: "Technologies" });
    const react = canvas.getByText("React");
    const typescript = canvas.getByText("TypeScript");
    await expect(react.getBoundingClientRect().left).toBeGreaterThan(typescript.getBoundingClientRect().left);
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(typescript).toHaveFocus());
    await userEvent.keyboard("{Delete}");
    await expect(canvas.queryByText("TypeScript")).not.toBeInTheDocument();
    await expect(react).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveFocus();
  },
};

export const FormSubmissionAndReset: Story = {
  render: function Render() {
    const id = useId();
    const [technology, setTechnology] = useState<string | null>(null);
    const [technologies, setTechnologies] = useState<string[]>(["Bun"]);
    const [result, setResult] = useState("");
    return (
      <form
        aria-label="Technology form"
        onReset={() => {
          setTechnology(null);
          setTechnologies(["Bun"]);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setResult(
            JSON.stringify({
              technology: data.get("technology"),
              technologies: data.getAll("technologies"),
              omitted: data.get("omitted"),
            }),
          );
        }}
      >
        <FieldGroup className="w-96">
          <Field>
            <FieldLabel htmlFor={id}>Required technology</FieldLabel>
            <Combobox<string>
              name="technology"
              required
              items={fixture_technologies}
              value={technology}
              onValueChange={setTechnology}
            >
              <ComboboxInput id={id} showClear />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxGroup>
                    <ComboboxCollection>
                      {(item: string) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                  </ComboboxGroup>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
          <Field>
            <ComboboxMultipleExample
              name="technologies"
              defaultValue={undefined}
              value={technologies}
              onValueChange={setTechnologies}
            />
          </Field>
          <Field>
            <Combobox name="omitted" items={fixture_technologies} defaultValue="Deno" disabled>
              <ComboboxInput aria-label="Disabled technology" />
            </Combobox>
          </Field>
          <Field orientation="horizontal">
            <Button type="submit">Save technologies</Button>
            <Button type="reset" variant="outline">
              Reset technologies
            </Button>
          </Field>
          <output aria-label="Saved technologies">{result}</output>
        </FieldGroup>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const form = canvas.getByRole("form", { name: "Technology form" }) as HTMLFormElement;
    const input = canvas.getByRole("combobox", { name: "Required technology" });
    await expect(form.checkValidity()).toBe(false);
    await userEvent.type(input, "Deno");
    await body.findByRole("option", { name: "Deno" });
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("Deno");
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));
    await expect(form.checkValidity()).toBe(true);
    const multiple = canvas.getByRole("combobox", { name: "Technologies" });
    await userEvent.type(multiple, "React");
    await userEvent.click(await body.findByRole("option", { name: "React" }));
    await expect(canvas.getByText("React")).toBeVisible();
    await userEvent.tab();
    await userEvent.click(canvas.getByRole("button", { name: "Save technologies" }));
    await expect(canvas.getByRole("status", { name: "Saved technologies" })).toHaveTextContent(
      '{"technology":"Deno","technologies":["Bun","React"],"omitted":null}',
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reset technologies" }));
    await expect(input).toHaveValue("");
    await expect(canvas.queryByText("React")).not.toBeInTheDocument();
    await expect(canvas.getByText("Bun")).toBeVisible();
    await expect(form.checkValidity()).toBe(false);
  },
};

export const RightToLeftForm: Story = {
  ...FormSubmissionAndReset,
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
