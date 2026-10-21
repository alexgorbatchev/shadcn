import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "../../Bubble";
import { Button } from "../../Button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../Collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../Tooltip";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "../../Popover";
import { TypesetDocumentExample, TypesetRhythmExample, TypesetStreamingExample } from "../helpers";

const meta: Meta<typeof Bubble> = {
  title: "@alexgorbatchev/shadcn/components/messaging/Bubble",
  component: Bubble,
  tags: ["autodocs", "test"],
  args: { role: "article", "aria-label": "Conversation reply" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"],
    },
    align: { control: "select", options: ["start", "end"] },
  },
  render: (args) => (
    <div className="flex w-80 flex-col">
      <Bubble {...args}>
        <BubbleContent>
          The request could not be completed. Review the logs and retry after resolving the reported error.
        </BubbleContent>
      </Bubble>
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const ReadReceipt: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <div className="w-80 p-4">
      <Tooltip>
        <Bubble {...args} variant="muted">
          <BubbleContent
            aria-label="Review sent. Read by Alex at 10:42"
            render={<TooltipTrigger render={<button type="button" />} />}
          >
            Review sent
          </BubbleContent>
        </Bubble>
        <TooltipContent>Read by Alex at 10:42</TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Review sent. Read by Alex at 10:42" });
    await expect(getComputedStyle(trigger).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tooltip = await within(canvasElement.ownerDocument.body).findByText("Read by Alex at 10:42");
    await waitFor(() => expect(tooltip).toBeVisible());
    await expect(trigger).toHaveAccessibleName("Review sent. Read by Alex at 10:42");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(tooltip).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const ErrorDetails: Story = {
  render: () => (
    <div className="w-80 p-4">
      <Popover>
        <Bubble variant="destructive">
          <BubbleContent render={<PopoverTrigger render={<button type="button" />} />}>
            Message delivery failed
          </BubbleContent>
        </Bubble>
        <PopoverContent>
          <PopoverTitle>Delivery details</PopoverTitle>
          <PopoverDescription>The recipient is offline. Retry when the connection returns.</PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Message delivery failed" });
    await expect(getComputedStyle(trigger).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const details = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Delivery details" });
    await waitFor(() => expect(details).toBeVisible());
    await expect(details).toHaveAccessibleDescription("The recipient is offline. Retry when the connection returns.");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(details).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

async function assertFramedReply(canvasElement: HTMLElement): Promise<void> {
  const reply = within(canvasElement).getByRole("article", { name: "Conversation reply" });
  const text = within(reply).getByText(
    "The request could not be completed. Review the logs and retry after resolving the reported error.",
  );
  await expect(text).toBeVisible();
  await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth + 1);
  await expect(reply.getBoundingClientRect().width).toBeLessThanOrEqual(257);
  await expect(Number.parseFloat(getComputedStyle(text).borderTopWidth)).toBeGreaterThan(0);
}

export const Default: Story = { play: async ({ canvasElement }) => assertFramedReply(canvasElement) };
export const Secondary: Story = {
  args: { variant: "secondary" },
  play: async ({ canvasElement }) => assertFramedReply(canvasElement),
};
export const Muted: Story = {
  args: { variant: "muted" },
  play: async ({ canvasElement }) => assertFramedReply(canvasElement),
};
export const Tinted: Story = {
  args: { variant: "tinted" },
  play: async ({ canvasElement }) => assertFramedReply(canvasElement),
};
export const Outline: Story = {
  args: { variant: "outline" },
  play: async ({ canvasElement }) => assertFramedReply(canvasElement),
};
export const Destructive: Story = {
  args: { variant: "destructive" },
  play: async ({ canvasElement }) => assertFramedReply(canvasElement),
};
export const Ghost: Story = {
  args: { variant: "ghost" },
  play: async ({ canvasElement }) => {
    const reply = within(canvasElement).getByRole("article", { name: "Conversation reply" });
    await expect(reply.getBoundingClientRect().width).toBeGreaterThan(257);
    await expect(reply.getBoundingClientRect().width).toBeLessThanOrEqual(320);
    await expect(
      getComputedStyle(
        within(reply).getByText(
          "The request could not be completed. Review the logs and retry after resolving the reported error.",
        ),
      ).padding,
    ).toBe("0px");
  },
};
export const Group: Story = {
  render: () => (
    <div className="w-80">
      <BubbleGroup role="region" aria-label="Sender replies">
        <Bubble>
          <BubbleContent>First reply</BubbleContent>
        </Bubble>
        <Bubble align="end">
          <BubbleContent>Second reply</BubbleContent>
        </Bubble>
      </BubbleGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("region", { name: "Sender replies" }).getBoundingClientRect();
    const first = within(canvasElement).getByText("First reply").getBoundingClientRect();
    const second = within(canvasElement).getByText("Second reply").getBoundingClientRect();
    await expect(first.left).toBeCloseTo(group.left, 0);
    await expect(second.right).toBeCloseTo(group.right, 0);
    await expect(second.top).toBeGreaterThan(first.bottom);
  },
};
export const RTL: Story = {
  render: () => (
    <div dir="rtl" className="flex w-80 flex-col">
      <Bubble align="end" role="article" aria-label="RTL reply">
        <BubbleContent>رسالة قصيرة</BubbleContent>
      </Bubble>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const reply = within(canvasElement).getByRole("article", { name: "RTL reply" });
    await expect(reply.getBoundingClientRect().left).toBeCloseTo(reply.parentElement!.getBoundingClientRect().left, 0);
    await expect(within(reply).getByText("رسالة قصيرة")).toBeVisible();
  },
};
export const Link: Story = {
  args: { variant: "outline" },
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent render={<a href="#bubble-details" />}>Read the report</BubbleContent>
    </Bubble>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Read the report" });
    await expect(link).toHaveAttribute("href", "#bubble-details");
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).boxShadow).not.toBe("none");
  },
};
const bubbleAction = fn();
const renderedAction = fn();
const contentRef = fn();
export const Action: Story = {
  render: () => (
    <Bubble variant="tinted">
      <BubbleContent onClick={bubbleAction} ref={contentRef} render={<button type="button" onClick={renderedAction} />}>
        Retry request
      </BubbleContent>
    </Bubble>
  ),
  play: async ({ canvasElement }) => {
    bubbleAction.mockClear();
    renderedAction.mockClear();
    const button = within(canvasElement).getByRole("button", { name: "Retry request" });
    await expect(contentRef).toHaveBeenCalledWith(button);
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button).boxShadow).not.toBe("none");
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(bubbleAction).toHaveBeenCalledTimes(2);
    await expect(renderedAction).toHaveBeenCalledTimes(2);
  },
};
function ReactionExample(): ReactElement {
  const [isLiked, setIsLiked] = useState(false);
  return (
    <Bubble variant="muted">
      <BubbleContent>The review is ready.</BubbleContent>
      <BubbleReactions side="top" align="start">
        <Button variant="secondary" size="xs" aria-pressed={isLiked} onClick={() => setIsLiked(!isLiked)}>
          Like {Number(isLiked)}
        </Button>
      </BubbleReactions>
    </Bubble>
  );
}
export const Reactions: Story = {
  render: () => (
    <div className="py-8">
      <ReactionExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Like 0" });
    await userEvent.click(button);
    await expect(canvas.getByRole("button", { name: "Like 1" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("button", { name: "Like 0" })).toHaveAttribute("aria-pressed", "false");
    await expect(button.getBoundingClientRect().top).toBeLessThan(
      canvas.getByText("The review is ready.").getBoundingClientRect().top,
    );
  },
};
export const DecorativeReactions: Story = {
  render: () => (
    <div className="py-8">
      <Bubble>
        <BubbleContent>Thanks for reviewing.</BubbleContent>
        <BubbleReactions role="img" aria-label="Reactions: thumbs up and rocket">
          <span>👍</span>
          <span>🚀</span>
        </BubbleReactions>
      </Bubble>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reactions = canvas.getByRole("img", { name: "Reactions: thumbs up and rocket" });
    await expect(reactions).toBeVisible();
    await expect(reactions.getBoundingClientRect().bottom).toBeGreaterThan(
      canvas.getByText("Thanks for reviewing.").getBoundingClientRect().bottom,
    );
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const RTLReactions: Story = {
  render: () => (
    <div dir="rtl" className="flex w-80 flex-col py-8">
      <Bubble role="article" aria-label="RTL conversation">
        <BubbleContent>هذه رسالة للمراجعة</BubbleContent>
        <BubbleReactions align="start" role="img" aria-label="Reaction: thumbs up">
          👍
        </BubbleReactions>
      </Bubble>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bubble = canvas.getByRole("article", { name: "RTL conversation" }).getBoundingClientRect();
    const reaction = canvas.getByRole("img", { name: "Reaction: thumbs up" }).getBoundingClientRect();
    await expect(reaction.left).toBeGreaterThan((bubble.left + bubble.right) / 2);
    await expect(reaction.right).toBeLessThan(bubble.right);
  },
};
export const RenderCallback: Story = {
  render: () => (
    <Bubble variant="outline">
      <BubbleContent
        render={(props, state) => <a {...props} href="#callback-details" aria-label={`Open ${state.slot}`} />}
      >
        Read details
      </BubbleContent>
    </Bubble>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Open bubble-content" });
    await expect(link).toHaveAttribute("href", "#callback-details");
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).boxShadow).not.toBe("none");
  },
};
export const CollapsibleReply: Story = {
  render: () => (
    <Bubble variant="muted">
      <BubbleContent>
        <Collapsible>
          <p>The review found two focus states to update.</p>
          <CollapsibleTrigger render={<Button variant="link" />}>Read details</CollapsibleTrigger>
          <CollapsibleContent>The menu needs separate hover and keyboard focus styling.</CollapsibleContent>
        </Collapsible>
      </BubbleContent>
    </Bubble>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Read details" });
    await userEvent.click(button);
    await expect(await canvas.findByText("The menu needs separate hover and keyboard focus styling.")).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(canvas.queryByText("The menu needs separate hover and keyboard focus styling.")).not.toBeInTheDocument(),
    );
  },
};
export const SpacedReactions: Story = {
  render: () => (
    <BubbleGroup className="gap-8">
      <Bubble>
        <BubbleContent>The review is ready.</BubbleContent>
        <BubbleReactions>
          <Button size="xs" variant="secondary">
            Like review
          </Button>
        </BubbleReactions>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>Next reply</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reaction = canvas.getByRole("button", { name: "Like review" }).getBoundingClientRect();
    const next = canvas.getByText("Next reply").getBoundingClientRect();
    await expect(reaction.bottom).toBeLessThanOrEqual(next.top);
  },
};

async function assertTypesetDocument(canvasElement: HTMLElement): Promise<void> {
  const doc = within(canvasElement).getByRole("article", { name: "Rendered document" });
  const body = within(doc).getByText("Semantic HTML follows the surrounding text size and palette.");
  const heading = within(doc).getByRole("heading", { name: "Readable responses" });
  await expect(Number.parseFloat(getComputedStyle(heading).fontSize)).toBeGreaterThan(
    Number.parseFloat(getComputedStyle(body).fontSize),
  );
  await expect(Number.parseFloat(getComputedStyle(heading).marginBlockStart)).toBe(0);
  await expect(getComputedStyle(within(doc).getByText("Read").parentElement!).listStyleType).toBe("lower-alpha");
  await expect(
    getComputedStyle(within(doc).getByRole("link", { name: "implementation notes" })).textDecorationLine,
  ).toBe("underline");
  const notes = within(doc).getByText("The document retains native disclosure and link behavior.");
  await expect(notes).not.toBeVisible();
  await userEvent.click(within(doc).getByText("Show implementation notes"));
  await expect(notes).toBeVisible();
  await expect(within(doc).getByRole("checkbox", { name: "Review complete" })).toBeChecked();
  await userEvent.click(within(doc).getByRole("checkbox", { name: "Review complete" }));
  await expect(within(doc).getByRole("checkbox", { name: "Review complete" })).not.toBeChecked();
  await expect(getComputedStyle(within(doc).getByRole("table", { name: "Review findings" })).display).toBe("table");
  await expect(getComputedStyle(within(doc).getByLabelText("Code sample")).direction).toBe("ltr");
}

export const Typeset: Story = {
  args: { variant: "ghost" },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <Bubble {...args} className="w-full">
        <BubbleContent className="w-full">
          <TypesetDocumentExample />
        </BubbleContent>
      </Bubble>
    </div>
  ),
  play: async ({ canvasElement }) => assertTypesetDocument(canvasElement),
};
export const TypesetRtl: Story = {
  ...Typeset,
  render: (args) => (
    <div dir="rtl" className="w-full max-w-2xl">
      <Bubble {...args} className="w-full">
        <BubbleContent className="w-full">
          <TypesetDocumentExample />
        </BubbleContent>
      </Bubble>
    </div>
  ),
  play: async (context) => {
    await assertTypesetDocument(context.canvasElement);
    const doc = within(context.canvasElement).getByRole("article", { name: "Rendered document" });
    const quote = within(doc).getByText("New content should preserve the earlier layout.").parentElement!;
    await expect(getComputedStyle(quote).direction).toBe("rtl");
    await expect(Number.parseFloat(getComputedStyle(quote).borderRightWidth)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(quote).borderLeftWidth)).toBe(0);
  },
};
export const TypesetRhythm: Story = {
  render: () => <TypesetRhythmExample />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const doc = within(canvas.getByRole("article", { name: "Reading rhythm" }));
    const first = doc.getByText("The reader controls text size, line spacing, and block spacing.");
    const second = doc.getByText("A second paragraph follows the same rhythm.");
    const before = {
      font: Number.parseFloat(getComputedStyle(first).fontSize),
      line: Number.parseFloat(getComputedStyle(first).lineHeight),
      gap: Number.parseFloat(getComputedStyle(second).marginBlockStart),
    };
    await expect(before.gap).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole("button", { name: "Roomy rhythm" }));
    await waitFor(() => {
      expect(Number.parseFloat(getComputedStyle(first).fontSize)).toBeGreaterThan(before.font);
      expect(Number.parseFloat(getComputedStyle(first).lineHeight)).toBeGreaterThan(before.line);
      expect(Number.parseFloat(getComputedStyle(second).marginBlockStart)).toBeGreaterThan(before.gap);
      expect(
        Number.parseFloat(getComputedStyle(doc.getByText("An explicit utility overrides the prose default.")).fontSize),
      ).toBeLessThan(Number.parseFloat(getComputedStyle(first).fontSize));
    });
  },
};
export const TypesetOptOut: Story = {
  render: () => (
    <div>
      <section aria-label="Unstyled reference">
        <h2>Reference heading</h2>
        <p>Reference paragraph</p>
      </section>
      <article className="typeset" aria-label="Opt-out document">
        <h2>Styled heading</h2>
        <div className="not-typeset">
          <h2>Class opt-out heading</h2>
          <div className="typeset [--typeset-size:2em] [--typeset-leading:2]">
            <h2>Nested class heading</h2>
            <p>Nested class paragraph</p>
          </div>
        </div>
        <div data-not-typeset>
          <h2>Attribute opt-out heading</h2>
          <div className="typeset [--typeset-size:2em] [--typeset-leading:2]">
            <h2>Nested attribute heading</h2>
            <p>Nested attribute paragraph</p>
          </div>
        </div>
      </article>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reference = getComputedStyle(canvas.getByRole("heading", { name: "Reference heading" })).fontSize;
    await expect(
      Number.parseFloat(getComputedStyle(canvas.getByRole("heading", { name: "Styled heading" })).fontSize),
    ).toBeGreaterThan(Number.parseFloat(reference));
    for (const name of [
      "Class opt-out heading",
      "Attribute opt-out heading",
      "Nested class heading",
      "Nested attribute heading",
    ]) {
      await expect(getComputedStyle(canvas.getByRole("heading", { name })).fontSize).toBe(reference);
    }
    const paragraph = getComputedStyle(canvas.getByText("Reference paragraph"));
    await expect(getComputedStyle(canvas.getByText("Nested class paragraph")).lineHeight).toBe(paragraph.lineHeight);
    await expect(getComputedStyle(canvas.getByText("Nested attribute paragraph")).lineHeight).toBe(
      paragraph.lineHeight,
    );
  },
};
export const TypesetTables: Story = {
  render: () => (
    <article className="typeset w-72" aria-label="Responsive findings">
      <table aria-label="Wrapped findings">
        <caption>Readable findings</caption>
        <thead>
          <tr>
            <th scope="col">Description</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A normal sentence wraps within the document width.</td>
            <td>Verified</td>
          </tr>
        </tbody>
      </table>
      <div className="typeset-scroll" role="region" aria-label="Wide findings" tabIndex={0}>
        <table aria-label="Scrollable findings">
          <thead>
            <tr>
              <th scope="col">Detailed description of the observed behavior</th>
              <th scope="col">Additional verification and supporting notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>The earlier columns remain available when scrolling horizontally.</td>
              <td>
                <a href="#final-findings">Open final findings</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p id="final-findings">Final findings are available.</p>
    </article>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const document = canvas.getByRole("article", { name: "Responsive findings" });
    const wrapped = canvas.getByRole("table", { name: "Wrapped findings" });
    await expect(getComputedStyle(wrapped).display).toBe("table");
    await expect(wrapped.getBoundingClientRect().width).toBeLessThanOrEqual(document.getBoundingClientRect().width + 1);
    const region = canvas.getByRole("region", { name: "Wide findings" });
    await expect(getComputedStyle(region).overflowX).toBe("auto");
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    await userEvent.tab();
    await expect(region).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Open final findings" })).toHaveFocus();
    await waitFor(() => expect(region.scrollLeft).toBeGreaterThan(0));
  },
};
export const TypesetStreaming: Story = {
  render: () => <TypesetStreamingExample />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByText("First completed block.");
    const second = canvas.getByText("Second completed block.");
    const cell = canvas.getByRole("cell", { name: "Initial finding" });
    await expect(Number.parseFloat(getComputedStyle(second).marginBlockStart)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(cell).borderTopWidth)).toBeGreaterThan(0);
    const before = {
      first: first.getBoundingClientRect().toJSON(),
      second: second.getBoundingClientRect().toJSON(),
      margin: getComputedStyle(second).marginBlockEnd,
      border: getComputedStyle(cell).borderTopWidth,
    };
    await userEvent.click(canvas.getByRole("button", { name: "Append response" }));
    await expect(canvas.getByText("Appended block.")).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "Appended finding" })).toBeVisible();
    await expect(first.getBoundingClientRect().toJSON()).toEqual(before.first);
    await expect(second.getBoundingClientRect().toJSON()).toEqual(before.second);
    await expect(getComputedStyle(second).marginBlockEnd).toBe(before.margin);
    await expect(getComputedStyle(cell).borderTopWidth).toBe(before.border);
  },
};
