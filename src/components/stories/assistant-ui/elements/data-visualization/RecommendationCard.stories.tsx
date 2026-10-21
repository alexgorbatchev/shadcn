import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, userEvent, fn } from "storybook/test";
import { RecommendationCard } from "../../../../assistant-ui/elements/RecommendationCard.js";
const meta: Meta<typeof RecommendationCard> = {
  component: RecommendationCard,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/RecommendationCard",
  render: (args) => <RecommendationCard {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    state: "idle",
    question: "Use the existing workspace?",
    children: "The configured workspace contains the required packages.",
    confidenceLabel: "High confidence",
    acceptedLabel: "Workspace selected",
    onAccept: fn(),
    onAlternatives: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Accept" }));
    await expect(args.onAccept).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Alternatives" }));
    await expect(args.onAlternatives).toHaveBeenCalledOnce();
  },
};
export const Accepted: Story = {
  ...Default,
  args: { ...Default.args, state: "accepted" },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Workspace selected")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
