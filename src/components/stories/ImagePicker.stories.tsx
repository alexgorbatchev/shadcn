import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { ImagePicker } from "../ImagePicker";
import { fixture_avatarImage } from "./fixtures";

const meta: Meta<typeof ImagePicker> = {
  title: "shadcn-alexgorbatchev/components/ImagePicker",
  component: ImagePicker,
  tags: ["autodocs", "test"],
  args: { src: fixture_avatarImage, label: "Cover artwork", onFileChange: fn(), onClear: fn() },
  render: function Example(args): ReactElement {
    const [file, setFile] = useState<File | null>();
    return (
      <ImagePicker
        {...args}
        file={file}
        onFileChange={(file) => {
          setFile(file);
          args.onFileChange(file);
        }}
        onClear={() => {
          setFile(null);
          args.onClear();
        }}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("img", { name: "Cover artwork" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Upload image" }));
    const bitmap = document.createElement("canvas");
    bitmap.width = 8;
    bitmap.height = 8;
    const file = new File([await (await fetch(bitmap.toDataURL("image/png"))).blob()], "cover.png", {
      type: "image/png",
    });
    await userEvent.upload(canvas.getByLabelText("Choose image file"), file);
    await expect(args.onFileChange).toHaveBeenCalledWith(file);
    await waitFor(() => expect(canvas.getByRole("img").getAttribute("src")?.startsWith("blob:")).toBe(true));
    await userEvent.click(canvas.getByRole("button", { name: "Unset image" }));
    await expect(args.onClear).toHaveBeenCalledOnce();
    await waitFor(() => expect(canvas.queryByRole("img")).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Unset image" })).toBeDisabled();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Upload image" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Unset image" })).toBeDisabled();
  },
};
