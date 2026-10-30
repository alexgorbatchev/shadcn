import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { RecommendationCard } from "../../../../assistant-ui/elements/RecommendationCard.js";
const meta: Meta<typeof RecommendationCard> = {
  component: RecommendationCard,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/RecommendationCard",
  render: (args) => <RecommendationCard {...args} />,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'RecommendationCard presents one suggestion. Each action renders only when its handler is supplied: `onReject` (`rejectLabel`, default "Not this"), `onAlternatives` (`alternativesLabel`, default "Alternatives"), and `onAccept` (`acceptLabel`, default "Accept"). The `accepted` and `rejected` states replace the actions with `acceptedLabel` or `rejectedLabel` and keep keyboard focus on the card. Omit `confidenceLabel` to hide the confidence indicator; `fullWidth` spans the container.',
      },
    },
  },
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
    await expect(canvas.queryByRole("button", { name: "Not this" })).not.toBeInTheDocument();
  },
};
export const CustomActions: Story = {
  args: {
    ...Default.args,
    question: "Harbor noodle bar",
    children: "Open now, 8 minutes away on foot.",
    confidenceLabel: undefined,
    acceptLabel: "Go",
    alternativesLabel: "More like this",
    rejectLabel: "Not this",
    onReject: fn(),
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[560px]">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvasElement.querySelector("[data-slot=recommendation-card]")!;
    await expect(card.getBoundingClientRect().width).toBeCloseTo(560, 0);
    await expect(canvas.queryByText("High confidence")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Not this" }));
    await expect(args.onReject).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "More like this" }));
    await expect(args.onAlternatives).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Go" }));
    await expect(args.onAccept).toHaveBeenCalledOnce();
  },
};
export const WithoutActions: Story = {
  args: { ...Default.args, onAccept: undefined, onAlternatives: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
    await expect(within(canvasElement).getByText("High confidence")).toBeVisible();
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
export const Rejected: Story = {
  args: { ...CustomActions.args, state: "rejected", rejectedLabel: "Won't suggest this again" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Won't suggest this again")).toBeVisible());
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
