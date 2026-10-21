import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { SettingsPanel } from "../../../../assistant-ui/elements/SettingsPanel.js";
const meta: Meta<typeof SettingsPanel> = {
  component: SettingsPanel,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/states-settings/SettingsPanel",
  render: (args) => <SettingsPanel {...args} />,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    model: "Fast",
    models: ["Fast", "Deep"],
    systemPrompt: "Review project source",
    temperature: 0.5,
    toggles: [{ key: "sources", label: "Include sources", detail: "Cite references", on: true }],
    onModelChange: fn(),
    onSystemPromptChange: fn(),
    onTemperatureChange: fn(),
    onToggle: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Deep" }));
    await expect(args.onModelChange).toHaveBeenCalledWith("Deep");
    await userEvent.click(canvas.getByRole("switch", { name: "Include sources" }));
    await expect(args.onToggle).toHaveBeenCalledWith("sources");
    await userEvent.type(canvas.getByRole("textbox", { name: "System prompt" }), "!");
    await expect(args.onSystemPromptChange).toHaveBeenCalledWith("Review project source!");
    await userEvent.click(canvas.getByRole("slider", { name: "Temperature" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onTemperatureChange).toHaveBeenCalledWith(0.6);
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const ReadOnly: Story = {
  ...Default,
  args: { ...Default.args, onToggle: undefined },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByRole("switch", { name: "Include sources" })).toHaveAttribute("aria-disabled", "true");
  },
};
