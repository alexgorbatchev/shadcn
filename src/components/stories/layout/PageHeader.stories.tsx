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

export const WithEyebrow: Story = {
  args: { eyebrow: "ENGINE LIBRARY" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const eyebrow = canvas.getByText("ENGINE LIBRARY");
    const title = canvas.getByRole("heading", { name: "Projects", level: 1 });
    const description = canvas.getByText("Manage your team's work.");
    await expect(eyebrow).toBeVisible();
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(eyebrow.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(title.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(canvas.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "New project" }));
    await expect(action).toHaveBeenCalledOnce();
  },
};

export const NarrowWithLongAddress: Story = {
  globals: { theme: "light", density: "compact" },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    eyebrow: <strong>ENGINE LIBRARY</strong>,
    actions: "https://music.example.com/a-very-long-server-address-without-spaces-for-the-collection-endpoint",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole("heading", { name: "Projects", level: 1 });
    await expect(canvas.getByText("ENGINE LIBRARY")).toBeVisible();
    await expect(
      canvas.getByText(
        "https://music.example.com/a-very-long-server-address-without-spaces-for-the-collection-endpoint",
      ),
    ).toBeVisible();
    const header = title.closest("header");
    await expect(header).not.toBeNull();
    await expect(header!.scrollWidth).toBeLessThanOrEqual(header!.clientWidth + 1);
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  },
};
