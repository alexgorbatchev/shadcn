import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Outline, OutlineItem, OutlineSection } from "../../Outline";

const meta: Meta<typeof Outline> = {
  title: "@alexgorbatchev/shadcn/components/navigation/Outline",
  component: Outline,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof Outline>;

const goToJargon = fn();

export const Default: Story = {
  args: {
    className: "max-w-72",
    children: (
      <>
        <OutlineSection title="Basics" meta="2 of 3 answered">
          <OutlineItem label="Company name" state="Answered" onSelect={fn()} />
          <OutlineItem label="Describe the company in one sentence" state="Not answered" onSelect={fn()} />
          <OutlineItem label="Primary audience" state="Answered" onSelect={fn()} />
        </OutlineSection>
        <OutlineSection title="Voice">
          <OutlineItem label="Technical jargon" onSelect={goToJargon} />
        </OutlineSection>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const basics = canvas.getByRole("region", { name: "Basics" });
    await expect(basics).toHaveTextContent("2 of 3 answered");
    await expect(within(basics).getAllByRole("button")).toHaveLength(3);
    await expect(
      within(basics).getByRole("button", { name: "Describe the company in one sentence Not answered" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Technical jargon" }));
    await expect(goToJargon).toHaveBeenCalledOnce();
  },
};

/** A section title longer than the outline is wide wraps onto further lines instead of ending in an ellipsis. */
export const LongSectionTitle: Story = {
  args: {
    className: "w-56",
    children: (
      <OutlineSection title="Q7 · Supply-chain vendor quotes and proofs of concept">
        <OutlineItem label="What dependency data may go to vendors?" state="Not answered" onSelect={fn()} />
      </OutlineSection>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole("region", { name: "Q7 · Supply-chain vendor quotes and proofs of concept" });
    const title = within(section).getByText("Q7 · Supply-chain vendor quotes and proofs of concept");
    if (title.getBoundingClientRect().width === 0) return;
    await expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth);
    await expect(title.getBoundingClientRect().height).toBeGreaterThan(
      parseFloat(getComputedStyle(title).lineHeight) * 1.5,
    );
  },
};
