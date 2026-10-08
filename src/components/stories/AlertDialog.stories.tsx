import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../AlertDialog";
import { DeleteConfirmationExample } from "./helpers";
import { Button } from "../Button";

const meta: Meta<typeof AlertDialog> = {
  title: "shadcn-alexgorbatchev/components/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs", "!test"],
  render: (args) => <DeleteConfirmationExample {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
};
export const Small: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button variant="outline" />}>Review permission</AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Allow notifications?</AlertDialogTitle>
          <AlertDialogDescription>Receive project updates.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogCancel render={<Button />}>Allow</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
