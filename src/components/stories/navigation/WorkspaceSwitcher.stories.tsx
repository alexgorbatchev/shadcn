import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { WorkspaceSwitcher } from "../../WorkspaceSwitcher";
const meta: Meta<typeof WorkspaceSwitcher> = {
  title: "@alexgorbatchev/shadcn/components/navigation/WorkspaceSwitcher",
  component: WorkspaceSwitcher,
  tags: ["autodocs", "test"],
  args: {
    workspaces: [
      { value: "personal", label: "Personal" },
      { value: "team", label: "Team" },
    ],
    onValueChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Workspace" }));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("option", { name: "Team" }));
    await expect(canvas.getByRole("combobox", { name: "Workspace" })).toHaveTextContent("Team");
    await expect(args.onValueChange).toHaveBeenCalledWith("team");
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox", { name: "Workspace" })).toBeDisabled();
  },
};
