import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import Color from "colorjs.io";
import { TerminalAnsiFragment } from "../../../assistant-ui/elements/TerminalAnsiFragment.js";
import { parseTerminalLine } from "../../../assistant-ui/utils/parseTerminalLine.js";
import { Card, CardContent } from "../../../Card.js";

const fragment = parseTerminalLine("\u001b[31mNative ANSI text").fragments[0];
if (!fragment) throw new Error("Expected Anser to parse the fixture's visible text");
const meta: Meta<typeof TerminalAnsiFragment> = {
  component: TerminalAnsiFragment,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/TerminalAnsiFragment",
  tags: ["autodocs", "test"],
  args: { fragment },
  render: (args) => (
    <Card>
      <CardContent>
        <TerminalAnsiFragment {...args} />
      </CardContent>
    </Card>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const ForegroundContrast: Story = {
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText("Native ANSI text");
    const surface = text.closest('[data-slot="card"]');
    if (!surface) throw new Error("Expected the actual card backdrop");
    await waitFor(() => {
      const style = getComputedStyle(text);
      const background = new Color(getComputedStyle(surface).backgroundColor);
      const visible = background.mix(style.color, Number(style.opacity), { space: "srgb" });
      expect(visible.contrastWCAG21(background)).toBeGreaterThanOrEqual(4.5);
    });
  },
};
export const Dim: Story = {
  ...ForegroundContrast,
  args: { fragment: { ...fragment, isDim: true } },
  play: ForegroundContrast.play,
};
export const Light: Story = { ...ForegroundContrast, globals: { theme: "light" }, play: ForegroundContrast.play };
