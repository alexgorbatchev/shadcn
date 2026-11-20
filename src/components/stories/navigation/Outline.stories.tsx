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
