import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NativeSelect, NativeSelectOption, NativeSelectOptGroup } from "../../NativeSelect";
import { Button } from "../../Button";
import { Field, FieldGroup, FieldLabel, FieldError } from "../../Field";

const meta: Meta<typeof NativeSelect> = {
  title: "@alexgorbatchev/shadcn/components/forms/NativeSelect",
  component: NativeSelect,
  tags: ["autodocs", "test"],
  args: { "aria-label": "Runtime", defaultValue: "bun", onChange: fn() },
  argTypes: { size: { control: "select", options: ["default", "sm"] } },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOptGroup label="JavaScript">
        <NativeSelectOption value="bun">Bun</NativeSelectOption>
        <NativeSelectOption value="node">Node</NativeSelectOption>
        <NativeSelectOption value="deno" disabled>
          Deno
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: "Runtime" });
    await expect(select).toHaveValue("bun");
    await userEvent.selectOptions(select, "node");
    await expect(select).toHaveValue("node");
    await expect(args.onChange).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("option", { name: "Deno" })).toBeDisabled();
  },
};
export const Small: Story = { ...Default, args: { size: "sm" } };
export const Compact: Story = { ...Default, args: { density: "compact" } };
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByRole("combobox", { name: "Runtime" })).toBeDisabled();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  render: (args) => (
    <Field data-invalid>
      <FieldLabel htmlFor="invalid-runtime">Runtime</FieldLabel>
      <NativeSelect {...args} id="invalid-runtime" aria-invalid="true" aria-describedby="runtime-error">
        <NativeSelectOption value="bun">Bun</NativeSelectOption>
        <NativeSelectOption value="node">Node</NativeSelectOption>
      </NativeSelect>
      <FieldError id="runtime-error">Choose a supported runtime.</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("combobox", { name: "Runtime" })).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("combobox", { name: "Runtime" })).toHaveAccessibleDescription(
      "Choose a supported runtime.",
    );
    await expect(canvas.getByRole("alert")).toBeVisible();
  },
};
export const RightToLeft: Story = {
  args: { dir: "rtl" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: "Runtime" });
    const wrapper = select.closest('[data-slot="native-select-wrapper"]') as HTMLElement;
    const icon = wrapper.querySelector('[data-slot="native-select-icon"]') as SVGElement;
    await expect(getComputedStyle(wrapper).direction).toBe("rtl");
    await expect(icon.getBoundingClientRect().right).toBeLessThan(
      select.getBoundingClientRect().left + select.getBoundingClientRect().width / 2,
    );
    await expect(Number.parseFloat(getComputedStyle(select).paddingInlineEnd)).toBeGreaterThan(
      Number.parseFloat(getComputedStyle(select).paddingInlineStart),
    );
    await userEvent.selectOptions(select, "node");
    await expect(select).toHaveValue("node");
  },
};
const onSubmit = fn();
export const NativeForm: Story = {
  render: (args) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget).get("runtime"));
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="form-runtime">Runtime</FieldLabel>
          <NativeSelect {...args} id="form-runtime" name="runtime">
            <NativeSelectOption value="bun">Bun</NativeSelectOption>
            <NativeSelectOption value="node">Node</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field orientation="horizontal">
          <Button type="submit">Save runtime</Button>
          <Button type="reset" variant="outline">
            Reset runtime
          </Button>
        </Field>
      </FieldGroup>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: "Runtime" });
    await userEvent.selectOptions(select, "node");
    await userEvent.click(canvas.getByRole("button", { name: "Save runtime" }));
    await expect(onSubmit).toHaveBeenCalledWith("node");
    await userEvent.click(canvas.getByRole("button", { name: "Reset runtime" }));
    await expect(select).toHaveValue("bun");
  },
};
