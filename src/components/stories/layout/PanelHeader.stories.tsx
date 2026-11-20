import type { Meta, StoryObj } from "@storybook/react-vite";
import { XIcon } from "lucide-react";
import { expect, fn, waitFor, within } from "storybook/test";
import { PanelHeader } from "../../PanelHeader";
import { Button } from "../../Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../Tooltip";
import { Kbd } from "../../Kbd";

const close = fn();
const commentOnPage = fn();

const meta: Meta<typeof PanelHeader> = {
  title: "@alexgorbatchev/shadcn/components/layout/PanelHeader",
  component: PanelHeader,
  tags: ["autodocs", "test"],
  args: {
    title: "Comments",
    count: 3,
    actions: (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close comments"
              aria-keyshortcuts="Escape"
              onClick={close}
            >
              <XIcon />
            </Button>
          }
        />
        <TooltipContent>
          Close comments <Kbd>Esc</Kbd>
        </TooltipContent>
      </Tooltip>
    ),
    toolbar: (
      <>
        <Button size="sm" onClick={commentOnPage}>
          Comment on page
        </Button>
        <Button size="sm" variant="outline">
          Select a region
        </Button>
      </>
    ),
  },
  render: (args) => (
    <div className="max-w-sm border border-border p-panel">
      <PanelHeader {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof PanelHeader>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { name: "Comments 3", level: 2 });
    const closeButton = canvas.getByRole("button", { name: "Close comments" });
    // The close button sits on the heading's row, centred on it; the actions take the next row, sharing one height.
    const headingBox = heading.getBoundingClientRect();
    const closeBox = closeButton.getBoundingClientRect();
    await expect(Math.abs(headingBox.top + headingBox.height / 2 - (closeBox.top + closeBox.height / 2))).toBeLessThan(
      1,
    );
    const commentButton = canvas.getByRole("button", { name: "Comment on page" });
    const regionButton = canvas.getByRole("button", { name: "Select a region" });
    await expect(commentButton.getBoundingClientRect().top).toBeGreaterThan(headingBox.bottom);
    await expect(commentButton.getBoundingClientRect().top).toBe(regionButton.getBoundingClientRect().top);
    await expect(commentButton.getBoundingClientRect().height).toBe(regionButton.getBoundingClientRect().height);
    await expect(commentButton.getBoundingClientRect().left).toBe(headingBox.left);
    await userEvent.hover(closeButton);
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).toHaveTextContent(
        "Close comments",
      ),
    );
    await userEvent.click(closeButton);
    await expect(close).toHaveBeenCalledOnce();
    await userEvent.click(commentButton);
    await expect(commentOnPage).toHaveBeenCalledOnce();
  },
};

export const TitleOnly: Story = {
  args: { count: undefined, actions: undefined, toolbar: undefined, headingLevel: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Comments", level: 3 })).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const FocusableHeading: Story = {
  args: { headingProps: { tabIndex: -1, id: "panel-heading" } },
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole("heading", { name: "Comments 3" });
    heading.focus();
    await expect(heading).toHaveFocus();
    await expect(heading).toHaveAttribute("id", "panel-heading");
  },
};
