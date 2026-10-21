import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import image from "../fixtures/sample.svg?url";
import { ImageGeneration } from "../../../../assistant-ui/elements/ImageGeneration.js";
const meta: Meta<typeof ImageGeneration> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/media-voice/ImageGeneration",
  component: ImageGeneration,
  tags: ["autodocs", "test"],
  args: { prompt: "A preview illustration", generating: false, image, onRegenerate: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Generated: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("320 × 180")).toBeVisible());
    await expect(canvas.getByRole("img", { name: "A preview illustration" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Regenerate image" }));
    await expect(args.onRegenerate).toHaveBeenCalledTimes(1);
  },
};
export const Generating: Story = {
  args: { generating: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Generating image");
    await expect(canvas.getByRole("button", { name: "Regenerate image" })).toBeDisabled();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { image: undefined, onRegenerate: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No image available")).toBeVisible();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
