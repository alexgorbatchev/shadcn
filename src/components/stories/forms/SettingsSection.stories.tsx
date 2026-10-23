import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { SettingsSection } from "../../SettingsSection";
import { Field, FieldLabel } from "../../Field";
import { Input } from "../../Input";
const meta: Meta<typeof SettingsSection> = {
  title: "@alexgorbatchev/shadcn/components/forms/SettingsSection",
  component: SettingsSection,
  tags: ["autodocs", "test"],
  args: {
    title: "Profile settings",
    description: "Keep your details up to date.",
    onSubmit: fn((event) => event.preventDefault()),
    footer: "Changes apply to this workspace.",
    children: (
      <Field>
        <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
        <Input id="profile-name" name="displayName" required defaultValue="Alex" />
      </Field>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Display name" }), " Smith");
    await userEvent.click(canvas.getByRole("button", { name: /Save changes$/ }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("textbox", { name: "Display name" })).toHaveValue("Alex Smith");
  },
};
export const Saving: Story = {
  args: { pending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("form", { name: "Profile settings" })).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByRole("textbox", { name: "Display name" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: /Save changes$/ })).toBeDisabled();
  },
};
export const Destructive: Story = {
  args: {
    title: "Delete workspace",
    description: undefined,
    destructive: true,
    saveLabel: "Delete workspace",
    children: "This action permanently removes the workspace.",
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Delete workspace" }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
