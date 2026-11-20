import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { FramedImage } from "../../image-viewer";
import { fixture_largeScreenshot, fixture_tallScreenshot } from "../fixtures";

const meta: Meta<typeof FramedImage> = {
  title: "@alexgorbatchev/shadcn/components/data-display/FramedImage",
  component: FramedImage,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'Import from `@alexgorbatchev/shadcn/image-viewer`. FramedImage shows a screenshot or other supplied image as evidence: a 1px edge in the `media-edge` token, which keeps at least 3:1 against the page in both themes, so a white image in the light theme and a black one in the dark theme still show where they end. `size="intrinsic"` (the default) keeps the image\'s own size within its column and at most 70% of the viewport height, scaled and never cropped; `size="fill"` fills its container\'s width, as in a row of thumbnails. It takes every `<img>` attribute.',
      },
    },
  },
  args: { src: fixture_largeScreenshot, alt: "Dashboard screenshot" },
  argTypes: { size: { control: "inline-radio", options: ["intrinsic", "fill"] } },
  render: (args) => (
    <div className="w-full max-w-3xl">
      <FramedImage {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof FramedImage>;

export const Intrinsic: Story = {
  play: async ({ canvasElement }) => {
    const image = within(canvasElement).getByRole("img", { name: "Dashboard screenshot" });
    await expect(getComputedStyle(image).borderTopWidth).toBe("1px");
    await waitFor(() => expect(image.getBoundingClientRect().width).toBeLessThanOrEqual(768));
  },
};

export const TallCappedAtSeventyPercentOfTheViewport: Story = {
  args: { src: fixture_tallScreenshot, alt: "Tall page" },
  play: async ({ canvasElement }) => {
    const image = within(canvasElement).getByRole("img", { name: "Tall page" });
    const viewportHeight = canvasElement.ownerDocument.documentElement.clientHeight;
    await waitFor(() => expect(image.getBoundingClientRect().height).toBeGreaterThan(0));
    const box = image.getBoundingClientRect();
    await expect(box.height).toBeLessThanOrEqual(viewportHeight * 0.7 + 1);
    await expect(box.width / box.height).toBeCloseTo(800 / 1200, 1);
  },
};

export const Fill: Story = {
  args: { size: "fill" },
  play: async ({ canvasElement }) => {
    const image = within(canvasElement).getByRole("img", { name: "Dashboard screenshot" });
    const column = image.parentElement!;
    await waitFor(() => expect(image.getBoundingClientRect().width).toBeCloseTo(column.clientWidth, 0));
  },
};
