import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ErrorSummary, ErrorSummaryItem } from "../../ErrorSummary";

const meta: Meta<typeof ErrorSummary> = {
  title: "@alexgorbatchev/shadcn/components/feedback/ErrorSummary",
  component: ErrorSummary,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof ErrorSummary>;

const goToDescription = fn();
const goToDeadline = fn();

export const Default: Story = {
  args: {
    title: "2 answers needed",
    children: (
      <>
        <ErrorSummaryItem onSelect={goToDescription}>
          Describe the company in one sentence: Describe the company
        </ErrorSummaryItem>
        <ErrorSummaryItem onSelect={goToDeadline}>Launch deadline: Enter a deadline</ErrorSummaryItem>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = canvas.getByRole("region", { name: "2 answers needed" });
    await expect(within(summary).getByRole("heading", { level: 2, name: "2 answers needed" })).toBeVisible();
    await expect(within(summary).getAllByRole("listitem")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: "Launch deadline: Enter a deadline" }));
    await expect(goToDeadline).toHaveBeenCalledOnce();
    canvas.getByRole("button", { name: /Describe the company/ }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(goToDescription).toHaveBeenCalledOnce();
  },
};

export const NestedHeading: Story = {
  args: { ...Default.args, headingLevel: 3 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 3, name: "2 answers needed" })).toBeVisible();
  },
};
