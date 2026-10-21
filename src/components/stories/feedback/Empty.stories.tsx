import type { Meta, StoryObj } from "@storybook/react-vite";
import { FolderIcon, SearchIcon } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../Empty";
import { Button } from "../../Button";
import { Avatar, AvatarFallback, AvatarGroup } from "../../Avatar";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../InputGroup";
import { Field, FieldGroup, FieldLabel } from "../../Field";

const onCreate = fn();
const meta: Meta<typeof Empty> = {
  title: "@alexgorbatchev/shadcn/components/feedback/Empty",
  component: Empty,
  tags: ["autodocs", "test"],
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderIcon />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>Create your first project to get started.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreate}>Create project</Button>
      </EmptyContent>
    </Empty>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No projects yet")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Create project" }));
    await expect(onCreate).toHaveBeenCalledOnce();
  },
};
export const Compact: Story = { ...Default, args: { density: "compact" } };
export const WithoutIcon: Story = {
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyMedia>0</EmptyMedia>
        <EmptyTitle>No matches</EmptyTitle>
        <EmptyDescription>Try a different search.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("No matches")).toBeVisible();
  },
};

export const Outline: Story = {
  ...Default,
  args: { className: "border" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByText("No projects yet").closest('[data-slot="empty"]') as HTMLElement;
    await expect(Number.parseFloat(getComputedStyle(root).borderTopWidth)).toBeGreaterThan(0);
    await expect(getComputedStyle(root).borderTopStyle).toBe("dashed");
    await userEvent.click(canvas.getByRole("button", { name: "Create project" }));
    await expect(onCreate).toHaveBeenCalledOnce();
  },
};
export const Background: Story = {
  ...Default,
  args: { className: "bg-muted/30" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByText("No projects yet").closest('[data-slot="empty"]') as HTMLElement;
    await expect(getComputedStyle(root).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Create project" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onCreate).toHaveBeenCalledOnce();
  },
};
export const WithAvatar: Story = {
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyMedia>
          <Avatar size="lg">
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </EmptyMedia>
        <EmptyTitle>User offline</EmptyTitle>
        <EmptyDescription>Leave a message for Alex.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreate}>Leave message</Button>
      </EmptyContent>
    </Empty>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("AG")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Leave message" }));
    await expect(onCreate).toHaveBeenCalledOnce();
  },
};
export const WithAvatarGroup: Story = {
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyMedia>
          <AvatarGroup aria-label="Potential members">
            <Avatar>
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </AvatarGroup>
        </EmptyMedia>
        <EmptyTitle>No team members</EmptyTitle>
        <EmptyDescription>Invite your team to collaborate.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreate}>Invite members</Button>
      </EmptyContent>
    </Empty>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = (await canvas.findByText("AG")).getBoundingClientRect();
    const second = (await canvas.findByText("JD")).getBoundingClientRect();
    await expect(second.left).toBeLessThan(first.right);
    await expect(second.left).toBeGreaterThan(first.left);
    await userEvent.click(canvas.getByRole("button", { name: "Invite members" }));
    await expect(onCreate).toHaveBeenCalledOnce();
  },
};
export const WithSearch: Story = {
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>Search for a different page.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="empty-search">Search pages</FieldLabel>
            <InputGroup>
              <InputGroupInput id="empty-search" placeholder="Search pages..." />
              <InputGroupAddon aria-label="Search icon">
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
        <EmptyDescription>
          Need help?{" "}
          <a href="#support" onClick={(event) => event.preventDefault()}>
            Contact support
          </a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole("textbox", { name: "Search pages" });
    await userEvent.click(canvas.getByLabelText("Search icon"));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "settings");
    await expect(input).toHaveValue("settings");
    await userEvent.tab();
    const link = canvas.getByRole("link", { name: "Contact support" });
    await expect(link).toHaveFocus();
    await expect(link).toHaveAttribute("href", "#support");
    await expect(input.getBoundingClientRect().width).toBeGreaterThan(100);
  },
};
const onImport = fn();
export const RightToLeft: Story = {
  args: { dir: "rtl" },
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>Create or import a project.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={onCreate}>Create project</Button>
          <Button variant="outline" onClick={onImport}>
            Import project
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const create = canvas.getByRole("button", { name: "Create project" });
    const importButton = canvas.getByRole("button", { name: "Import project" });
    await expect(importButton.getBoundingClientRect().right).toBeLessThan(create.getBoundingClientRect().left);
    await userEvent.tab();
    await expect(create).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onCreate).toHaveBeenCalledOnce();
    await userEvent.tab();
    await expect(importButton).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onImport).toHaveBeenCalledOnce();
  },
};
