import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { CodeDiff } from "../../../assistant-ui/elements/CodeDiff.js";
import Color from "colorjs.io";
import { readTerminalBackground } from "../../../assistant-ui/utils/readTerminalBackground.js";
const meta: Meta<typeof CodeDiff> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/CodeDiff",
  component: CodeDiff,
  tags: ["autodocs", "test"],
  args: {
    filename: "client.ts",
    additions: 1,
    deletions: 1,
    cycle: 0,
    lines: [
      { kind: "context", text: "function connect() {" },
      { kind: "removed", text: "  return oldClient();" },
      { kind: "added", text: "  return newClient();" },
      { kind: "context", text: "}" },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Changes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("code")).toHaveTextContent("function connect()");
    await expect(canvas.getByRole("deletion")).toHaveTextContent("return oldClient();");
    const insertion = canvas.getByRole("insertion");
    await expect(insertion).toHaveTextContent("return newClient();");
    const line = insertion.parentElement;
    if (!line) throw new Error("Added line is missing");
    await waitFor(() => expect(getComputedStyle(line).opacity).toBe("1"));
    const background = readTerminalBackground(line);
    if (!background) throw new Error("Added line has no opaque background");
    await expect(new Color(getComputedStyle(insertion).color).contrastWCAG21(background)).toBeGreaterThanOrEqual(4.5);
    await expect(canvas.getByText("client.ts")).toBeVisible();
  },
};
export const Empty: Story = {
  args: { lines: [], additions: 0, deletions: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("code")).toBeEmptyDOMElement();
  },
};
export const CompactLight: Story = { ...Changes, globals: { theme: "light", density: "compact" }, play: Changes.play };
