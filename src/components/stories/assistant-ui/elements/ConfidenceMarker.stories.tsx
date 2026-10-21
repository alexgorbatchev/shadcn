import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ConfidenceMarker } from "../../../assistant-ui/elements/ConfidenceMarker.js";
const meta: Meta<typeof ConfidenceMarker> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ConfidenceMarker",
  component: ConfidenceMarker,
  tags: ["autodocs", "test"],
  args: {
    hoveredId: "",
    onHover: fn(),
    claims: [
      { id: "claim", text: "The component is accessible.", confidence: "grounded", basis: "Browser interaction tests" },
    ],
  },
  render: function Interactive(args) {
    const [hoveredId, setHoveredId] = useState(args.hoveredId);
    return (
      <ConfidenceMarker
        {...args}
        hoveredId={hoveredId}
        onHover={(id) => {
          args.onHover?.(id);
          setHoveredId(id);
        }}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Grounded: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const claim = canvas.getByRole("button", { name: "The component is accessible." });
    await userEvent.hover(claim);
    await expect(claim).toHaveAccessibleDescription("from a source · Browser interaction tests");
    await expect(args.onHover).toHaveBeenCalledWith("claim");
    await userEvent.unhover(claim);
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(claim).toHaveFocus();
    await expect(claim).toHaveAccessibleDescription("from a source · Browser interaction tests");
  },
};
export const Inferred: Story = {
  args: {
    claims: [
      {
        id: "claim",
        text: "The service may be restarting.",
        confidence: "inferred",
        basis: "Connection was interrupted",
      },
    ],
    hoveredId: "claim",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("inferred · Connection was interrupted");
  },
};
export const Uncertain: Story = {
  args: {
    claims: [
      {
        id: "claim",
        text: "The release includes this feature.",
        confidence: "uncertain",
        basis: "No release notes available",
      },
    ],
    hoveredId: "claim",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(
      "unverified · No release notes available",
    );
  },
};
