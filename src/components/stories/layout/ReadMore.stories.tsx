import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { ReadMore } from "../../ReadMore";

const PARAGRAPHS = [
  "The payments service started failing 2.7% of requests with ECONNRESET at 14:02 UTC.",
  "The upstream load balancer closes idle keep-alive sockets after 60 seconds, and our pool keeps them for 90.",
  "A request that picks a socket in that window fails on its first write, then succeeds on retry.",
  "The error rate follows traffic: it is highest just after quiet periods, when most pooled sockets have idled.",
  "Shortening the pool's idle timeout to 55 seconds removes the window without retries hiding real outages.",
];

const meta: Meta<typeof ReadMore> = {
  title: "@alexgorbatchev/shadcn/components/layout/ReadMore",
  component: ReadMore,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "ReadMore folds long content to `maxHeight` with a More button that unfolds it for good: no Less button follows. Content that fits shows in full without a button.",
      },
    },
  },
  args: { maxHeight: "6rem", "aria-label": "Context" },
  render: (args) => (
    <div className="w-80 text-sm">
      <ReadMore {...args}>
        {PARAGRAPHS.map((text) => (
          <p key={text} className="mb-2">
            {text}
          </p>
        ))}
      </ReadMore>
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof ReadMore>;

export const Folded: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByLabelText("Context");
    await expect(content.getBoundingClientRect().height).toBeLessThanOrEqual(96);
    const more = await canvas.findByRole("button", { name: "More" });
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await expect(more).toHaveAttribute("data-size", "xs");
    await expect(getComputedStyle(more).borderTopStyle).toBe("solid");
    await expect(
      Math.abs(more.getBoundingClientRect().left - content.getBoundingClientRect().left),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(more);
    await waitFor(() => expect(content.getBoundingClientRect().height).toBeGreaterThan(96));
    // Unfolded for good: the button goes away, nothing offers Less, and focus rests on the content it unfolded.
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Less")).not.toBeInTheDocument();
    await expect(content).toHaveFocus();
  },
};

export const ShortContent: Story = {
  render: (args) => (
    <div className="w-80 text-sm">
      <ReadMore {...args}>
        <p>Short enough to show in full.</p>
      </ReadMore>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Short enough to show in full.")).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
