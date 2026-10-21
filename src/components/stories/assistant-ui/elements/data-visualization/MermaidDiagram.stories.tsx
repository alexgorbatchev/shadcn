import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { MermaidDiagram } from "../../../../assistant-ui/elements/MermaidDiagram.js";
import { PortalProvider } from "../../../../PortalProvider.js";
const meta: Meta<typeof MermaidDiagram> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/MermaidDiagram",
  component: MermaidDiagram,
  tags: ["autodocs", "test"],
  args: { code: "graph LR\n  A[Read] --> B[Build]\n  B --> C[Verify]" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const ExpandAndZoom: Story = {
  render: function Render(args) {
    const [container, setContainer] = useState<HTMLElement | null>(null);
    return (
      <section aria-label="Diagram portal" ref={setContainer}>
        <PortalProvider container={container}>
          <MermaidDiagram {...args} />
        </PortalProvider>
      </section>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Expand diagram" });
    await userEvent.click(trigger);
    const dialog = await within(canvas.getByRole("region", { name: "Diagram portal" })).findByRole("dialog", {
      name: "Diagram",
    });
    const controls = within(dialog);
    await userEvent.click(controls.getByRole("button", { name: "Zoom in" }));
    await expect(controls.getByRole("status", { name: "Zoom level" })).toHaveTextContent("125%");
    await userEvent.click(controls.getByRole("button", { name: "Reset zoom" }));
    await expect(controls.getByRole("status", { name: "Zoom level" })).toHaveTextContent("100%");
    await userEvent.click(controls.getByRole("button", { name: "Zoom out" }));
    await expect(controls.getByRole("status", { name: "Zoom level" })).toHaveTextContent("80%");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Streaming: Story = {
  args: { streaming: true, code: "graph LR\n A -->" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status", { name: "Rendering diagram" })).toBeVisible();
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const Invalid: Story = {
  args: { code: "graph LR\n A -->" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("diagram could not be rendered")).toBeVisible();
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
