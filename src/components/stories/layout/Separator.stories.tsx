import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Separator } from "../../Separator";

const meta: Meta<typeof Separator> = {
  title: "@alexgorbatchev/shadcn/components/layout/Separator",
  component: Separator,
  tags: ["autodocs", "test"],
  render: (args) => (
    <div className="flex flex-col gap-4">
      <span>Project</span>
      <Separator {...args} />
      <span>Settings</span>
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole("separator");
    await expect(separator.getBoundingClientRect().height).toBe(1);
    await expect(separator.getBoundingClientRect().width).toBeGreaterThan(100);
  },
};
export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-4">
      <span>Overview</span>
      <Separator orientation="vertical" />
      <span>Settings</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole("separator");
    await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    await expect(separator.getBoundingClientRect().width).toBe(1);
    await expect(separator.getBoundingClientRect().height).toBe(40);
  },
};

export const NativeCallback: Story = {
  args: { orientation: "vertical", className: (state) => (state.orientation === "vertical" ? "h-12" : "h-8") },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("separator").getBoundingClientRect().height).toBe(48);
  },
};

export const Navigation: Story = {
  render: () => (
    <nav aria-label="Project navigation" className="flex h-10 items-center gap-4">
      <a href="#overview" onClick={(event) => event.preventDefault()}>
        Overview
      </a>
      <Separator orientation="vertical" />
      <a href="#settings" onClick={(event) => event.preventDefault()}>
        Settings
      </a>
    </nav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = within(canvas.getByRole("navigation", { name: "Project navigation" }));
    await expect(navigation.getByRole("separator").getBoundingClientRect().height).toBe(40);
    await userEvent.tab();
    await expect(navigation.getByRole("link", { name: "Overview" })).toHaveFocus();
    await userEvent.tab();
    await expect(navigation.getByRole("link", { name: "Settings" })).toHaveFocus();
  },
};
export const List: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <dl>
        <dt>Project</dt>
        <dd>Design system</dd>
      </dl>
      <Separator />
      <dl>
        <dt>Status</dt>
        <dd>Active</dd>
      </dl>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("separator").getBoundingClientRect();
    await expect(separator.top).toBeGreaterThan(canvas.getByText("Design system").getBoundingClientRect().bottom);
    await expect(separator.bottom).toBeLessThan(canvas.getByText("Status").getBoundingClientRect().top);
    await expect(separator.width).toBe(320);
  },
};
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" className="flex h-10 items-center gap-4">
      <span>Overview</span>
      <Separator orientation="vertical" />
      <span>Settings</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("separator").getBoundingClientRect();
    await expect(separator.width).toBe(1);
    await expect(separator.height).toBe(40);
    await expect(separator.right).toBeLessThan(canvas.getByText("Overview").getBoundingClientRect().left);
    await expect(separator.left).toBeGreaterThan(canvas.getByText("Settings").getBoundingClientRect().right);
  },
};
