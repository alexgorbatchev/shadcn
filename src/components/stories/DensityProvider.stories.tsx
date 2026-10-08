import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DensityProvider } from "../DensityProvider";
import { Button } from "../Button";
import { Field, FieldLabel } from "../Field";
import { Input } from "../Input";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "../Popover";

const meta: Meta<typeof DensityProvider> = {
  title: "shadcn-alexgorbatchev/components/DensityProvider",
  component: DensityProvider,
  tags: ["autodocs", "!test"],
  args: { density: "comfortable" },
  render: (args) => {
    const storyId = useId();
    return (
      <DensityProvider {...args}>
        <Field>
          <FieldLabel htmlFor={`${storyId}-density-name`}>Name</FieldLabel>
          <Input id={`${storyId}-density-name`} placeholder="Your name" />
        </Field>
        <div className="mt-4 flex gap-2">
          <Button>Save</Button>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>Details</PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Density follows the provider through portals.</PopoverTitle>
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

export const Comfortable: Story = {};
export const Compact: Story = { args: { density: "compact" } };
export const Mixed: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DensityProvider density="comfortable">
        <Button>Comfortable provider</Button>
        <Button density="compact">Compact override</Button>
        <DensityProvider density="compact">
          <Button>Nested compact provider</Button>
        </DensityProvider>
      </DensityProvider>
    </div>
  ),
};
