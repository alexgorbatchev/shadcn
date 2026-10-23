import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { LayoutGuard } from "../../LayoutGuard";
import { assertLayoutContained } from "../../../../.storybook/assertLayoutContained";

const meta: Meta<typeof LayoutGuard> = {
  title: "@alexgorbatchev/shadcn/components/providers/LayoutGuard",
  component: LayoutGuard,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'ThemeProvider installs LayoutGuard in development. Mark a surface with data-layout-boundary="" to check both axes, or "x" / "y" for one axis. collectLayoutViolations(root, tolerance = 1) returns elements, edges, pixel overflow, and diagnostic messages for browser assertions. Checks include text ranges and clipped controls. Native scroll viewports permit displacement on their scrolling axes. Hidden/inert content and screen-reader labels are excluded; ellipsis text is allowed. Use data-layout-exclude="reason" only for intentional escape such as an edge-mounted resize rail. Portals are independent: mark their own surfaces. Finite layout animations settle before development errors; production installs no observer. Check every meaningful interaction state in tests. Axis-aligned DOM geometry does not measure shadows, pseudo-elements, or painted SVG paths.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

const Default: Story = {
  render: () => (
    <section data-layout-boundary="" aria-label="Contained panel" className="w-64 border p-4">
      <LayoutGuard />
      <h2>Contained panel</h2>
      <div className="h-24 overflow-x-hidden overflow-y-auto" role="region" aria-label="Scrollable items">
        {Array.from({ length: 20 }, (_, index) => (
          <p key={index}>Item {index + 1}</p>
        ))}
      </div>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const viewport = within(canvasElement).getByRole("region", { name: "Scrollable items" });
    viewport.scrollTop = 60;
    await expect(viewport.scrollTop).toBe(60);
    await assertLayoutContained(canvasElement);
  },
};
export { Default as LayoutGuardExample };
