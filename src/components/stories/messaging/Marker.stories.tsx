import type { Meta, StoryObj } from "@storybook/react-vite";
import type { MouseEvent } from "react";
import { useState } from "react";
import { GitBranchIcon } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Marker, MarkerContent, MarkerIcon } from "../../Marker";
import { Button } from "../../Button";
import { Spinner } from "../../Spinner";

const meta: Meta<typeof Marker> = {
  title: "@alexgorbatchev/shadcn/components/messaging/Marker",
  component: Marker,
  tags: ["autodocs", "test"],
  argTypes: { variant: { control: "select", options: ["default", "border", "separator"] } },
  render: (args) => (
    <Marker {...args}>
      <MarkerIcon>
        <GitBranchIcon />
      </MarkerIcon>
      <MarkerContent>Switched to a new branch</MarkerContent>
    </Marker>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Shimmer: Story = {
  render: function Render() {
    const [isRunning, setRunning] = useState(true);
    return (
      <div className="flex flex-col gap-4">
        <Marker role="status">
          <MarkerContent className={isRunning ? "shimmer" : undefined}>
            {isRunning ? "Preparing response…" : "Response ready"}
          </MarkerContent>
        </Marker>
        <Button onClick={() => setRunning(false)}>Finish response</Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Preparing response…");
    await expect(canvas.getByRole("status")).toHaveTextContent("Preparing response…");
    await waitFor(() =>
      expect(content.getAnimations().some((animation) => animation.playState === "running")).toBe(
        !matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Finish response" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Response ready");
    await expect(getComputedStyle(canvas.getByText("Response ready")).animationName).toBe("none");
  },
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Switched to a new branch")).toBeVisible();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("separator")).not.toBeInTheDocument();
  },
};
export const Border: Story = {
  args: { variant: "border", "aria-label": "Branch activity" },
  play: async ({ canvasElement }) => {
    const marker = within(canvasElement).getByLabelText("Branch activity");
    await expect(marker).toHaveTextContent("Switched to a new branch");
    await expect(Number.parseFloat(getComputedStyle(marker).borderBottomWidth)).toBeGreaterThan(0);
  },
};
export const Separator: Story = {
  args: { variant: "separator", "aria-label": "Conversation date" },
  render: (args) => (
    <Marker {...args}>
      <MarkerContent>Today</MarkerContent>
    </Marker>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marker = canvas.getByLabelText("Conversation date");
    const label = canvas.getByText("Today").getBoundingClientRect();
    const row = marker.getBoundingClientRect();
    await expect(Math.abs((label.left + label.right) / 2 - (row.left + row.right) / 2)).toBeLessThan(1);
    await expect(Number.parseFloat(getComputedStyle(marker, "::before").width)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(marker, "::after").width)).toBeGreaterThan(0);
    await expect(canvas.queryByRole("separator")).not.toBeInTheDocument();
  },
};
export const SeparatorWithIcon: Story = {
  args: { variant: "separator", "aria-label": "File activity", className: "w-80" },
  render: (args) => (
    <Marker {...args}>
      <MarkerIcon>
        <GitBranchIcon />
      </MarkerIcon>
      <MarkerContent>Explored 4 files</MarkerContent>
    </Marker>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marker = canvas.getByLabelText("File activity");
    const icon = marker.querySelector('[data-slot="marker-icon"]') as HTMLElement;
    const content = canvas.getByText("Explored 4 files");
    const row = marker.getBoundingClientRect();
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(content).toBeVisible();
    const iconBounds = icon.getBoundingClientRect();
    const contentBounds = content.getBoundingClientRect();
    const groupStart = Math.min(iconBounds.left, contentBounds.left);
    const groupEnd = Math.max(iconBounds.right, contentBounds.right);
    await expect(Math.abs((groupStart + groupEnd) / 2 - (row.left + row.right) / 2)).toBeLessThan(1);
    await expect(Number.parseFloat(getComputedStyle(marker, "::before").width)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(marker, "::after").width)).toBeGreaterThan(0);
    await expect(canvas.queryByRole("separator")).not.toBeInTheDocument();
  },
};
export const StackedIcon: Story = {
  args: { "aria-label": "Completed activity", className: "w-80 flex-col" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marker = canvas.getByLabelText("Completed activity");
    const icon = marker.querySelector('[data-slot="marker-icon"]') as HTMLElement;
    const content = canvas.getByText("Switched to a new branch");
    const iconBounds = icon.getBoundingClientRect();
    const contentBounds = content.getBoundingClientRect();
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(contentBounds.top).toBeGreaterThan(iconBounds.bottom);
    await expect((iconBounds.left + iconBounds.right) / 2).toBeCloseTo(
      (contentBounds.left + contentBounds.right) / 2,
      1,
    );
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
export const LongSeparator: Story = {
  args: { variant: "separator", "aria-label": "Synchronization report", className: "w-48" },
  render: (args) => (
    <Marker {...args}>
      <MarkerIcon>
        <GitBranchIcon />
      </MarkerIcon>
      <MarkerContent>workspaceSynchronizationResultsAndDeploymentValidation.json</MarkerContent>
    </Marker>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marker = canvas.getByLabelText("Synchronization report");
    const content = canvas.getByText("workspaceSynchronizationResultsAndDeploymentValidation.json");
    const row = marker.getBoundingClientRect();
    const bounds = content.getBoundingClientRect();
    await expect(content).toBeVisible();
    await expect(bounds.left).toBeGreaterThanOrEqual(row.left);
    await expect(bounds.right).toBeLessThanOrEqual(row.right);
    await expect(marker.scrollWidth).toBeLessThanOrEqual(marker.clientWidth);
    await expect(bounds.height).toBeGreaterThan(Number.parseFloat(getComputedStyle(content).lineHeight));
  },
};
export const RightToLeftSeparatorWithIcon: Story = {
  ...SeparatorWithIcon,
  args: { ...SeparatorWithIcon.args, dir: "rtl" },
};
export const RightToLeftStackedIcon: Story = {
  ...StackedIcon,
  args: { ...StackedIcon.args, dir: "rtl" },
};
export const RightToLeftLongSeparator: Story = {
  ...LongSeparator,
  args: { ...LongSeparator.args, dir: "rtl" },
};
function StatusExample() {
  const [isRunning, setIsRunning] = useState(true);
  return (
    <div className="flex flex-col gap-4">
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>{isRunning ? "Checking the logs…" : "Logs checked"}</MarkerContent>
      </Marker>
      <Button onClick={() => setIsRunning(false)}>Finish check</Button>
    </div>
  );
}
export const Status: Story = {
  render: () => <StatusExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Checking the logs…");
    await userEvent.click(canvas.getByRole("button", { name: "Finish check" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Logs checked");
  },
};
export const Link: Story = {
  args: { onClick: fn((event: MouseEvent<HTMLDivElement>) => event.preventDefault()), ref: fn() },
  render: (args) => (
    <Marker {...args} render={<a href="#marker-details" />}>
      <MarkerContent>View the pull request</MarkerContent>
    </Marker>
  ),
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole("link", { name: "View the pull request" });
    await expect(link).toHaveAttribute("href", "#marker-details");
    await expect(args.ref).toHaveBeenCalledWith(link);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).textDecorationLine).toBe("underline");
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
const renderedAction = fn();
export const Action: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <Marker {...args} render={<button type="button" onClick={renderedAction} />}>
      <MarkerContent>Revert change</MarkerContent>
    </Marker>
  ),
  play: async ({ canvasElement, args }) => {
    renderedAction.mockClear();
    const button = within(canvasElement).getByRole("button", { name: "Revert change" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(Number.parseFloat(getComputedStyle(button).outlineWidth)).toBeGreaterThan(0);
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(renderedAction).toHaveBeenCalledTimes(2);
  },
};
export const RenderCallback: Story = {
  args: { variant: "border", onClick: fn() },
  render: (args) => (
    <Marker
      {...args}
      render={(props, state) => <button {...props} type="button" aria-label={`Review ${state.variant} marker`} />}
    >
      <MarkerContent>Review change</MarkerContent>
    </Marker>
  ),
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Review border marker" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
