import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../Dialog";
import { Button } from "../Button";
import { Field, FieldLabel } from "../Field";
import { Input } from "../Input";

const meta: Meta<typeof Dialog> = {
  title: "shadcn-alexgorbatchev/components/Dialog",
  component: Dialog,
  tags: ["autodocs", "!test"],
  render: (args) => {
    const storyId = useId();
    return (
      <Dialog {...args}>
        <DialogTrigger render={<Button variant="outline" />}>Edit profile</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your display name.</DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={`${storyId}-dialog-name`}>Name</FieldLabel>
            <Input id={`${storyId}-dialog-name`} defaultValue="Alex Gorbatchev" />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <DialogClose render={<Button />}>Save changes</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
};
export const NonModal: Story = { args: { modal: false } };
