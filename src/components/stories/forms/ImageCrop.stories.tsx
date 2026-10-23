import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { useState } from "react";
import { ImageCrop, cropToCanvas, type Crop } from "../../image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "../../Button";
const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240'%3E%3Crect width='320' height='240' fill='%232468ac'/%3E%3C/svg%3E";
const meta: Meta<typeof ImageCrop> = {
  title: "@alexgorbatchev/shadcn/components/forms/ImageCrop",
  component: ImageCrop,
  tags: ["autodocs", "test"],
  args: { onChange: fn(), onComplete: fn() },
  render: (args) => {
    const [crop, setCrop] = useState<Crop>({ unit: "px", x: 20, y: 20, width: 100, height: 100 });
    return (
      <ImageCrop
        {...args}
        crop={crop}
        onChange={(pixel, percent) => {
          setCrop(pixel);
          args.onChange(pixel, percent);
        }}
      >
        <img src={image} alt="Image to crop" width={320} height={240} />
      </ImageCrop>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByRole("img")).toHaveProperty("complete", true));
    const area = c.getByRole("group", { name: "Use the arrow keys to move the crop selection area" });
    area.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onChange).toHaveBeenCalledWith(expect.objectContaining({ x: 21 }), expect.anything());
    await expect(args.onComplete).toHaveBeenCalled();
  },
};
export const Export: Story = {
  render: () => {
    const [size, setSize] = useState("");
    return (
      <>
        <img src={image} alt="Source" width={320} height={240} />
        <Button
          onClick={async (event) => {
            const source = event.currentTarget.parentElement?.querySelector("img");
            if (!source) return;
            const canvas = document.createElement("canvas");
            await cropToCanvas(source, canvas, { unit: "px", x: 20, y: 20, width: 100, height: 80 });
            setSize(`${canvas.width} × ${canvas.height}`);
          }}
        >
          Export crop
        </Button>
        <output aria-label="Export dimensions">{size}</output>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByRole("img")).toHaveProperty("complete", true));
    await userEvent.click(c.getByRole("button", { name: "Export crop" }));
    await waitFor(() => expect(c.getByLabelText("Export dimensions")).toHaveTextContent("100 × 80"));
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("img"));
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
