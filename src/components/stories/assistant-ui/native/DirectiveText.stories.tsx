import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DirectiveText } from "../../../assistant-ui/native/DirectiveText.js";
import { MessageMetadataFixture } from "./fixtures/metadata.js";

const meta: Meta<typeof DirectiveText> = {
  title: "shadcn-alexgorbatchev/assistant-ui/native/DirectiveText",
  component: DirectiveText,
  tags: ["autodocs", "test"],
  render: () => (
    <MessageMetadataFixture
      messages={[{ role: "assistant", content: "Ask :agent[Reviewer]{name=review} about :file[src/main.ts] please." }]}
      components={{ Text: DirectiveText }}
    />
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Mentions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("agent: Reviewer")).toHaveTextContent("Reviewer");
    await expect(canvas.getByLabelText("file: src/main.ts")).toHaveTextContent("src/main.ts");
    await expect(canvas.getByTestId("DirectiveText")).toHaveTextContent("Ask Reviewer about src/main.ts please.");
  },
};
export const PlainText: Story = {
  render: () => (
    <MessageMetadataFixture
      messages={[{ role: "assistant", content: "Literal :unknown[ and preserved text" }]}
      components={{ Text: DirectiveText }}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Literal :unknown[ and preserved text")).toBeVisible();
  },
};
