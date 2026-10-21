import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, spyOn, userEvent, waitFor, within } from "storybook/test";
import {
  Image,
  ImageActions,
  ImageContentFilterError,
  ImageFilename,
  ImageGenerating,
  ImagePreview,
  ImageRoot,
  ImageRegenerateButton,
  ImageSource,
} from "../../../../assistant-ui/elements/Image.js";
import { ImageActionSourceFixture } from "../helpers.js";
const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="teal"/><text x="20" y="90" fill="white">Image preview</text></svg>')}`;
const meta: Meta<typeof Image> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/media-voice/Image",
  component: Image,
  tags: ["autodocs", "test"],
  args: { type: "image", image, filename: "preview.svg", status: { type: "complete" } },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Zoom: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Zoom image" });
    await waitFor(() => expect(canvas.getByRole("img", { name: "preview.svg" })).toBeVisible());
    await userEvent.click(trigger);
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", { name: "Zoomed image" });
    await waitFor(() => expect(within(dialog).getByRole("img", { name: "preview.svg" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard(" ");
    const reopened = await page.findByRole("dialog");
    await waitFor(() => expect(reopened).toBeVisible());
    await userEvent.click(page.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Generating: Story = {
  args: { status: { type: "running" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Generating image…")).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Zoom image" })).not.toBeInTheDocument();
    await expect(canvas.getByText("preview.svg")).toBeVisible();
  },
};
export const Filtered: Story = {
  args: { status: { type: "incomplete", reason: "content-filter" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("The provider blocked this image.")).toBeVisible();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
export const LoadFailure: Story = {
  render: () => <ImagePreview src="data:image/png;base64,broken" />,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText("Image could not load")).toBeInTheDocument());
  },
};
export const Attribution: Story = {
  render: () => (
    <ImageRoot variant="muted" size="sm">
      <ImagePreview src={image} ratio="16:9" fit="cover" />
      <ImageFilename>Photo</ImageFilename>
      <ImageSource url="https://example.com/photo" />
    </ImageRoot>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: /example.com/ });
    await expect(link).toHaveAttribute("href", "https://example.com/photo");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  },
};
export const UnsafeAttribution: Story = {
  render: () => <ImageSource label="Untrusted source" url="javascript:alert(1)" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Untrusted source")).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const Regenerate: Story = {
  args: {},
  render: () => <ImageActions part={{ type: "image", image }} onRegenerate={regenerate} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Regenerate image" }));
    await expect(regenerate).toHaveBeenCalledTimes(1);
  },
};
const regenerate = fn(async () => {});
export const States: Story = {
  render: () => (
    <ImageRoot>
      <ImageGenerating />
      <ImageContentFilterError reason="Provider declined" />
    </ImageRoot>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Provider declined")).toBeVisible();
  },
};
export const SourceIconFailure: Story = {
  render: () => (
    <ImageRoot>
      <ImageSource label="Provider" url="https://example.com/photo" iconUrl="data:image/png;base64,broken" />
      <ImageSource />
      <ImageFilename />
    </ImageRoot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvasElement.querySelector("img")).toBeNull());
    await expect(canvas.getByText("P", { exact: true })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Provider (opens in a new tab)" })).toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(canvas.queryByTestId("ImageFilename")).not.toBeInTheDocument();
  },
};
export const PortraitPreview: Story = {
  render: () => <ImagePreview src={image} ratio="9:16" fit="contain" />,
  play: async ({ canvasElement }) => {
    const preview = within(canvasElement).getByRole("img", { name: "Image content" });
    await waitFor(() => expect(preview).toBeVisible());
    const bounds = preview.getBoundingClientRect();
    await expect(bounds.height).toBeGreaterThan(bounds.width);
  },
};
export const FourThreePreview: Story = {
  render: () => <ImagePreview src={image} ratio="4:3" fit="cover" />,
  play: async ({ canvasElement }) => {
    const preview = within(canvasElement).getByRole("img", { name: "Image content" });
    await waitFor(() => expect(preview).toBeVisible());
    const bounds = preview.getBoundingClientRect();
    await expect(bounds.width / bounds.height).toBeCloseTo(4 / 3);
  },
};
export const SquareFailure: Story = {
  render: () => <ImagePreview src="data:image/png;base64,broken" ratio="1:1" />,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText("Image could not load")).toBeInTheDocument());
    await expect(within(canvasElement).queryByRole("img")).not.toBeInTheDocument();
  },
};
const rejectRegeneration = fn(async () => {
  throw new Error("Provider rejected regeneration");
});
export const RegenerationFailure: Story = {
  render: () => <ImageActions part={{ type: "image", image }} onRegenerate={rejectRegeneration} />,
  play: async ({ canvasElement }) => {
    const regenerateButton = within(canvasElement).getByRole("button", { name: "Regenerate image" });
    await userEvent.click(regenerateButton);
    await expect(rejectRegeneration).toHaveBeenCalledOnce();
    await expect(await within(canvasElement).findByRole("alert")).toHaveTextContent(
      "Could not regenerate image: Provider rejected regeneration",
    );
    await waitFor(() => expect(regenerateButton).toBeEnabled());
  },
};
export const ClipboardFailureAndRetry: Story = {
  render: () => <ImageActions part={{ type: "image", image }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const write = spyOn(navigator.clipboard, "write")
      .mockRejectedValueOnce(new DOMException("Permission denied", "NotAllowedError"))
      .mockResolvedValueOnce();
    try {
      const copy = canvas.getByRole("button", { name: "Copy image" });
      await userEvent.click(copy);
      await expect(await canvas.findByRole("alert")).toHaveTextContent("Could not copy image: Permission denied");
      await expect(copy).toBeEnabled();
      await userEvent.click(copy);
      await expect(await canvas.findByRole("status")).toHaveTextContent("Image copied.");
      await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
      await expect(write).toHaveBeenCalledTimes(2);
      const item = write.mock.calls[1]?.[0][0];
      await expect(item).toBeInstanceOf(ClipboardItem);
      await expect(await (await item?.getType("image/svg+xml"))?.text()).toBe(
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="teal"/><text x="20" y="90" fill="white">Image preview</text></svg>',
      );
    } finally {
      write.mockRestore();
    }
  },
};
const regenerationRetry = fn<() => Promise<void>>();
export const RegenerationRetry: Story = {
  beforeEach: () => {
    regenerationRetry.mockReset().mockRejectedValueOnce("Provider offline").mockResolvedValueOnce();
  },
  render: () => <ImageRegenerateButton onRegenerate={regenerationRetry} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const regenerateButton = canvas.getByRole("button", { name: "Regenerate image" });
    await userEvent.click(regenerateButton);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Could not regenerate image: Provider offline");
    await userEvent.click(regenerateButton);
    await expect(regenerationRetry).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(canvas.queryByRole("alert")).not.toBeInTheDocument());
    await expect(regenerateButton).toBeEnabled();
  },
};
export const CopyPending: Story = {
  render: () => <ImageActions part={{ type: "image", image }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pending = Promise.withResolvers<void>();
    const write = spyOn(navigator.clipboard, "write").mockReturnValue(pending.promise);
    try {
      const copy = canvas.getByRole("button", { name: "Copy image" });
      await userEvent.click(copy);
      await expect(copy).toBeDisabled();
      await expect(copy).toHaveAttribute("aria-busy", "true");
      await expect(write).toHaveBeenCalledOnce();
      pending.resolve();
      await expect(await canvas.findByRole("status")).toHaveTextContent("Image copied.");
      await expect(copy).toBeEnabled();
    } finally {
      pending.resolve();
      write.mockRestore();
    }
  },
};
export const DownloadFailureAndRetry: Story = {
  render: () => <ImageActions part={{ type: "image", image }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const createObjectURL = URL.createObjectURL.bind(URL);
    const create = spyOn(URL, "createObjectURL")
      .mockImplementation(createObjectURL)
      .mockImplementationOnce(() => {
        throw new Error("Object URL unavailable");
      });
    const activation = spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    try {
      const download = canvas.getByRole("button", { name: "Download image" });
      await userEvent.click(download);
      await expect(await canvas.findByRole("alert")).toHaveTextContent(
        "Could not download image: Object URL unavailable",
      );
      await userEvent.click(download);
      await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
      await expect(create).toHaveBeenCalledTimes(2);
      await expect(activation).toHaveBeenCalledOnce();
      await expect(create.mock.calls[1]?.[0]).toBeInstanceOf(Blob);
    } finally {
      create.mockRestore();
      activation.mockRestore();
    }
  },
};
const sourceRegeneration = fn<() => Promise<void>>();
export const RegenerationSourceChange: Story = {
  render: () => <ImageActionSourceFixture onRegenerate={sourceRegeneration} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pending = Promise.withResolvers<void>();
    sourceRegeneration.mockReset().mockReturnValueOnce(pending.promise).mockResolvedValueOnce();
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Regenerate image" }));
      await expect(canvas.getByRole("button", { name: "Regenerate image" })).toBeDisabled();
      await userEvent.click(canvas.getByRole("button", { name: "Replace image" }));
      await expect(canvas.getByRole("button", { name: "Regenerate image" })).toBeEnabled();
      pending.reject(new Error("Old image failed"));
      await userEvent.hover(canvas.getByRole("button", { name: "Regenerate image" }));
      await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", { name: "Regenerate image" }));
      await expect(sourceRegeneration).toHaveBeenCalledTimes(2);
    } finally {
      pending.resolve();
    }
  },
};
export const CopySourceChange: Story = {
  render: () => <ImageActionSourceFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pending = Promise.withResolvers<void>();
    const write = spyOn(navigator.clipboard, "write").mockReturnValueOnce(pending.promise).mockResolvedValueOnce();
    try {
      await userEvent.click(canvas.getByRole("button", { name: "Copy image" }));
      await waitFor(() => expect(write).toHaveBeenCalledOnce());
      await expect(canvas.getByRole("button", { name: "Copy image" })).toBeDisabled();
      await userEvent.click(canvas.getByRole("button", { name: "Replace image" }));
      await expect(canvas.getByRole("button", { name: "Copy image" })).toBeEnabled();
      pending.reject("Old copy failed");
      await userEvent.click(canvas.getByRole("button", { name: "Copy image" }));
      await waitFor(() => expect(write).toHaveBeenCalledTimes(2));
      await expect(await canvas.findByRole("status")).toHaveTextContent("Image copied.");
      await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
      await expect(write).toHaveBeenCalledTimes(2);
    } finally {
      pending.resolve();
      write.mockRestore();
    }
  },
};

export const InvalidCopySource: Story = {
  render: () => <ImageActions part={{ type: "image", image: "data:image/png;base64,?" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Copy image" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Could not copy image: Image data could not be decoded.",
    );
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Copy image" })).toBeEnabled();
  },
};
