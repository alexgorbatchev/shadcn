import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, waitFor, within } from "storybook/test";
import { ThreadFollowupSuggestions } from "../../../../assistant-ui/native/FollowupSuggestionsRow.js";
import { Thread } from "../../../../assistant-ui/native/Thread.js";
import { NativeRuntimeFixture } from "../helpers.js";
import { fixture_suggestionAdapter, fixture_generateSuggestions } from "../fixtures/suggestions.js";

const meta: Meta<typeof ThreadFollowupSuggestions> = {
  component: ThreadFollowupSuggestions,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/composer/FollowupSuggestionsRow",
  tags: ["autodocs", "test"],
  render: () => (
    <NativeRuntimeFixture options={{ adapters: { suggestion: fixture_suggestionAdapter } }}>
      <Thread />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const SendSuggestion: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    fixture_generateSuggestions.mockClear();
    await expect(canvas.queryByRole("button", { name: "Recovery Next steps" })).not.toBeInTheDocument();
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Inspect service status");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(fixture_generateSuggestions).toHaveBeenCalled());
    await waitFor(() => expect(canvas.getByText("Recovery")).toHaveAccessibleName("Recovery Next steps"));
    await userEvent.click(await canvas.findByRole("button", { name: "Recovery Next steps" }));
    await waitFor(() => expect(canvas.getByText("Explain the recovery steps")).toBeVisible());
    await expect(canvas.getByRole("textbox", { name: "Message input" })).toHaveValue("");
  },
};
