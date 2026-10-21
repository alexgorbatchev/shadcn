import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Progress, ProgressLabel, ProgressValue } from "../../Progress";
import { Slider } from "../../Slider";

const meta: Meta<typeof Progress> = {
  title: "@alexgorbatchev/shadcn/components/feedback/Progress",
  component: Progress,
  tags: ["autodocs", "test"],
  args: { value: 56 },
  render: (args) => (
    <Progress {...args}>
      <ProgressLabel>Upload progress</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const InProgress: Story = {
  play: async ({ canvasElement, args }) => {
    const progress = within(canvasElement).getByRole("progressbar", { name: "Upload progress" });
    await expect(progress).toHaveAttribute("aria-valuenow", String(args.value));
    await expect(within(canvasElement).getByText(`${args.value}%`)).toBeVisible();
  },
};
export const Empty: Story = { ...InProgress, args: { value: 0 } };
export const Complete: Story = { ...InProgress, args: { value: 100 } };
export const Indeterminate: Story = {
  args: { value: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("progressbar", { name: "Upload progress" })).not.toHaveAttribute(
      "aria-valuenow",
    );
  },
};
export const StateCallback: Story = {
  args: { className: fn(() => "") },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).getByRole("progressbar", { name: "Upload progress" })).toHaveAttribute(
      "aria-valuenow",
      "56",
    );
    await expect(args.className).toHaveBeenCalledWith(expect.objectContaining({ status: "progressing" }));
  },
};

export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState(50);
    return (
      <div className="flex w-80 flex-col gap-4">
        <Progress value={value}>
          <ProgressLabel>Upload progress</ProgressLabel>
          <ProgressValue />
        </Progress>
        <Slider value={value} onValueChange={setValue} getAriaLabel={() => "Upload percentage"} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = await canvas.findByRole("slider", { name: "Upload percentage" });
    await waitFor(() => expect(slider).toHaveAttribute("aria-valuenow", "50"));
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() =>
      expect(canvas.getByRole("progressbar", { name: "Upload progress" })).toHaveAttribute("aria-valuenow", "51"),
    );
    await expect(canvas.getByText("51%")).toBeVisible();
    const progress = canvas.getByRole("progressbar", { name: "Upload progress" });
    const track = progress.querySelector('[data-slot="progress-track"]') as HTMLElement;
    const indicator = progress.querySelector('[data-slot="progress-indicator"]') as HTMLElement;
    await waitFor(() =>
      expect(indicator.getBoundingClientRect().width / track.getBoundingClientRect().width).toBeCloseTo(0.51, 2),
    );
  },
};
export const RightToLeft: Story = {
  args: { dir: "rtl", className: "w-80" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole("progressbar", { name: "Upload progress" });
    const label = canvas.getByText("Upload progress").getBoundingClientRect();
    const value = canvas.getByText("56%").getBoundingClientRect();
    const track = progress.querySelector('[data-slot="progress-track"]') as HTMLElement;
    const indicator = progress.querySelector('[data-slot="progress-indicator"]') as HTMLElement;
    await expect(value.left).toBeCloseTo(progress.getBoundingClientRect().left, 1);
    await expect(label.right).toBeCloseTo(progress.getBoundingClientRect().right, 1);
    await expect(indicator.getBoundingClientRect().right).toBeCloseTo(track.getBoundingClientRect().right, 1);
    await expect(indicator.getBoundingClientRect().width / track.getBoundingClientRect().width).toBeCloseTo(0.56, 2);
  },
};

export const StatusTone: Story = {
  render: function Render() {
    const [isFailed, setIsFailed] = useState(false);
    return (
      <div className="w-80">
        <Progress value={40} tone={isFailed ? "destructive" : "success"}>
          <ProgressLabel>{isFailed ? "Upload failed" : "Upload active"}</ProgressLabel>
        </Progress>
        <button type="button" onClick={() => setIsFailed(true)}>
          Fail upload
        </button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole("progressbar", { name: "Upload active" });
    const indicator = progress.querySelector<HTMLElement>("[data-slot=progress-indicator]");
    if (!indicator) throw new Error("Native progress indicator missing");
    const activeColor = getComputedStyle(indicator).backgroundColor;
    await userEvent.click(canvas.getByRole("button", { name: "Fail upload" }));
    await expect(canvas.getByRole("progressbar", { name: "Upload failed" })).toHaveAttribute("aria-valuenow", "40");
    await waitFor(() => expect(getComputedStyle(indicator).backgroundColor).not.toBe(activeColor));
  },
};

export const Partial: Story = { ...InProgress, args: { value: 25, tone: "warning" } };
export const OutOfRange: Story = {
  args: { value: 150 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole("progressbar", { name: "Upload progress" });
    await expect(progress).toHaveAttribute("aria-valuenow", "100");
    await expect(canvas.getByText("100%")).toBeVisible();
    const indicator = progress.querySelector<HTMLElement>("[data-slot=progress-indicator]");
    const track = progress.querySelector<HTMLElement>("[data-slot=progress-track]");
    if (!indicator || !track) throw new Error("Native progress geometry missing");
    await waitFor(() =>
      expect(indicator.getBoundingClientRect().width).toBeCloseTo(track.getBoundingClientRect().width, 0),
    );
  },
};
