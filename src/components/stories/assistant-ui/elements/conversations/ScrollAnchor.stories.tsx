import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ScrollAnchor } from "../../../../assistant-ui/elements/ScrollAnchor.js";
import { ScrollAnchorFixture } from "../fixtures/nz/ScrollAnchorFixture.js";
const meta: Meta<typeof ScrollAnchor> = {
  component: ScrollAnchor,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/conversations/ScrollAnchor",
  render: () => <ScrollAnchorFixture />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const messages = canvas.getByRole("log", { name: "Conversation messages" });
    await waitFor(() => expect(messages.scrollTop).toBeGreaterThan(0));
    messages.scrollTo({ top: 0 });
    await waitFor(() => expect(canvas.getByText("Following paused")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Append a message" }));
    await userEvent.click(canvas.getByRole("button", { name: "1 new message" }));
    await waitFor(() => expect(canvas.getByText("Following latest messages")).toBeVisible());
    await waitFor(() =>
      expect(messages.scrollTop + messages.clientHeight).toBeGreaterThanOrEqual(messages.scrollHeight - 1),
    );
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
