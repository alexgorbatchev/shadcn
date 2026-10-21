import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Timeline } from "../../../assistant-ui/elements/Timeline.js";
const meta: Meta<typeof Timeline> = {
  component: Timeline,
  render: (args) => <Timeline {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/Timeline",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    events: [
      { id: "one", when: "past", time: "09:00", title: "Analysis started" },
      { id: "two", when: "now", time: "09:01", title: "Reviewing results", detail: "Three files changed" },
    ],
    visibleCount: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Analysis started")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Three files changed")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
