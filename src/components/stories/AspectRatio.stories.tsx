import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { AspectRatio } from "../AspectRatio";
import { fixture_avatarImage } from "./fixtures";

const meta: Meta<typeof AspectRatio> = {
  title: "shadcn-alexgorbatchev/components/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs", "test"],
  args: { ratio: 16 / 9 },
  render: (args) => (
    <div className="w-80">
      <AspectRatio {...args} aria-label="Preview frame">
        <img src={fixture_avatarImage} alt="Media preview" className="absolute inset-0 size-full object-cover" />
      </AspectRatio>
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Widescreen: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole("img", { name: "Media preview" });
    await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0));
    const bounds = canvas.getByLabelText("Preview frame").getBoundingClientRect();
    await expect(bounds.width).toBeGreaterThan(0);
    await expect(bounds.width / bounds.height).toBeCloseTo(args.ratio, 2);
    await expect(image.getBoundingClientRect().width).toBeCloseTo(bounds.width, 1);
    await expect(image.getBoundingClientRect().height).toBeCloseTo(bounds.height, 1);
  },
};
export const Square: Story = { ...Widescreen, args: { ratio: 1 } };
export const Portrait: Story = { ...Widescreen, args: { ratio: 9 / 16 } };
export const RightToLeft: Story = { ...Widescreen, args: { ratio: 16 / 9, dir: "rtl" } };
