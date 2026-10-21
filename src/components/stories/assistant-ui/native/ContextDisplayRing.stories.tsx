import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContextDisplayRing } from "../../../assistant-ui/native/ContextDisplayRing.js";
import { NativeRuntimeFixture } from "./helpers.js";
const meta: Meta<typeof ContextDisplayRing> = {
  title: "shadcn-alexgorbatchev/assistant-ui/native/ContextDisplayRing",
  component: ContextDisplayRing,
  tags: ["autodocs", "test"],
  args: { modelContextWindow: 10000 },
  render: (args) => (
    <NativeRuntimeFixture
      initialMessages={[
        { role: "assistant", content: "Complete", metadata: { custom: { usage: { totalTokens: 7500 } } } },
      ]}
    >
      <ContextDisplayRing {...args} />
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const RuntimeUsage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Context usage" });
    await expect(trigger).toHaveTextContent("75%");
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
