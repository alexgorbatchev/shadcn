import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState, type ReactElement } from "react";
import { DragDropProvider } from "../DragDropProvider";
import { DragSource } from "../DragSource";
import { DropTarget } from "../DropTarget";
import { Button } from "../Button";

function Example(): ReactElement {
  const [result, setResult] = useState("Waiting for an item");
  return (
    <DragDropProvider>
      <div className="flex flex-col items-start gap-4">
        <DragSource
          type="application/x-example"
          data={{ title: "First light" }}
          labels={["First light"]}
          render={<Button variant="outline" />}
        >
          Drag item
        </DragSource>
        <DropTarget
          accept={["application/x-example"]}
          onDrop={() => setResult("Item moved")}
          render={<Button variant="outline" />}
        >
          Drop here
        </DropTarget>
        <Button onClick={() => setResult("Item moved")}>Move item without dragging</Button>
        <output aria-label="Drop result">{result}</output>
      </div>
    </DragDropProvider>
  );
}
const meta: Meta<typeof DragDropProvider> = {
  title: "shadcn-alexgorbatchev/components/DragDropProvider",
  component: DragDropProvider,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
const Default: Story = {
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Drag item" })).toHaveAttribute("draggable", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Move item without dragging" }));
    await expect(canvas.getByRole("status", { name: "Drop result" })).toHaveTextContent("Item moved");
  },
};
export { Default as DragDropProvider };
