import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { NumberRollPart } from "../../../../assistant-ui/elements/NumberRollPart.js";
import { NumberRollPartScene } from "../fixtures/numberRoll.js";

const meta: Meta<typeof NumberRollPart> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/NumberRollPart",
  component: NumberRollPart,
  tags: ["autodocs", "test"],
  args: { part: { type: "symbol", key: "currency", value: "$" }, direction: -1, duration: 300 },
  render: (args) => <NumberRollPartScene {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const column = canvas.getByTestId("NumberRollPart");
    await expect(column).toHaveTextContent("$");
    await userEvent.click(canvas.getByRole("button", { name: "Remove column" }));
    await waitFor(() => expect(column.getBoundingClientRect().width).toBe(0));
  },
};
export { Default as NumberRollPart };
