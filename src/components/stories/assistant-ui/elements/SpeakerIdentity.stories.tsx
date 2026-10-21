import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { SpeakerIdentity } from "../../../assistant-ui/elements/SpeakerIdentity.js";
const meta: Meta<typeof SpeakerIdentity> = {
  component: SpeakerIdentity,
  render: (args) => <SpeakerIdentity {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/SpeakerIdentity",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    turns: [{ id: "one", kind: "agent", name: "Reviewer", text: "The workspace is ready.", detail: "Source analysis" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Reviewer")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("The workspace is ready.")).toBeVisible());
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
