import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TextDiff } from "../../text-diff";

const configBefore = [
  "[server]",
  "host = 0.0.0.0",
  "port = 8080",
  "workers = 4",
  "timeout = 30",
  "keepalive = 5",
  "log_level = info",
  "log_format = text",
  "access_log = /var/log/app/access.log",
  "error_log = /var/log/app/error.log",
  "max_body = 10m",
  "compression = on",
].join("\n");
const configAfter = configBefore
  .replace("workers = 4", "workers = 8")
  .replace("compression = on", "compression = on\ncompression_level = 6");
const longLine =
  "The sidebar keeps its width when the window narrows, and its rows truncate their titles with an ellipsis instead of wrapping onto a second line, which keeps the tree scannable.";

const meta: Meta<typeof TextDiff> = {
  component: TextDiff,
  title: "@alexgorbatchev/shadcn/components/data-display/TextDiff",
  tags: ["autodocs", "test"],
  args: { before: configBefore, after: configAfter, beforeLabel: "Current", afterLabel: "Proposed" },
  render: (args) => (
    <div className="w-[390px]">
      <TextDiff {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof TextDiff>;

/** Below 560 px of its own width the versions stack: "-" and "+" mark removed and added lines as well as colour. */
export const Stacked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const diff = canvas.getByTestId("TextDiff");
    await waitFor(() => expect(diff).toHaveAttribute("data-view-mode", "unified"));
    await expect(within(canvas.getByTestId("TextDiff--legend")).getByText("Current")).toBeVisible();
    await expect(canvas.getByText("workers = 4").closest("del")).not.toBeNull();
    await expect(canvas.getByText("workers = 8").closest("ins")).not.toBeNull();
    const removed = canvas.getByText("workers = 4").closest("[data-slot=diff-viewer-line]");
    await expect(removed?.querySelector("[data-slot=diff-viewer-indicator]")).toHaveTextContent("-");
  },
};

/** Unchanged runs longer than the context fold behind a button that reveals and hides them again. */
export const FoldedUnchangedLines: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("log_format = text")).not.toBeInTheDocument();
    const show = canvas.getByRole("button", { name: "Show 2 unchanged lines" });
    await expect(show).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(show);
    await expect(canvas.getByText("log_format = text")).toBeVisible();
    const hide = canvas.getByRole("button", { name: "Hide 2 unchanged lines" });
    await expect(hide).toHaveAttribute("aria-expanded", "true");
    await expect(hide).toHaveFocus();
    await userEvent.click(hide);
    await expect(canvas.queryByText("log_format = text")).not.toBeInTheDocument();
  },
};

/** From 560 px of its own width the versions sit side by side, each under its label. */
export const SideBySide: Story = {
  render: (args) => (
    <div className="w-[800px]">
      <TextDiff {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("TextDiff")).toHaveAttribute("data-view-mode", "split"));
    const row = canvas.getByText("workers = 4").closest("[data-slot=diff-viewer-split-line]");
    await expect(row).not.toBeNull();
    await expect(within(row as HTMLElement).getByText("workers = 8")).toBeVisible();
    const diff = canvas.getByTestId("TextDiff");
    const fold = diff.querySelector<HTMLElement>("[data-slot=text-diff-fold]");
    await expect(fold).not.toBeNull();
    await expect(Math.abs((fold?.getBoundingClientRect().width ?? 0) - diff.clientWidth)).toBeLessThanOrEqual(2);
  },
};

/** A fixed mode ignores the width: `unified` stacks even when wide. */
export const FixedMode: Story = {
  args: { viewMode: "unified" },
  render: SideBySide.render,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("TextDiff")).toHaveAttribute("data-view-mode", "unified");
  },
};

/** Long lines wrap inside the diff, so it never scrolls sideways; unchanged text keeps every line. */
export const WrappedProse: Story = {
  args: {
    before: longLine,
    after: longLine.replace("an ellipsis", "a fade"),
    beforeLabel: undefined,
    afterLabel: undefined,
    showLineNumbers: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const diff = canvas.getByTestId("TextDiff");
    await expect(within(canvas.getByTestId("TextDiff--legend")).getByText("Before")).toBeVisible();
    await expect(diff.scrollWidth).toBeLessThanOrEqual(diff.clientWidth);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

/** Identical versions show every line, with nothing marked. */
export const Unchanged: Story = {
  args: { after: configBefore },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("compression = on")).toBeVisible();
    await expect(canvasElement.querySelector("ins, del")).toBeNull();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
