import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { PageHeader } from "../../PageHeader";
import { Button } from "../../Button";
const action = fn();
const meta: Meta<typeof PageHeader> = {
  title: "@alexgorbatchev/shadcn/components/layout/PageHeader",
  component: PageHeader,
  tags: ["autodocs", "test"],
  args: {
    title: "Projects",
    description: "Manage your team's work.",
    breadcrumbs: (
      <nav aria-label="Breadcrumb">
        <a href="#home">Home</a>
      </nav>
    ),
    actions: <Button onClick={action}>New project</Button>,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "New project" }));
    await expect(action).toHaveBeenCalledOnce();
  },
};
export const TitleOnly: Story = {
  args: { description: undefined, breadcrumbs: undefined, actions: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Projects" })).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
