import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { SkipLink } from "../../SkipLink";

const meta: Meta<typeof SkipLink> = {
  title: "@alexgorbatchev/shadcn/components/navigation/SkipLink",
  component: SkipLink,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "SkipLink is the first Tab stop: a link to the main content that stays hidden until it has keyboard focus, then shows as an outline button pinned to the top start corner. It jumps to `targetId`; an `onClick` that calls `preventDefault` lets the app move focus itself.",
      },
    },
  },
  args: { targetId: "main-content", children: "Skip to content" },
  render: (args) => (
    <>
      <SkipLink {...args} />
      <nav aria-label="Site">
        <a href="#home">Home</a>
      </nav>
      <main id="main-content" tabIndex={-1}>
        <h1>Main content</h1>
      </main>
    </>
  ),
};
export default meta;
type Story = StoryObj<typeof SkipLink>;

export const HiddenUntilFocused: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Skip to content" });
    await expect(link).toHaveAttribute("href", "#main-content");
    // Unfocused, it waits above the viewport.
    await expect(link.getBoundingClientRect().bottom).toBeLessThanOrEqual(0);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    // Focused, it shows as a fixed button at the top start corner.
    await expect(getComputedStyle(link).position).toBe("fixed");
    await waitFor(() => expect(link.getBoundingClientRect().top).toBeGreaterThan(0));
    await expect(link.getBoundingClientRect().left).toBeLessThan(16);
    await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  },
};

export const AppManagedFocus: Story = {
  args: {
    onClick: fn((event) => {
      event.preventDefault();
      event.currentTarget.ownerDocument.getElementById("main-content")?.focus();
    }),
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("main")).toHaveFocus();
  },
};
