import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContextDisplayRuntimeRoot } from "../../../../assistant-ui/native/ContextDisplayRuntimeRoot.js";
import { ContextDisplayTrigger } from "../../../../assistant-ui/elements/ContextDisplayTrigger.js";
import { ContextDisplayContent } from "../../../../assistant-ui/elements/ContextDisplayContent.js";
import { NativeRuntimeFixture } from "../helpers.js";
const meta: Meta<typeof ContextDisplayRuntimeRoot> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/context/ContextDisplayRuntimeRoot",
  component: ContextDisplayRuntimeRoot,
  tags: ["autodocs", "test"],
  args: { modelContextWindow: 10000 },
  render: (args) => (
    <NativeRuntimeFixture
      initialMessages={[
        { role: "assistant", content: "Complete", metadata: { custom: { usage: { totalTokens: 4500 } } } },
      ]}
    >
      <ContextDisplayRuntimeRoot {...args}>
        <ContextDisplayTrigger aria-label="Context usage">Usage</ContextDisplayTrigger>
        <ContextDisplayContent />
      </ContextDisplayRuntimeRoot>
    </NativeRuntimeFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Context usage" }));
    await expect(await canvas.findByRole("dialog", { name: "Context usage" })).toHaveTextContent("45% full");
  },
};

export { Default as ContextDisplayRuntimeRoot };
