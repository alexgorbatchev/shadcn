import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { MathBlock } from "../../../assistant-ui/elements/MathBlock.js";
import { Frac } from "../../../assistant-ui/elements/Frac.js";
import { Sup } from "../../../assistant-ui/elements/Sup.js";
const meta: Meta<typeof MathBlock> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/MathBlock",
  component: MathBlock,
  tags: ["autodocs", "test"],
  args: {
    label: "Derivative",
    steps: [
      {
        expression: (
          <>
            f(x) = x<Sup>2</Sup>
          </>
        ),
        note: "Start with the square function",
      },
      {
        expression: (
          <>
            <Frac over="df" under="dx" /> = 2x
          </>
        ),
        note: "Apply the power rule",
      },
    ],
    visibleSteps: 2,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Complete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Derivative")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Start with the square function")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Apply the power rule")).toBeVisible());
  },
};
export const Streaming: Story = {
  args: { visibleSteps: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Start with the square function")).toBeVisible());
    await expect(canvas.queryByText("Apply the power rule")).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { label: undefined, visibleSteps: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("MathBlock")).toBeEmptyDOMElement();
  },
};
