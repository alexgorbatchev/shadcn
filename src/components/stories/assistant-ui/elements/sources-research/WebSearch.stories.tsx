import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { WebSearch } from "../../../../assistant-ui/elements/WebSearch.js";
const meta: Meta<typeof WebSearch> = {
  component: WebSearch,
  render: (args) => <WebSearch {...args} />,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/sources-research/WebSearch",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    query: "devhost documentation",
    results: [{ title: "Public guide", domain: "example.com" }],
    visibleResults: 1,
    searching: false,
    cycle: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Public guide")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("example.com")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
