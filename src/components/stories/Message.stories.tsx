import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "../Message";
import { Avatar, AvatarFallback } from "../Avatar";
import { Bubble, BubbleContent } from "../Bubble";
import { Button } from "../Button";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "../Attachment";
import { FileTextIcon } from "lucide-react";

function Reply(args: ComponentProps<typeof Message>): ReactElement {
  return (
    <Message {...args}>
      <MessageAvatar role="img" aria-label="Sender avatar">
        <Avatar>
          <AvatarFallback>AG</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent aria-label="Reply content">
        <MessageHeader>Alex</MessageHeader>
        <Bubble variant="muted">
          <BubbleContent>The component review is ready.</BubbleContent>
        </Bubble>
        <MessageFooter>Delivered</MessageFooter>
      </MessageContent>
    </Message>
  );
}
const meta: Meta<typeof Message> = {
  title: "shadcn-alexgorbatchev/components/Message",
  component: Message,
  tags: ["autodocs", "test"],
  args: { role: "article", "aria-label": "Review reply" },
  argTypes: { align: { control: "select", options: ["start", "end"] } },
  render: (args) => (
    <div className="w-96">
      <Reply {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const FileReply: Story = {
  render: function Render(args) {
    const [isOpen, setOpen] = useState(false);
    return (
      <div className="flex w-80 flex-col gap-4">
        <Message {...args}>
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Alex</MessageHeader>
            <Attachment state="done" size="sm">
              <AttachmentTrigger aria-label="Open review.pdf" onClick={() => setOpen(true)} />
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>review.pdf</AttachmentTitle>
                <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
            <MessageFooter>Delivered</MessageFooter>
          </MessageContent>
        </Message>
        <output aria-label="Attachment result">{isOpen ? "Review opened" : "Review closed"}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open review.pdf" });
    await expect(canvas.getByText("PDF · 2.4 MB")).toBeVisible();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Attachment result")).toHaveTextContent("Review opened");
    await expect(trigger.getBoundingClientRect().bottom).toBeLessThan(
      canvas.getByText("Delivered").getBoundingClientRect().top,
    );
  },
};

async function assertAvatarAtSurface(canvasElement: HTMLElement): Promise<void> {
  const canvas = within(canvasElement);
  await waitFor(() =>
    expect(
      Math.abs(
        canvas.getByRole("img", { name: "Sender avatar" }).getBoundingClientRect().bottom -
          canvas.getByText("The component review is ready.").getBoundingClientRect().bottom,
      ),
    ).toBeLessThan(1),
  );
}
export const Start: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img", { name: "Sender avatar" }).getBoundingClientRect();
    const content = canvas.getByLabelText("Reply content").getBoundingClientRect();
    await expect(avatar.right).toBeLessThan(content.left);
    await assertAvatarAtSurface(canvasElement);
    await expect(canvas.getByText("Delivered")).toBeVisible();
  },
};
export const End: Story = {
  args: { align: "end" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img", { name: "Sender avatar" }).getBoundingClientRect();
    const content = canvas.getByLabelText("Reply content").getBoundingClientRect();
    const bubble = canvas.getByText("The component review is ready.").getBoundingClientRect();
    await expect(avatar.left).toBeGreaterThan(content.right);
    await expect(bubble.right).toBeCloseTo(content.right, 0);
    await expect(canvas.getByText("Alex").getBoundingClientRect().left).toBeCloseTo(content.left, 0);
    await assertAvatarAtSurface(canvasElement);
  },
};
export const RTL: Story = {
  args: { align: "end" },
  render: (args) => (
    <div dir="rtl" lang="ar" className="w-96">
      <Reply {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img", { name: "Sender avatar" }).getBoundingClientRect();
    const content = canvas.getByLabelText("Reply content").getBoundingClientRect();
    await expect(avatar.right).toBeLessThan(content.left);
    await assertAvatarAtSurface(canvasElement);
  },
};
export const WithoutFooter: Story = {
  render: (args) => (
    <div className="w-96">
      <Message {...args}>
        <MessageAvatar role="img" aria-label="Sender avatar">
          <Avatar>
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>The component review is ready.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await assertAvatarAtSurface(canvasElement);
    await expect(within(canvasElement).queryByText("Delivered")).not.toBeInTheDocument();
  },
};
export const TallFooter: Story = {
  render: (args) => (
    <div className="w-96">
      <Message {...args}>
        <MessageAvatar role="img" aria-label="Sender avatar">
          <Avatar>
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>The component review is ready.</BubbleContent>
          </Bubble>
          <MessageFooter className="flex-col items-start gap-2">
            <p>Delivered to the review queue.</p>
            <Button size="lg">Open review</Button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Open review" })).toBeVisible();
    await assertAvatarAtSurface(canvasElement);
  },
};
function DynamicFooter(): ReactElement {
  const [hasFooter, setHasFooter] = useState(true);
  const [isComfortable, setIsComfortable] = useState(false);
  return (
    <div className="flex w-96 flex-col gap-4">
      <Message density={isComfortable ? "comfortable" : "compact"}>
        <MessageAvatar role="img" aria-label="Sender avatar">
          <Avatar>
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>The component review is ready.</BubbleContent>
          </Bubble>
          {hasFooter && (
            <MessageFooter>
              <Button size="lg">Review details</Button>
            </MessageFooter>
          )}
        </MessageContent>
      </Message>
      <Button onClick={() => setHasFooter(!hasFooter)}>Toggle footer</Button>
      <Button onClick={() => setIsComfortable(!isComfortable)}>Toggle density</Button>
    </div>
  );
}
export const ChangingFooter: Story = {
  render: () => <DynamicFooter />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await assertAvatarAtSurface(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle density" }));
    await assertAvatarAtSurface(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle footer" }));
    await expect(canvas.queryByRole("button", { name: "Review details" })).not.toBeInTheDocument();
    await assertAvatarAtSurface(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle footer" }));
    await assertAvatarAtSurface(canvasElement);
  },
};
export const Group: Story = {
  render: () => (
    <div className="w-96">
      <MessageGroup role="region" aria-label="Replies">
        <Message>
          <MessageAvatar />
          <MessageContent>
            <Bubble>
              <BubbleContent>First reply</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <Bubble>
              <BubbleContent>Second reply</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      </MessageGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole("region", { name: "Replies" }));
    const first = group.getByText("First reply").getBoundingClientRect();
    const second = group.getByText("Second reply").getBoundingClientRect();
    await expect(first.left).toBeCloseTo(second.left, 0);
    await expect(second.top).toBeGreaterThan(first.bottom);
  },
};
const footerRef = fn();
function ActionFooter(): ReactElement {
  const [isLiked, setIsLiked] = useState(false);
  return (
    <Message>
      <MessageContent>
        <Bubble variant="ghost">
          <BubbleContent>A review with feedback.</BubbleContent>
        </Bubble>
        <MessageFooter ref={footerRef}>
          <Button variant="ghost" aria-pressed={isLiked} onClick={() => setIsLiked(!isLiked)}>
            {isLiked ? "Liked" : "Like reply"}
          </Button>
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}
export const Actions: Story = {
  render: () => <ActionFooter />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Like reply" })).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("button", { name: "Liked" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Like reply" })).toHaveAttribute("aria-pressed", "false");
    await expect(footerRef).toHaveBeenCalledWith(canvas.getByRole("button", { name: "Like reply" }).parentElement);
  },
};
function GrowingFooter(): ReactElement {
  const [hasDetails, setHasDetails] = useState(false);
  return (
    <div className="flex w-96 flex-col gap-4">
      <Message>
        <MessageAvatar role="img" aria-label="Sender avatar">
          <Avatar>
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>The component review is ready.</BubbleContent>
          </Bubble>
          <MessageFooter className="flex-col items-start gap-2">
            <p>Delivered</p>
            {hasDetails && <p>The reviewer has requested a second pass.</p>}
          </MessageFooter>
        </MessageContent>
      </Message>
      <Button onClick={() => setHasDetails(!hasDetails)}>Toggle details</Button>
    </div>
  );
}
export const GrowingFooterContent: Story = {
  render: () => <GrowingFooter />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await assertAvatarAtSurface(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle details" }));
    await expect(canvas.getByText("The reviewer has requested a second pass.")).toBeVisible();
    await assertAvatarAtSurface(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle details" }));
    await assertAvatarAtSurface(canvasElement);
  },
};
export const CustomFooterSpacing: Story = {
  render: () => (
    <div className="w-96">
      <Message density="compact">
        <MessageAvatar role="img" aria-label="Sender avatar">
          <Avatar>
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent className="gap-8">
          <Bubble>
            <BubbleContent>The component review is ready.</BubbleContent>
          </Bubble>
          <MessageFooter density="comfortable">
            <Button size="lg">Review details</Button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  ),
  play: async ({ canvasElement }) => assertAvatarAtSurface(canvasElement),
};
const standaloneClick = fn();
export const StandaloneFooter: Story = {
  render: () => (
    <MessageFooter role="group" aria-label="Reply actions">
      <Button onClick={standaloneClick}>Review details</Button>
    </MessageFooter>
  ),
  play: async ({ canvasElement }) => {
    standaloneClick.mockClear();
    await userEvent.click(
      within(within(canvasElement).getByRole("group", { name: "Reply actions" })).getByRole("button", {
        name: "Review details",
      }),
    );
    await expect(standaloneClick).toHaveBeenCalledTimes(1);
  },
};
export const PaddedContent: Story = {
  render: () => (
    <div className="w-96">
      <Message density="compact">
        <MessageAvatar role="img" aria-label="Sender avatar">
          <Avatar>
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent className="gap-8 p-4">
          <Bubble>
            <BubbleContent>The component review is ready.</BubbleContent>
          </Bubble>
          <MessageFooter className="mt-4">
            <Button>Review details</Button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  ),
  play: async ({ canvasElement }) => assertAvatarAtSurface(canvasElement),
};
