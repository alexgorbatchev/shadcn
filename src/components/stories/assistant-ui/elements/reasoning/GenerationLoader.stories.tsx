import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { GenerationLoader } from "../../../../assistant-ui/elements/GenerationLoader.js";
import { GenerationLoaderFixture } from "../fixtures/nz/GenerationLoaderFixture.js";
const meta: Meta<typeof GenerationLoader> = {
  component: GenerationLoader,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/reasoning/GenerationLoader",
  args: { label: "Generating response", tick: 0 },
  render: (args) => <GenerationLoader {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Dots: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Generating response");
  },
};
export const Squares: Story = { ...Dots, args: { variant: "squares" }, play: Dots.play };
export const Rounded: Story = { ...Dots, args: { variant: "rounded" }, play: Dots.play };
export const AdvancedFrame: Story = { ...Dots, args: { tick: 9 }, play: Dots.play };
export const ProgressingFrames: Story = {
  render: () => <GenerationLoaderFixture />,
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    const cell = canvas.getByTestId("GenerationLoader--cell-0");
    await expect(cell).toBeVisible();
    const opacity = Number.parseFloat(getComputedStyle(cell).opacity);
    await userEvent.click(canvas.getByRole("button", { name: "Advance generation frame" }));
    await waitFor(() => expect(Number.parseFloat(getComputedStyle(cell).opacity)).toBeLessThan(opacity));
  },
};
export const LightTheme: Story = { ...Dots, globals: { theme: "light" }, play: Dots.play };
export const DarkTheme: Story = { ...Dots, globals: { theme: "dark" }, play: Dots.play };
