import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, userEvent, fn } from "storybook/test";
import { ReasoningPreviewFixture } from "./fixtures/reasoning.js";
import { ReasoningRoot } from "../../../assistant-ui/elements/ReasoningRoot.js";
import { ReasoningTrigger } from "../../../assistant-ui/elements/ReasoningTrigger.js";
import { ReasoningContent } from "../../../assistant-ui/elements/ReasoningContent.js";
import { ReasoningText } from "../../../assistant-ui/elements/ReasoningText.js";
const meta: Meta<typeof ReasoningRoot> = {
  component: ReasoningRoot,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ReasoningRoot",
  render: (args) => (
    <ReasoningRoot {...args}>
      <ReasoningTrigger />
      <ReasoningContent>
        <ReasoningText>Inspect the package manifest</ReasoningText>
      </ReasoningContent>
    </ReasoningRoot>
  ),
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Reasoning" }));
    await waitFor(() => expect(canvas.getByText("Inspect the package manifest")).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Reasoning" })).toHaveAttribute("aria-expanded", "true");
  },
};
export const Expanded: Story = {
  ...Default,
  args: { ...Default.args, defaultOpen: true },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Inspect the package manifest")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Reasoning" }));
    await expect(canvas.getByRole("button", { name: "Reasoning" })).toHaveAttribute("aria-expanded", "false");
  },
};
export const Streaming: Story = {
  ...Default,
  args: { ...Default.args, streaming: true },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Inspect the package manifest")).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Reasoning" })).toHaveAttribute("aria-expanded", "true");
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const Controlled: Story = {
  args: { open: true, onOpenChange: fn(), className: fn(() => "w-full") },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Reasoning" }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await expect(args.className).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
    await expect(canvas.getByRole("button", { name: "Reasoning" })).toHaveAttribute("aria-expanded", "true");
  },
};
export const StreamingScroll: Story = {
  args: { onAnimationStart: fn() },
  render: (args) => <ReasoningPreviewFixture onAnimationStart={args.onAnimationStart} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start reasoning" }));
    const viewport = await canvas.findByTestId("ReasoningText");
    await waitFor(() => expect(viewport).toBeVisible());
    await document.fonts.ready;
    await waitFor(() => expect(viewport.getAnimations({ subtree: true })).toHaveLength(0));
    await waitFor(() =>
      expect(viewport.scrollTop + viewport.clientHeight).toBeGreaterThanOrEqual(viewport.scrollHeight - 1),
    );
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const scrolledUp = new Promise<void>((resolve) =>
      viewport.addEventListener("scroll", () => resolve(), { once: true }),
    );
    viewport.scrollTo({ top: 0, behavior: "instant" });
    await scrolledUp;
    await waitFor(() => expect(viewport.scrollTop + viewport.clientHeight).toBeLessThan(viewport.scrollHeight - 50));
    const top = viewport.scrollTop;
    const height = viewport.scrollHeight;
    await userEvent.click(canvas.getByRole("button", { name: "Append reasoning" }));
    await waitFor(() => expect(viewport.scrollHeight).toBeGreaterThan(height));
    await expect(Math.abs(viewport.scrollTop - top)).toBeLessThanOrEqual(1);
    const scrolledDown = new Promise<void>((resolve) =>
      viewport.addEventListener("scroll", () => resolve(), { once: true }),
    );
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "instant" });
    await scrolledDown;
    await waitFor(() =>
      expect(viewport.scrollTop + viewport.clientHeight).toBeGreaterThanOrEqual(viewport.scrollHeight - 1),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Append reasoning" }));
    await waitFor(() =>
      expect(viewport.scrollTop + viewport.clientHeight).toBeGreaterThanOrEqual(viewport.scrollHeight - 1),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Finish reasoning" }));
    await expect(canvas.getByRole("button", { name: "Reasoning" })).toHaveAttribute("aria-expanded", "false");
    await expect(args.onAnimationStart).toHaveBeenCalledTimes(2);
  },
};
export const ExpandedStreamingTransitions: Story = {
  args: { onAnimationStart: fn() },
  render: (args) => <ReasoningPreviewFixture defaultOpen onAnimationStart={args.onAnimationStart} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start reasoning" }));
    await userEvent.click(canvas.getByRole("button", { name: "Finish reasoning" }));
    await expect(canvas.getByRole("button", { name: "Reasoning" })).toHaveAttribute("aria-expanded", "true");
    await expect(args.onAnimationStart).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Reasoning" }));
    await userEvent.click(canvas.getByRole("button", { name: "Start reasoning" }));
    await expect(canvas.getByRole("button", { name: "Reasoning" })).toHaveAttribute("aria-expanded", "false");
    await expect(args.onAnimationStart).toHaveBeenCalledOnce();
  },
};
