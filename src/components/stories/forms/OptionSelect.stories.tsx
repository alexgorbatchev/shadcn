import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../Button";
import { OptionSelect } from "../../OptionSelect";

const onValueChange = fn();
const options = [
  { value: "", label: "Not set" },
  { value: "bun", label: "Bun" },
  { value: "node", label: "Node.js" },
  { value: "deno", label: "Deno", disabled: true },
];

const meta: Meta<typeof OptionSelect> = {
  title: "@alexgorbatchev/shadcn/components/forms/OptionSelect",
  component: OptionSelect,
  tags: ["autodocs", "test"],
  args: { options, defaultValue: "bun", "aria-label": "Runtime", onValueChange },
};

export default meta;

type Story = StoryObj<typeof OptionSelect>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("combobox", { name: "Runtime" });
    await expect(trigger).toHaveTextContent("Bun");
    await userEvent.click(trigger);
    await expect(await body.findByRole("option", { name: "Deno" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(await body.findByRole("option", { name: "Node.js" }));
    await waitFor(() => expect(trigger).toHaveTextContent("Node.js"));
    await expect(onValueChange).toHaveBeenCalledWith("node");
  },
};

export const EmptyStringIsAnOption: Story = {
  args: { defaultValue: "" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("combobox", { name: "Runtime" });
    await expect(trigger).toHaveTextContent("Not set");
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("option", { name: "Bun" }));
    await waitFor(() => expect(trigger).toHaveTextContent("Bun"));
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("option", { name: "Not set" }));
    await waitFor(() => expect(trigger).toHaveTextContent("Not set"));
    await expect(onValueChange).toHaveBeenLastCalledWith("");
  },
};

export const Placeholder: Story = {
  args: { defaultValue: undefined, options: options.slice(1), placeholder: "Pick a runtime" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox", { name: "Runtime" })).toHaveTextContent("Pick a runtime");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox", { name: "Runtime" })).toBeDisabled();
  },
};

function ControlledExample() {
  const [value, setValue] = useState("bun");
  return (
    <>
      <OptionSelect aria-label="Runtime" options={options} value={value} onValueChange={setValue} />
      <Button onClick={() => setValue("node")}>Use Node.js</Button>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Use Node.js" }));
    await expect(canvas.getByRole("combobox", { name: "Runtime" })).toHaveTextContent("Node.js");
  },
};

const onSubmit = fn();

export const SubmitsWithAForm: Story = {
  render: (args) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget).get("runtime"));
      }}
    >
      <OptionSelect {...args} name="runtime" />
      <Button type="submit">Save</Button>
    </form>
  ),
  args: { defaultValue: "" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(onSubmit).toHaveBeenLastCalledWith("");
    await userEvent.click(canvas.getByRole("combobox", { name: "Runtime" }));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("option", { name: "Bun" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(onSubmit).toHaveBeenLastCalledWith("bun");
  },
};

export const FullWidth: Story = {
  args: { width: "full" },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Runtime" });
    await expect(trigger.getBoundingClientRect().width).toEqual(384);
  },
};
