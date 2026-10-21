import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, waitFor, within } from "storybook/test";
import { ModelSelector } from "../../../assistant-ui/native/ModelSelector.js";
import { Thread } from "../../../assistant-ui/native/Thread.js";
import { NativeRuntimeFixture } from "./helpers.js";
import { fixture_modelContextAdapter } from "./fixtures.js";

const meta: Meta<typeof ModelSelector> = {
  component: ModelSelector,
  title: "shadcn-alexgorbatchev/assistant-ui/native/ModelSelector",
  tags: ["autodocs", "test"],
  args: {
    models: [
      { id: "fast", name: "Fast" },
      { id: "reasoning", name: "Reasoning", efforts: true },
    ],
    defaultValue: "fast",
    defaultEffort: "medium",
  },
  render: (args) => (
    <NativeRuntimeFixture adapter={fixture_modelContextAdapter}>
      <ModelSelector {...args} />
      <Thread />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const ModelContext: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.click(await canvas.findByRole("option", { name: "Reasoning" }));
    await waitFor(() => expect(canvas.queryByRole("option")).not.toBeInTheDocument());
    {
      const input = await within(canvasElement.ownerDocument.body).findByRole("textbox", { name: "Message input" });
      await userEvent.clear(input);
      await userEvent.type(input, "Report selected model");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(canvas.getByText('{"modelName":"reasoning","reasoningEffort":"medium"}')).toBeVisible());
  },
};
