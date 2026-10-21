import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import image from "../fixtures/sample.svg?url";
import { LinkPreview } from "../../../../assistant-ui/elements/LinkPreview.js";
const meta: Meta<typeof LinkPreview> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/sources-research/LinkPreview",
  component: LinkPreview,
  tags: ["autodocs", "test"],
  args: {
    href: "https://example.com/guide",
    title: "Read the guide",
    description: "A guide to service operations",
    image,
    imageAlt: "Guide illustration",
    favicon: image,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Card: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: /Read the guide/ })).toHaveAttribute(
      "href",
      "https://example.com/guide",
    );
    await expect(canvas.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
    await waitFor(() => expect(canvas.getByRole("img", { name: "Guide illustration" })).toBeVisible());
  },
};
export const Compact: Story = {
  args: { layout: "compact", title: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("link", { name: /example.com/ })).toBeVisible();
  },
};
export const UnsafeSource: Story = {
  args: { href: "javascript:alert(1)", image: undefined, favicon: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    await expect(canvas.getByText("Read the guide")).toBeVisible();
  },
};
export const BrokenImages: Story = {
  args: { image: "data:image/png;base64,broken", favicon: "data:image/png;base64,broken" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.queryByRole("img", { name: "Guide illustration" })).not.toBeInTheDocument());
    await expect(canvas.getByRole("link", { name: /Read the guide/ })).toBeVisible();
    await waitFor(() => expect(canvas.queryByTestId("LinkPreview--image")).not.toBeInTheDocument());
  },
};
