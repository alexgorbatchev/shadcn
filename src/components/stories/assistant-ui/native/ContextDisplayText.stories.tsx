import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContextDisplayText } from "../../../assistant-ui/native/ContextDisplayText.js";
import { NativeRuntimeFixture } from "./helpers.js";
const meta: Meta<typeof ContextDisplayText> = {
  title: "shadcn-alexgorbatchev/assistant-ui/native/ContextDisplayText",
  component: ContextDisplayText,
  tags: ["autodocs", "test"],
  args: { modelContextWindow: 10000 },
  render: (args) => (
    <NativeRuntimeFixture
      initialMessages={[
        { role: "assistant", content: "Complete", metadata: { custom: { usage: { totalTokens: 7500 } } } },
      ]}
    >
      <ContextDisplayText {...args} />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const RuntimeUsage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Context usage" });
    await expect(trigger).toHaveTextContent("7.5k / 10k");
    await userEvent.hover(trigger);
    await expect(await canvas.findByRole("dialog", { name: "Context usage" })).toHaveTextContent("75% full");
  },
};
export const ExplicitUsage: Story = {
  args: { usage: { totalTokens: 2000 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Context usage" }));
    await expect(await canvas.findByRole("dialog", { name: "Context usage" })).toHaveTextContent("20% full");
  },
};
