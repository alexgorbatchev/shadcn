import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import image from "../fixtures/sample.svg?url";
import { ImageGallery } from "../../../../assistant-ui/elements/ImageGallery.js";
const meta: Meta<typeof ImageGallery> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/media-voice/ImageGallery",
  component: ImageGallery,
  tags: ["autodocs", "test"],
  args: {
    images: [
      {
        id: "first",
        src: image,
        alt: "First preview",
        caption: "First caption",
        source: { label: "Source", url: "https://example.com/image" },
      },
      { id: "second", src: image, alt: "Second preview", source: { label: "Untrusted", url: "javascript:alert(1)" } },
      { id: "third", src: image, alt: "Third preview" },
    ],
    maxVisible: 2,
    onOpen: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Navigation: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open image: First preview" });
    await expect(canvas.getByText("+1")).toBeVisible();
    await userEvent.click(trigger);
    await expect(args.onOpen).toHaveBeenCalledWith("first");
    let dialog = within(await page.findByRole("dialog", { name: "Image 1 of 3" }));
    await expect(dialog.getByRole("button", { name: "Previous image" })).toBeDisabled();
    await expect(dialog.getByRole("link", { name: /Source/ })).toHaveAttribute("rel", "noopener noreferrer");
    await userEvent.click(dialog.getByRole("button", { name: "Next image" }));
    dialog = within(await page.findByRole("dialog", { name: "Image 2 of 3" }));
    await expect(dialog.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.keyboard("{ArrowRight}");
    dialog = within(await page.findByRole("dialog", { name: "Image 3 of 3" }));
    await expect(dialog.getByRole("button", { name: "Next image" })).toBeDisabled();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(await page.findByRole("dialog", { name: "Image 2 of 3" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Broken: Story = {
  args: { images: [{ id: "bad", src: "data:image/png;base64,broken", alt: "Unavailable preview" }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Image unavailable")).toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: "Open image: Unavailable preview" }));
    const page = within(canvasElement.ownerDocument.body);
    const dialog = within(await page.findByRole("dialog"));
    await expect(dialog.getByText("Image unavailable")).toBeInTheDocument();
    await expect(dialog.getByRole("button", { name: "Next image" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
  },
};
export const Empty: Story = {
  args: { images: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
    await expect(within(canvasElement).queryByTestId("ImageGallery")).not.toBeInTheDocument();
  },
};
