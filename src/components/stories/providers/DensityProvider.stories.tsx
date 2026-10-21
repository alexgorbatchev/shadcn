import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DensityProvider } from "../../DensityProvider";
import { Button } from "../../Button";
import { Field, FieldLabel } from "../../Field";
import { Input } from "../../Input";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "../../Popover";
import { DensityValueExample } from "../helpers";
import type { Density } from "../../../density/types";

const meta: Meta<typeof DensityProvider> = {
  title: "@alexgorbatchev/shadcn/components/providers/DensityProvider",
  component: DensityProvider,
  tags: ["autodocs", "test"],
  args: { density: "comfortable" },
  render: (args) => {
    const storyId = useId();
    return (
      <DensityProvider {...args}>
        <DensityValueExample />
        <Field>
          <FieldLabel htmlFor={storyId}>Name</FieldLabel>
          <Input id={storyId} placeholder="Your name" />
        </Field>
        <div className="mt-4 flex gap-2">
          <Button>Save</Button>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>Details</PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Density follows the provider through portals.</PopoverTitle>
              <DensityValueExample />
              <Button>Continue</Button>
            </PopoverContent>
          </Popover>
        </div>
      </DensityProvider>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Comfortable: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("textbox", { name: "Name" });
    const save = canvas.getByRole("button", { name: "Save" });
    await expect(canvas.getByRole("status", { name: "Density" })).toHaveTextContent(args.density ?? "comfortable");
    await expect(input.getBoundingClientRect().height).toBe(save.getBoundingClientRect().height);
    await userEvent.type(input, "Alex");
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    const dialog = await body.findByRole("dialog", { name: "Density follows the provider through portals." });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(dialog).toHaveAttribute("data-density", args.density ?? "comfortable");
    await expect(within(dialog).getByRole("status", { name: "Density" })).toHaveTextContent(
      args.density ?? "comfortable",
    );
    await expect(within(dialog).getByRole("button", { name: "Continue" }).getBoundingClientRect().height).toBe(
      save.getBoundingClientRect().height,
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Details" })).toHaveFocus());
    await expect(input).toHaveValue("Alex");
  },
};
export const Compact: Story = { ...Comfortable, args: { density: "compact" } };
export const DefaultDensity: Story = { ...Comfortable, args: { density: undefined } };
export const Mixed: Story = {
  render: () => (
    <DensityProvider density="comfortable">
      <div className="flex flex-col gap-4">
        <Button>Comfortable provider</Button>
        <Button density="compact">Compact override</Button>
        <DensityProvider density="compact">
          <Button>Nested compact provider</Button>
          <DensityValueExample />
          <DensityValueExample density="comfortable" label="Explicit density" />
        </DensityProvider>
        <Button>After nested provider</Button>
      </div>
    </DensityProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const comfortable = canvas.getByRole("button", { name: "Comfortable provider" });
    const override = canvas.getByRole("button", { name: "Compact override" });
    const nested = canvas.getByRole("button", { name: "Nested compact provider" });
    await expect(comfortable.getBoundingClientRect().height).toBeGreaterThan(nested.getBoundingClientRect().height);
    await expect(override.getBoundingClientRect().height).toBe(nested.getBoundingClientRect().height);
    await expect(canvas.getByRole("button", { name: "After nested provider" }).getBoundingClientRect().height).toBe(
      comfortable.getBoundingClientRect().height,
    );
    await expect(canvas.getByRole("status", { name: "Density" })).toHaveTextContent("compact");
    await expect(canvas.getByRole("status", { name: "Explicit density" })).toHaveTextContent("comfortable");
  },
};
export const Dynamic: Story = {
  render: () => {
    const [density, setDensity] = useState<Density>("comfortable");
    return (
      <DensityProvider density={density}>
        <DensityValueExample />
        <Input aria-label="Persistent name" />
        <Popover>
          <PopoverTrigger render={<Button />}>Density details</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Live density</PopoverTitle>
            <DensityValueExample />
            <Button onClick={() => setDensity("compact")}>Use compact</Button>
            <Button onClick={() => setDensity("comfortable")}>Use comfortable</Button>
          </PopoverContent>
        </Popover>
      </DensityProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("textbox", { name: "Persistent name" });
    await userEvent.type(input, "Alex");
    const initialHeight = input.getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole("button", { name: "Density details" }));
    const dialog = await body.findByRole("dialog", { name: "Live density" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Use compact" }));
    await expect(dialog).toHaveAttribute("data-density", "compact");
    await expect(within(dialog).getByRole("status", { name: "Density" })).toHaveTextContent("compact");
    await expect(input.getBoundingClientRect().height).toBeLessThan(initialHeight);
    await expect(within(dialog).getByRole("button", { name: "Use compact" }).getBoundingClientRect().height).toBe(
      input.getBoundingClientRect().height,
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Use comfortable" }));
    await expect(dialog).toHaveAttribute("data-density", "comfortable");
    await expect(input.getBoundingClientRect().height).toBe(initialHeight);
    await expect(input).toHaveValue("Alex");
  },
};
export const PortalOverride: Story = {
  render: () => (
    <DensityProvider density="compact">
      <Button>Compact control</Button>
      <Popover>
        <PopoverTrigger render={<Button />}>Override details</PopoverTrigger>
        <PopoverContent density="comfortable">
          <PopoverTitle>Explicit portal density</PopoverTitle>
          <Button>Comfortable control</Button>
        </PopoverContent>
      </Popover>
    </DensityProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const compact = canvas.getByRole("button", { name: "Compact control" });
    await userEvent.click(canvas.getByRole("button", { name: "Override details" }));
    const dialog = await body.findByRole("dialog", { name: "Explicit portal density" });
    await expect(dialog).toHaveAttribute("data-density", "comfortable");
    await expect(
      within(dialog).getByRole("button", { name: "Comfortable control" }).getBoundingClientRect().height,
    ).toBeGreaterThan(compact.getBoundingClientRect().height);
  },
};
