import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DescriptionDetails, DescriptionList, DescriptionListItem, DescriptionTerm } from "../../DescriptionList";

const answers = [
  {
    question: "How should one machine schedule lane runs once several repositories share it?",
    answer: "One supervisor process",
  },
  {
    question: "Where should each repository's factory settings, prompt additions and plugins live?",
    answer: "In the managed repository",
  },
  { question: "Anything to add?", answer: "Keep the old lanes running until the cutover.\nThen retire them." },
  { question: "What should the repository be called?", answer: "Not answered" },
];

function renderList(args: ComponentProps<typeof DescriptionList>): ReactElement {
  return (
    <DescriptionList {...args}>
      {answers.map(({ question, answer }) => (
        <DescriptionListItem key={question}>
          <DescriptionTerm>{question}</DescriptionTerm>
          <DescriptionDetails>{answer}</DescriptionDetails>
        </DescriptionListItem>
      ))}
    </DescriptionList>
  );
}

const meta: Meta<typeof DescriptionList> = {
  title: "@alexgorbatchev/shadcn/components/data-display/DescriptionList",
  component: DescriptionList,
  tags: ["autodocs", "test"],
  args: { "aria-label": "Answers sent" },
  render: renderList,
};
export default meta;
type Story = StoryObj<typeof DescriptionList>;

export const Stacked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByLabelText("Answers sent");
    await expect(list.tagName).toBe("DL");
    const terms = canvas.getAllByRole("term");
    const details = canvas.getAllByRole("definition");
    await expect(terms.map((term) => term.textContent)).toEqual(answers.map((item) => item.question));
    // Every answer sits under its question, from the same left edge and across the list's full width.
    for (const [index, term] of terms.entries()) {
      const termBox = term.getBoundingClientRect();
      const detailBox = details[index]?.getBoundingClientRect();
      await expect(detailBox?.top).toBeGreaterThanOrEqual(termBox.bottom);
      await expect(detailBox?.left).toBe(termBox.left);
      await expect(detailBox?.width).toBe(list.getBoundingClientRect().width);
    }
  },
};

export const Narrow: Story = {
  render: (args) => (
    <div data-testid="narrow" className="w-48">
      {renderList(args)}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("narrow").getBoundingClientRect();
    for (const element of [...canvas.getAllByRole("term"), ...canvas.getAllByRole("definition")]) {
      await expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth);
      await expect(element.getBoundingClientRect().right).toBeLessThanOrEqual(container.right);
    }
    // The details keep their line breaks.
    const note = canvas.getByText(/Keep the old lanes running/);
    const lineHeight = Number.parseFloat(getComputedStyle(note).lineHeight);
    await expect(note.getBoundingClientRect().height).toBeGreaterThanOrEqual(lineHeight * 2);
  },
};

const shortcuts = [
  { action: "Open the command palette", keys: "⌘ K" },
  { action: "Find a page", keys: "/" },
  { action: "Show keyboard shortcuts", keys: "?" },
];

export const Horizontal: Story = {
  args: { "aria-label": "Shortcuts" },
  render: (args) => (
    <div className="w-96">
      <DescriptionList {...args} orientation="horizontal">
        {shortcuts.map(({ action, keys }) => (
          <DescriptionListItem key={action}>
            <DescriptionTerm tone="default">{action}</DescriptionTerm>
            <DescriptionDetails>{keys}</DescriptionDetails>
          </DescriptionListItem>
        ))}
      </DescriptionList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByLabelText("Shortcuts");
    await expect(list).toHaveAttribute("data-orientation", "horizontal");
    const listBox = list.getBoundingClientRect();
    const details = canvas.getAllByRole("definition");
    // Each term starts its row and its details end it, on the same line.
    for (const [index, term] of canvas.getAllByRole("term").entries()) {
      const termBox = term.getBoundingClientRect();
      const detailBox = details[index]!.getBoundingClientRect();
      await expect(termBox.left).toBe(listBox.left);
      await expect(detailBox.right).toBe(listBox.right);
      await expect(Math.abs(detailBox.top + detailBox.height / 2 - (termBox.top + termBox.height / 2))).toBeLessThan(2);
    }
    // A label that is the primary text takes the foreground colour, not the muted one.
    const term = canvas.getByText("Find a page");
    await expect(getComputedStyle(term).color).toBe(getComputedStyle(details[1]!).color);
  },
};
