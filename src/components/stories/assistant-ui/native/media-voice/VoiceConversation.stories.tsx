import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VoiceConversation } from "../../../../assistant-ui/native/VoiceConversation.js";
import { NativeVoiceFixture } from "../fixtures/nz/NativeVoiceFixture.js";

const meta: Meta<typeof VoiceConversation> = {
  component: VoiceConversation,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/media-voice/VoiceConversation",
  tags: ["autodocs", "test"],
  render: () => (
    <NativeVoiceFixture>
      <VoiceConversation />
    </NativeVoiceFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Conversation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByTestId("VoiceConversation")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Start voice session" }));
    await expect(canvas.getByText("Connecting")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Provider connected" }));
    await expect(canvas.getByText("Listening")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Provider user transcript" }));
    await waitFor(() => expect(canvas.getByText("Inspect the workspace")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Provider assistant transcript" }));
    await waitFor(() => expect(canvas.getByText("The workspace has been inspected")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Turn the microphone off" }));
    await expect(canvas.getByText("Mic off")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Turn the microphone on" }));
    await userEvent.click(canvas.getByRole("button", { name: "End the call" }));
    await expect(canvas.queryByTestId("VoiceConversation")).not.toBeInTheDocument();
  },
};
export const FirstTranscriptDuringConnect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start with transcript" }));
    await waitFor(() => expect(canvas.getByText("First spoken turn")).toBeVisible());
  },
};
export const NewSession: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start with transcript" }));
    await waitFor(() => expect(canvas.getByText("First spoken turn")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "End the call" }));
    await userEvent.click(canvas.getByRole("button", { name: "Start voice session" }));
    await userEvent.click(canvas.getByRole("button", { name: "Provider connected" }));
    await expect(canvas.queryByText("First spoken turn")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Provider assistant transcript" }));
    await waitFor(() => expect(canvas.getByText("The workspace has been inspected")).toBeVisible());
  },
};
export const CompactDark: Story = {
  ...Conversation,
  globals: { theme: "dark", density: "compact" },
  play: Conversation.play,
};
export const ComfortableLight: Story = {
  ...Conversation,
  globals: { theme: "light", density: "comfortable" },
  play: Conversation.play,
};
