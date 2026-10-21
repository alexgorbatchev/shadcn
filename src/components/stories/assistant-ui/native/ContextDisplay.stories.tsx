import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ContextDisplay } from "../../../assistant-ui/native/ContextDisplay.js";
import { ContextDisplayTrigger } from "../../../assistant-ui/elements/ContextDisplayTrigger.js";
import { ContextDisplayContent } from "../../../assistant-ui/elements/ContextDisplayContent.js";
import { NativeRuntimeFixture } from "./helpers.js";
const meta: Meta<typeof ContextDisplay> = {
  title: "shadcn-alexgorbatchev/assistant-ui/native/ContextDisplay",
  component: ContextDisplay,
  tags: ["autodocs", "test"],
  args: { modelContextWindow: 10000 },
  render: (args) => (
    <NativeRuntimeFixture
      initialMessages={[
        { role: "assistant", content: "Complete", metadata: { custom: { usage: { totalTokens: 4500 } } } },
      ]}
    >
      <ContextDisplay {...args}>
        <ContextDisplayTrigger aria-label="Context usage">Usage</ContextDisplayTrigger>
        <ContextDisplayContent />
      </ContextDisplay>
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

export { Default as ContextDisplay };
