import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { JsonViewer } from "../JsonViewer";

const meta: Meta<typeof JsonViewer> = {
  title: "shadcn-alexgorbatchev/components/JsonViewer",
  component: JsonViewer,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Object: Story = {
  args: { value: { track: "First light", playlists: ["Warm up"] } },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "JSON" });
    await expect(input).toHaveValue('{\n  "track": "First light",\n  "playlists": [\n    "Warm up"\n  ]\n}');
    await expect(input).toHaveAttribute("readonly");
  },
};
export const Empty: Story = {
  args: { value: undefined, label: "Result", rows: 3 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox", { name: "Result" })).toHaveValue("null");
  },
};
