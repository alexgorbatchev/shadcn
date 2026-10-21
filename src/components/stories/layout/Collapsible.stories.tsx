import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, spyOn, userEvent, waitFor, within } from "storybook/test";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../Collapsible";
import { Button } from "../../Button";
import { useId, useState } from "react";
import { ChevronDownIcon, FolderIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Card";
import { Field, FieldGroup, FieldLabel } from "../../Field";
import { Input } from "../../Input";

const meta: Meta<typeof Collapsible> = {
  title: "@alexgorbatchev/shadcn/components/layout/Collapsible",
  component: Collapsible,
  tags: ["autodocs", "test"],
  args: { onOpenChange: fn() },
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleTrigger render={<Button variant="outline" />}>Shipping details</CollapsibleTrigger>
      <CollapsibleContent>Delivery takes 3–5 business days.</CollapsibleContent>
    </Collapsible>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Closed: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Shipping details" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await expect(await canvas.findByText("Delivery takes 3–5 business days.")).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  },
};
export const Open: Story = {
  args: { defaultOpen: true },
  beforeEach: () => {
    const warnings = spyOn(console, "warn");
    return () => warnings.mockRestore();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Delivery takes 3–5 business days.")).toBeVisible();
    const trigger = canvas.getByRole("button", { name: "Shipping details" });
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.queryByText("Delivery takes 3–5 business days.")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(await canvas.findByText("Delivery takes 3–5 business days.")).toBeVisible();
    await expect(console.warn).not.toHaveBeenCalled();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Shipping details" });
    await expect(trigger).toBeDisabled();
    await userEvent.tab();
    await expect(trigger).not.toHaveFocus();
    await userEvent.keyboard("{Enter} ");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const Basic: Story = {
  render: (args) => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Product</CardTitle>
        <CardDescription>Inspect the product details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible {...args}>
          <CollapsibleTrigger render={<Button variant="outline" className="w-full justify-between" />}>
            <span>Product details</span>
            <ChevronDownIcon aria-hidden="true" data-icon="inline-end" />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col items-start gap-2 py-2">
            <p>Delivery includes installation.</p>
            <Button variant="outline">Learn more</Button>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Product details" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(await canvas.findByText("Delivery includes installation.")).toBeVisible();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Learn more" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await userEvent.keyboard(" ");
    await waitFor(() => expect(canvas.queryByText("Delivery includes installation.")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const Controlled: Story = {
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="flex flex-col gap-2">
        <Button onClick={() => setIsOpen(!isOpen)}>Change disclosure state</Button>
        <Collapsible {...args} open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger render={<Button variant="outline" />}>Shipping details</CollapsibleTrigger>
          <CollapsibleContent>Delivery takes 3–5 business days.</CollapsibleContent>
        </Collapsible>
        <output aria-label="Disclosure state">{String(isOpen)}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Shipping details" });
    await userEvent.click(canvas.getByRole("button", { name: "Change disclosure state" }));
    await expect(await canvas.findByText("Delivery takes 3–5 business days.")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.queryByText("Delivery takes 3–5 business days.")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Disclosure state" })).toHaveTextContent("false");
  },
};
export const Settings: Story = {
  render: function Render() {
    const id = useId();
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Corner radius</CardTitle>
          <CardDescription>Adjust individual corners.</CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex items-start gap-2">
            <FieldGroup className="grid w-full grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor={`${id}-top-left`}>Top left</FieldLabel>
                <Input id={`${id}-top-left`} type="number" defaultValue={0} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-top-right`}>Top right</FieldLabel>
                <Input id={`${id}-top-right`} type="number" defaultValue={0} />
              </Field>
              <CollapsibleContent className="col-span-full grid grid-cols-subgrid gap-2">
                <Field>
                  <FieldLabel htmlFor={`${id}-bottom-left`}>Bottom left</FieldLabel>
                  <Input id={`${id}-bottom-left`} type="number" defaultValue={0} />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-bottom-right`}>Bottom right</FieldLabel>
                  <Input id={`${id}-bottom-right`} type="number" defaultValue={0} />
                </Field>
              </CollapsibleContent>
            </FieldGroup>
            <CollapsibleTrigger
              render={<Button variant="outline" size="icon" />}
              aria-label="Toggle individual corners"
            >
              <ChevronDownIcon aria-hidden="true" />
            </CollapsibleTrigger>
          </Collapsible>
        </CardContent>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("spinbutton")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle individual corners" }));
    const bottom = await canvas.findByRole("spinbutton", { name: "Bottom left" });
    await expect(canvas.getAllByRole("spinbutton")).toHaveLength(4);
    await expect(new Set(canvas.getAllByRole("spinbutton").map((input) => input.id)).size).toBe(4);
    await userEvent.clear(bottom);
    await userEvent.type(bottom, "8");
    await expect(bottom).toHaveValue(8);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle individual corners" }));
    await waitFor(() => expect(canvas.queryByRole("spinbutton", { name: "Bottom left" })).not.toBeInTheDocument());
  },
};
export const FileTree: Story = {
  render: function Render() {
    const [selected, setSelected] = useState("");
    return (
      <div className="flex w-80 flex-col gap-2">
        <ul aria-label="Project files">
          <li>
            <Collapsible>
              <CollapsibleTrigger render={<Button variant="outline" />}>
                <FolderIcon aria-hidden="true" data-icon="inline-start" />
                components
              </CollapsibleTrigger>
              <CollapsibleContent className="ms-4">
                <ul>
                  <li>
                    <Collapsible>
                      <CollapsibleTrigger render={<Button variant="outline" />}>
                        <FolderIcon aria-hidden="true" data-icon="inline-start" />
                        ui
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ms-4">
                        <ul>
                          <li>
                            <Button variant="ghost" onClick={() => setSelected("Button.tsx")}>
                              Button.tsx
                            </Button>
                          </li>
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </li>
        </ul>
        <output aria-label="Selected file">{selected}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const components = canvas.getByRole("button", { name: "components" });
    await userEvent.click(components);
    const ui = await canvas.findByRole("button", { name: "ui" });
    await userEvent.click(ui);
    const file = await canvas.findByRole("button", { name: "Button.tsx" });
    await userEvent.tab();
    await expect(file).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Selected file" })).toHaveTextContent("Button.tsx");
    await userEvent.click(components);
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Button.tsx" })).not.toBeInTheDocument());
    await expect(components).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const reopenedUi = await canvas.findByRole("button", { name: "ui" });
    await expect(reopenedUi).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("button", { name: "Button.tsx" })).not.toBeInTheDocument();
    await userEvent.click(reopenedUi);
    await expect(await canvas.findByRole("button", { name: "Button.tsx" })).toBeVisible();
  },
};
export const RightToLeft: Story = {
  ...Basic,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  play: async (context) => {
    const trigger = within(context.canvasElement).getByRole("button", { name: "Product details" });
    const icon = trigger.querySelector("svg") as SVGElement;
    await expect(icon.getBoundingClientRect().right).toBeLessThan(
      within(trigger).getByText("Product details").getBoundingClientRect().left,
    );
    await Basic.play?.(context);
  },
};
