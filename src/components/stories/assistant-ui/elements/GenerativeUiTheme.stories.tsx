import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { GenerativeUi } from "../../../assistant-ui/elements/GenerativeUi.js";
import { Button } from "../../../Button.js";
import { DensityProvider } from "../../../DensityProvider.js";
const meta: Meta<typeof GenerativeUi> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/GenerativeUiTheme",
  component: GenerativeUi,
  tags: ["test"],
  args: {
    node: {
      $type: "Form",
      $action: { type: "save" },
      children: [
        { $type: "Input", label: "Workspace", name: "workspace" },
        { $type: "Button", label: "Save plan", buttonStyle: "primary", submit: true },
      ],
    },
    context: { status: "done", dispatch: fn() },
  },
  render: function Render(args): ReactElement {
    const [isCompact, setIsCompact] = useState(false);
    return (
      <DensityProvider density={isCompact ? "compact" : "comfortable"}>
        <div className="flex flex-col gap-4">
          <GenerativeUi {...args} />
          <Button aria-label="Density reference">Native reference</Button>
          <Button onClick={() => setIsCompact(true)}>Compact density</Button>
        </div>
      </DensityProvider>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const NativeFormDensity: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Save plan" });
    const reference = canvas.getByRole("button", { name: "Density reference" });
    await expect(button.getBoundingClientRect().height).toBeCloseTo(reference.getBoundingClientRect().height, 0);
    const comfortableHeight = button.getBoundingClientRect().height;
    await userEvent.type(canvas.getByRole("textbox", { name: "Workspace" }), "docs");
    await userEvent.click(button);
    await expect(args.context?.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "save", $input: { workspace: "docs" } }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Compact density" }));
    await waitFor(() =>
      expect(button.getBoundingClientRect().height).toBeCloseTo(reference.getBoundingClientRect().height, 0),
    );
    await expect(button.getBoundingClientRect().height).toBeLessThan(comfortableHeight);
  },
};
