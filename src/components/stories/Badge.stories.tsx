import type { Meta, StoryObj } from "@storybook/react-vite";
import type { MouseEvent } from "react";
import { CheckIcon, BookmarkIcon } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Badge } from "../Badge";
import { Spinner } from "../Spinner";

const meta: Meta<typeof Badge> = {
  title: "shadcn-alexgorbatchev/components/Badge",
  component: Badge,
  tags: ["autodocs", "test"],
  args: { children: "Active" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "destructive", "ghost", "success", "warning", "link"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText("Active");
    await expect(badge).toBeVisible();
    await expect(badge.tagName).toBe("SPAN");
    await expect(badge.getBoundingClientRect().width).toBeGreaterThan(0);
    await expect(badge.getBoundingClientRect().height).toBeGreaterThan(0);
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
    await expect(within(canvasElement).queryByRole("link")).not.toBeInTheDocument();
  },
};
export const Secondary: Story = { ...Default, args: { variant: "secondary" } };
export const Outline: Story = { ...Default, args: { variant: "outline" } };
export const Destructive: Story = { ...Default, args: { variant: "destructive" } };
export const Ghost: Story = { ...Default, args: { variant: "ghost" } };
export const Success: Story = { tags: ["visual"], ...Default, args: { variant: "success" } };
export const Warning: Story = { tags: ["visual"], ...Default, args: { variant: "warning" } };
export const Link: Story = { ...Default, args: { variant: "link" } };
export const AsLink: Story = {
  args: {
    render: <a href="https://base-ui.com/" />,
    children: "Base UI",
    variant: "link",
    onClick: fn((event: MouseEvent<HTMLSpanElement>) => event.preventDefault()),
    ref: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Base UI" });
    await expect(link).toHaveAttribute("href", "https://base-ui.com/");
    await expect(args.ref).toHaveBeenCalledWith(link);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(Number.parseFloat(getComputedStyle(link).borderWidth)).toBeGreaterThan(0);
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

const renderedAction = fn();
const renderedRef = fn();
export const NativeAction: Story = {
  args: { onClick: fn(), ref: fn() },
  render: (args) => (
    <Badge {...args} render={<button type="button" ref={renderedRef} onClick={renderedAction} />}>
      Review status
    </Badge>
  ),
  play: async ({ canvasElement, args }) => {
    renderedAction.mockClear();
    const button = within(canvasElement).getByRole("button", { name: "Review status" });
    await expect(args.ref).toHaveBeenCalledWith(button);
    await expect(renderedRef).toHaveBeenCalledWith(button);
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(renderedAction).toHaveBeenCalledTimes(2);
  },
};

export const RenderCallback: Story = {
  args: { variant: "success", density: "compact", onClick: fn() },
  render: (args) => (
    <Badge
      {...args}
      render={(props, state) => (
        <button {...props} type="button" aria-label={`Review ${state.density} ${state.variant} ${state.slot}`} />
      )}
    >
      Verified
    </Badge>
  ),
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Review compact success badge" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Density: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Badge {...args} density="compact" aria-label="Compact status">
        Active
      </Badge>
      <Badge {...args} density="comfortable" aria-label="Comfortable status">
        Active
      </Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const compact = canvas.getByLabelText("Compact status").getBoundingClientRect();
    const comfortable = canvas.getByLabelText("Comfortable status").getBoundingClientRect();
    await expect(compact.height).toBeGreaterThan(0);
    await expect(compact.height).toBeLessThan(comfortable.height);
    await expect(compact.width).toBeLessThan(comfortable.width);
  },
};

export const LeadingIcon: Story = {
  render: (args) => (
    <Badge {...args}>
      <CheckIcon data-icon="inline-start" data-testid="Badge--icon" />
      <span>Verified</span>
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByTestId("Badge--icon").getBoundingClientRect();
    const label = canvas.getByText("Verified").getBoundingClientRect();
    await expect(icon.width).toBeGreaterThan(0);
    await expect(icon.width).toBe(icon.height);
    await expect(icon.right).toBeLessThan(label.left);
  },
};

export const TrailingIcon: Story = {
  render: (args) => (
    <Badge {...args}>
      <span>Bookmark</span>
      <BookmarkIcon data-icon="inline-end" data-testid="Badge--icon" />
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByTestId("Badge--icon").getBoundingClientRect();
    const label = canvas.getByText("Bookmark").getBoundingClientRect();
    await expect(icon.width).toBeGreaterThan(0);
    await expect(icon.width).toBe(icon.height);
    await expect(icon.left).toBeGreaterThan(label.right);
  },
};

export const WithSpinner: Story = {
  render: (args) => (
    <Badge {...args}>
      <Spinner data-icon="inline-start" aria-label="Generating" />
      <span>Generating</span>
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spinnerElement = canvas.getByRole("status", { name: "Generating" });
    const spinner = spinnerElement.getBoundingClientRect();
    const label = canvas.getByText("Generating").getBoundingClientRect();
    await expect(spinner.width).toBeGreaterThan(0);
    await expect(spinner.right).toBeLessThan(label.left);
    await expect(spinner.height).toBeLessThanOrEqual(spinnerElement.parentElement?.getBoundingClientRect().height ?? 0);
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <div dir="ltr" className="flex gap-4">
        <Badge {...args} aria-label="Leading LTR">
          <CheckIcon data-icon="inline-start" data-testid="Badge--icon" />
          <span>Verified</span>
        </Badge>
        <Badge {...args} aria-label="Trailing LTR">
          <span>Bookmark</span>
          <BookmarkIcon data-icon="inline-end" data-testid="Badge--icon" />
        </Badge>
      </div>
      <div dir="rtl" className="flex gap-4">
        <Badge {...args} aria-label="Leading RTL">
          <CheckIcon data-icon="inline-start" data-testid="Badge--icon" />
          <span>Verified</span>
        </Badge>
        <Badge {...args} aria-label="Trailing RTL">
          <span>Bookmark</span>
          <BookmarkIcon data-icon="inline-end" data-testid="Badge--icon" />
        </Badge>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const leadingLtr = canvas.getByLabelText("Leading LTR");
    const leadingRtl = canvas.getByLabelText("Leading RTL");
    const trailingLtr = canvas.getByLabelText("Trailing LTR");
    const trailingRtl = canvas.getByLabelText("Trailing RTL");
    const leadingLtrIcon = within(leadingLtr).getByTestId("Badge--icon").getBoundingClientRect();
    const leadingRtlIcon = within(leadingRtl).getByTestId("Badge--icon").getBoundingClientRect();
    const trailingLtrIcon = within(trailingLtr).getByTestId("Badge--icon").getBoundingClientRect();
    const trailingRtlIcon = within(trailingRtl).getByTestId("Badge--icon").getBoundingClientRect();
    await expect(leadingRtlIcon.left).toBeGreaterThan(
      within(leadingRtl).getByText("Verified").getBoundingClientRect().right,
    );
    await expect(trailingRtlIcon.right).toBeLessThan(
      within(trailingRtl).getByText("Bookmark").getBoundingClientRect().left,
    );
    await expect(leadingRtl.getBoundingClientRect().right - leadingRtlIcon.right).toBe(
      leadingLtrIcon.left - leadingLtr.getBoundingClientRect().left,
    );
    await expect(trailingRtlIcon.left - trailingRtl.getBoundingClientRect().left).toBe(
      trailingLtr.getBoundingClientRect().right - trailingLtrIcon.right,
    );
  },
};
