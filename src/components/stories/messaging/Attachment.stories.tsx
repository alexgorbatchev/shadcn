import type { ComponentProps, FormEvent, MouseEvent, ReactElement } from "react";
import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FileIcon, XIcon } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "../../Attachment";
import { Button } from "../../Button";
import { Spinner } from "../../Spinner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../Dialog";
import { fixture_attachmentImage } from "../fixtures";

function FileAttachment(args: ComponentProps<typeof Attachment>): ReactElement {
  return (
    <Attachment {...args}>
      <AttachmentMedia>
        <FileIcon aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>review.pdf</AttachmentTitle>
        <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  );
}
const meta: Meta<typeof Attachment> = {
  title: "@alexgorbatchev/shadcn/components/messaging/Attachment",
  component: Attachment,
  tags: ["autodocs", "test"],
  args: { role: "group", "aria-label": "Review attachment" },
  argTypes: {
    state: { control: "select", options: ["idle", "uploading", "processing", "error", "done"] },
    size: { control: "select", options: ["default", "sm", "xs"] },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
  render: (args) => <FileAttachment {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

async function assertUploadMotion(title: HTMLElement): Promise<void> {
  const isReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  await expect(getComputedStyle(title).animationName).toBe(["tw-shimmer", "none"][Number(isReducedMotion)]);
  await expect(title.getAnimations()).toHaveLength(Number(!isReducedMotion));
}

export const Done: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("review.pdf")).toBeVisible();
    await expect(canvas.getByText("PDF · 2.4 MB")).toBeVisible();
    await expect(getComputedStyle(canvas.getByText("review.pdf")).animationName).toBe("none");
  },
};
export const Idle: Story = {
  args: { state: "idle" },
  play: async ({ canvasElement }) => {
    await expect(
      getComputedStyle(within(canvasElement).getByRole("group", { name: "Review attachment" })).borderTopStyle,
    ).toBe("dashed");
  },
};
export const Uploading: Story = {
  args: { state: "uploading" },
  play: async ({ canvasElement }) => {
    const title = within(canvasElement).getByText("review.pdf");
    await assertUploadMotion(title);
    await expect(getComputedStyle(title).backgroundClip).toBe("text");
  },
};
export const Processing: Story = {
  args: { state: "processing" },
  render: (args) => (
    <Attachment {...args}>
      <AttachmentMedia>
        <Spinner aria-label="Processing attachment" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>review.pdf</AttachmentTitle>
        <AttachmentDescription>Extracting text…</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Processing attachment")).toBeVisible();
    await expect(canvas.getByText("Extracting text…")).toBeVisible();
    await assertUploadMotion(canvas.getByText("review.pdf"));
  },
};
const retryClick = fn();
export const Error: Story = {
  args: { state: "error" },
  render: (args) => (
    <Attachment {...args}>
      <AttachmentMedia>
        <FileIcon aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>review.pdf</AttachmentTitle>
        <AttachmentDescription role="alert">Upload failed. Try again.</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction size="sm" onClick={retryClick}>
          Retry
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    retryClick.mockClear();
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Upload failed. Try again.");
    await userEvent.click(canvas.getByRole("button", { name: "Retry" }));
    await expect(retryClick).toHaveBeenCalledTimes(1);
  },
};
export const Small: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Review attachment" }).getBoundingClientRect().height).toBeLessThan(
      50,
    );
    await expect(canvas.getByText("review.pdf")).toBeVisible();
  },
};
export const ExtraSmall: Story = {
  args: { size: "xs" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Review attachment" }).getBoundingClientRect().height).toBeLessThan(
      42,
    );
    await expect(canvas.getByText("review.pdf")).toBeVisible();
  },
};
export const Vertical: Story = {
  args: { orientation: "vertical", size: "xs" },
  render: (args) => (
    <Attachment {...args}>
      <AttachmentMedia role="img" aria-label="PDF preview">
        <FileIcon aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>review.pdf</AttachmentTitle>
        <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const media = canvas.getByRole("img", { name: "PDF preview" }).getBoundingClientRect();
    const root = canvas.getByRole("group", { name: "Review attachment" }).getBoundingClientRect();
    await expect(media.width).toBeGreaterThan(root.width * 0.8);
    await expect(media.height).toBeCloseTo(media.width, 0);
    await expect(canvas.getByText("review.pdf").getBoundingClientRect().top).toBeGreaterThan(media.bottom);
  },
};
function PreviewAttachment(): ReactElement {
  const [removeCount, setRemoveCount] = useState(0);
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Dialog>
        <Attachment>
          <AttachmentTrigger render={<DialogTrigger />} aria-label="Preview review.pdf" />
          <AttachmentMedia>
            <FileIcon aria-hidden="true" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>review.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove review.pdf" onClick={() => setRemoveCount(removeCount + 1)}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review preview</DialogTitle>
            <DialogDescription>Contents of review.pdf</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <output aria-label="Removal count">{removeCount}</output>
    </form>
  );
}
export const Preview: Story = {
  render: () => <PreviewAttachment />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Remove review.pdf" }));
    await expect(canvas.getByLabelText("Removal count")).toHaveTextContent("1");
    await expect(body.queryByRole("dialog")).not.toBeInTheDocument();
    const trigger = canvas.getByRole("button", { name: "Preview review.pdf" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = await body.findByRole("dialog", { name: "Review preview" });
    await waitFor(() => expect(within(dialog).getByText("Contents of review.pdf")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
const triggerClick = fn();
const formSubmit = fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
const triggerRef = fn();
export const NativeButton: Story = {
  render: () => (
    <form onSubmit={formSubmit}>
      <Attachment>
        <AttachmentTrigger aria-label="Open attachment" onClick={triggerClick} ref={triggerRef} />
        <AttachmentContent>
          <AttachmentTitle>review.pdf</AttachmentTitle>
        </AttachmentContent>
      </Attachment>
    </form>
  ),
  play: async ({ canvasElement }) => {
    triggerClick.mockClear();
    formSubmit.mockClear();
    const trigger = within(canvasElement).getByRole("button", { name: "Open attachment" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(triggerClick).toHaveBeenCalledTimes(2);
    await expect(formSubmit).not.toHaveBeenCalled();
    await expect(triggerRef).toHaveBeenCalledWith(trigger);
    await expect(getComputedStyle(trigger.parentElement!).boxShadow).not.toBe("none");
  },
};
const nativeLinkClick = fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
export const NativeLink: Story = {
  render: () => (
    <Attachment>
      <AttachmentTrigger render={<a href="#review" onClick={nativeLinkClick} />} aria-label="Download review.pdf" />
      <AttachmentContent>
        <AttachmentTitle>review.pdf</AttachmentTitle>
      </AttachmentContent>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    nativeLinkClick.mockClear();
    const link = within(canvasElement).getByRole("link", { name: "Download review.pdf" });
    await expect(link).not.toHaveAttribute("type");
    link.focus();
    await userEvent.keyboard("{Enter}");
    await expect(nativeLinkClick).toHaveBeenCalledTimes(1);
  },
};
const actionClassName = fn((state: ButtonPrimitive.State) => (state.disabled ? "opacity-50" : ""));
export const NativeActionCallback: Story = {
  render: () => (
    <Attachment>
      <AttachmentContent>
        <AttachmentTitle>review.pdf</AttachmentTitle>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Remove attachment" className={actionClassName}>
          <XIcon />
        </AttachmentAction>
        <AttachmentAction disabled aria-label="Retry attachment" className={actionClassName}>
          <FileIcon />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(actionClassName).toHaveBeenCalledWith({ disabled: false });
    await expect(actionClassName).toHaveBeenCalledWith({ disabled: true });
    await expect(canvas.getByRole("button", { name: "Retry attachment" })).toBeDisabled();
    await expect(getComputedStyle(canvas.getByRole("button", { name: "Retry attachment" })).opacity).toBe("0.5");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Remove attachment" })).toHaveFocus();
  },
};
export const ScrollableGroup: Story = {
  render: () => (
    <AttachmentGroup role="group" aria-label="Files" tabIndex={0} className="w-80">
      {["Review", "Notes", "Design", "Summary"].map((name) => (
        <Attachment key={name}>
          <AttachmentTrigger aria-label={`Open ${name}`} />
          <AttachmentContent>
            <AttachmentTitle>{name}.pdf</AttachmentTitle>
          </AttachmentContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Files" });
    await expect(group.scrollWidth).toBeGreaterThan(group.clientWidth);
    await expect(getComputedStyle(group).maskImage).not.toBe("none");
    await expect(getComputedStyle(group).scrollbarWidth).toBe("none");
    canvas.getByRole("button", { name: "Open Summary" }).focus();
    await waitFor(() => expect(group.scrollLeft).toBeGreaterThan(0));
  },
};
export const Image: Story = {
  globals: { theme: "dark" },
  args: { orientation: "vertical" },
  render: (args) => (
    <Attachment {...args}>
      <AttachmentMedia variant="image" aria-label="Image preview">
        <img src={fixture_attachmentImage} alt="Review image" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>review.svg</AttachmentTitle>
        <AttachmentDescription>SVG · Preview</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByRole("img", { name: "Review image" }) as HTMLImageElement;
    await waitFor(() => expect(image.naturalWidth).toBeGreaterThan(0));
    await expect(image.getBoundingClientRect().width).toBeCloseTo(image.getBoundingClientRect().height, 0);
    await expect(getComputedStyle(image).objectFit).toBe("cover");
    await expect(getComputedStyle(canvas.getByLabelText("Image preview")).opacity).toBe("1");
    const preview = canvasElement.ownerDocument.createElement("canvas");
    preview.width = preview.height = 32;
    const context = preview.getContext("2d");
    await expect(context).not.toBeNull();
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
    context?.drawImage(
      image,
      (image.naturalWidth - cropSize) / 2,
      (image.naturalHeight - cropSize) / 2,
      cropSize,
      cropSize,
      0,
      0,
      32,
      32,
    );
    const pixels = context?.getImageData(0, 0, 32, 32).data ?? [];
    const brightness: number[] = [];
    for (let index = 0; index < pixels.length; index += 4) {
      brightness.push((pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3);
    }
    await expect(Math.max(...brightness) - Math.min(...brightness)).toBeGreaterThan(100);
  },
};
export const ImageLight: Story = { ...Image, globals: { theme: "light" } };
export const ImageCompact: Story = { ...Image, globals: { theme: "dark", density: "compact" } };
export const UploadingImage: Story = {
  args: { ...Image.args, state: "uploading" },
  render: Image.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", { name: "Review image" })).toBeVisible();
    await expect(Number(getComputedStyle(canvas.getByLabelText("Image preview")).opacity)).toBeLessThan(1);
    await assertUploadMotion(canvas.getByText("review.svg"));
  },
};
const disabledClick = fn();
export const DisabledTrigger: Story = {
  render: () => (
    <Attachment>
      <AttachmentTrigger disabled aria-label="Open pending file" onClick={disabledClick} />
      <AttachmentContent>
        <AttachmentTitle>pending.pdf</AttachmentTitle>
      </AttachmentContent>
    </Attachment>
  ),
  play: async ({ canvasElement }) => {
    disabledClick.mockClear();
    const trigger = within(canvasElement).getByRole("button", { name: "Open pending file" });
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(disabledClick).not.toHaveBeenCalled();
  },
};
export const RTL: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <Attachment orientation="vertical" role="group" aria-label="Review image attachment">
        <AttachmentMedia role="img" aria-label="PDF preview">
          <FileIcon aria-hidden="true" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>review.pdf</AttachmentTitle>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove review.pdf">
            <XIcon />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("group", { name: "Review image attachment" }).getBoundingClientRect();
    const action = canvas.getByRole("button", { name: "Remove review.pdf" }).getBoundingClientRect();
    await expect(action.left - root.left).toBeLessThan(root.right - action.right);
    await expect(action.top).toBeGreaterThan(root.top);
  },
};
function UploadLifecycle(): ReactElement {
  const [state, setState] = useState<ComponentProps<typeof Attachment>["state"]>("uploading");
  return (
    <div className="flex flex-col gap-4">
      <FileAttachment state={state} />
      <Button onClick={() => setState("processing")}>Process file</Button>
      <Button onClick={() => setState("done")}>Finish upload</Button>
    </div>
  );
}
export const Lifecycle: Story = {
  render: () => <UploadLifecycle />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("review.pdf");
    await assertUploadMotion(title);
    await userEvent.click(canvas.getByRole("button", { name: "Process file" }));
    await assertUploadMotion(title);
    await userEvent.click(canvas.getByRole("button", { name: "Finish upload" }));
    await waitFor(() => expect(title.getAnimations()).toHaveLength(0));
    await expect(getComputedStyle(title).webkitTextFillColor).toBe(getComputedStyle(title).color);
  },
};
