import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { VoiceOrb } from "../../../../assistant-ui/native/VoiceOrb.js";
import { NativeVoiceFixture } from "../fixtures/nz/NativeVoiceFixture.js";

const meta: Meta<typeof VoiceOrb> = {
  component: VoiceOrb,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/media-voice/VoiceOrb",
  tags: ["autodocs", "test"],
  render: (args) => (
    <NativeVoiceFixture>
      <VoiceOrb {...args} />
    </NativeVoiceFixture>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", { name: "Voice activity: idle" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Start voice session" }));
    await expect(canvas.getByRole("img", { name: "Voice activity: connecting" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Provider connected" }));
    await expect(canvas.getByRole("img", { name: "Voice activity: listening" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Provider speaking" }));
    await expect(canvas.getByRole("img", { name: "Voice activity: speaking" })).toBeVisible();
  },
};
export const NativeVolume: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start voice session" }));
    await userEvent.click(canvas.getByRole("button", { name: "Provider connected" }));
    const element = canvas.getByRole("img", { name: "Voice activity: listening" });
    if (!(element instanceof HTMLCanvasElement)) throw new Error("Expected the native canvas");
    const gl = element.getContext("webgl2");
    if (!gl) throw new Error("Expected native WebGL2");
    await waitFor(() => expect(gl.getParameter(gl.CURRENT_PROGRAM)).toBeInstanceOf(WebGLProgram));
    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    if (!(program instanceof WebGLProgram)) throw new Error("Expected the actual linked program");
    const amplitude = gl.getUniformLocation(program, "u_amplitude");
    if (!amplitude) throw new Error("Expected the actual amplitude uniform");
    const previous = gl.getUniform(program, amplitude);
    if (typeof previous !== "number") throw new Error("Expected a scalar amplitude");
    await userEvent.click(canvas.getByRole("button", { name: "Provider volume" }));
    await waitFor(() => expect(gl.getUniform(program, amplitude)).toBeGreaterThan(previous));
  },
};
export const Override: Story = {
  args: { state: "muted", variant: "warning" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img", { name: "Voice activity: muted" })).toBeVisible();
  },
};
export const CompactDark: Story = { ...Default, globals: { theme: "dark", density: "compact" }, play: Default.play };
export const ComfortableLight: Story = {
  ...Default,
  globals: { theme: "light", density: "comfortable" },
  play: Default.play,
};
