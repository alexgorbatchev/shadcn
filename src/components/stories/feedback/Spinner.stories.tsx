import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Spinner } from "../../Spinner";
import { Button } from "../../Button";
import { Badge } from "../../Badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../InputGroup";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "../../Empty";

const meta: Meta<typeof Spinner> = {
  title: "@alexgorbatchev/shadcn/components/feedback/Spinner",
  component: Spinner,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole("status", { name: "Loading" });
    await expect(spinner).toBeVisible();
    await waitFor(() =>
      expect(spinner.getAnimations()).toHaveLength(Number(!matchMedia("(prefers-reduced-motion: reduce)").matches)),
    );
  },
};

export const Small: Story = {
  args: { className: "size-3" },
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole("status", { name: "Loading" });
    await expect(spinner.getBoundingClientRect().width).toBe(12);
    await expect(spinner.getBoundingClientRect().height).toBe(12);
  },
};
export const Large: Story = {
  args: { className: "size-8" },
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole("status", { name: "Loading" });
    await expect(spinner.getBoundingClientRect().width).toBe(32);
    await expect(spinner.getBoundingClientRect().height).toBe(32);
  },
};
export const CustomLabel: Story = {
  args: { "aria-label": "Uploading", ref: fn() },
  play: async ({ canvasElement, args }) => {
    const spinner = within(canvasElement).getByRole("status", { name: "Uploading" });
    await expect(spinner).toBeVisible();
    await expect(args.ref).toHaveBeenCalledWith(spinner);
    await expect(within(canvasElement).queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
  },
};
export const InBadge: Story = {
  render: () => (
    <Badge variant="secondary">
      <Spinner aria-label="Syncing" data-icon="inline-start" />
      Syncing
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spinner = canvas.getByRole("status", { name: "Syncing" });
    const badge = canvas.getByText("Syncing");
    await expect(spinner).toBeVisible();
    await expect(spinner.getBoundingClientRect().height).toBeLessThan(badge.getBoundingClientRect().height);
  },
};
export const InInputGroup: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput aria-label="Pending message" disabled />
      <InputGroupAddon align="inline-end">
        <Spinner aria-label="Validating" />
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("textbox", { name: "Pending message" })).toBeDisabled();
    await expect(canvas.getByRole("status", { name: "Validating" })).toBeVisible();
  },
};
const onCancel = fn();
export const InEmpty: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Processing request</EmptyTitle>
        <EmptyDescription>Wait for processing to finish.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </EmptyContent>
    </Empty>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Loading" })).toBeVisible();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onCancel).toHaveBeenCalledOnce();
  },
};
export const RightToLeft: Story = {
  render: () => (
    <Button dir="rtl" disabled>
      <Spinner data-icon="inline-start" />
      Saving
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Loading Saving" });
    const spinner = canvas.getByRole("status", { name: "Loading" });
    const range = canvasElement.ownerDocument.createRange();
    range.selectNode(button.lastChild as Node);
    await expect(button).toBeDisabled();
    await expect(spinner.getBoundingClientRect().left).toBeGreaterThan(range.getBoundingClientRect().right);
  },
};
export const InButton: Story = {
  render: () => (
    <Button disabled>
      <Spinner data-icon="inline-start" />
      Saving
    </Button>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Loading Saving" })).toBeDisabled();
  },
};
