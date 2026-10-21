import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { cdp } from "vitest/browser";
import { ThemeProvider } from "../ThemeProvider.js";
import { VoiceOrb } from "../assistant-ui/elements/VoiceOrb.js";
import "../../../.storybook/preview.css";

afterEach(cleanup);

test("releases the actual WebGL program and buffer on unmount", async () => {
  const fixture = render(
    <ThemeProvider forcedTheme="dark">
      <VoiceOrb state="speaking" volume={0.5} />
    </ThemeProvider>,
  );
  const element = fixture.getByRole("img", { name: "Voice activity: speaking" });
  if (!(element instanceof HTMLCanvasElement)) throw new Error("Expected a native canvas");
  const gl = element.getContext("webgl2");
  if (!gl) throw new Error("Expected native WebGL2 in the acceptance browser");
  await waitFor(() => expect(gl.getParameter(gl.CURRENT_PROGRAM)).toBeInstanceOf(WebGLProgram));
  const program = gl.getParameter(gl.CURRENT_PROGRAM);
  const buffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
  if (!(program instanceof WebGLProgram) || !(buffer instanceof WebGLBuffer))
    throw new Error("Expected real allocated GPU resources");
  expect(gl.isProgram(program)).toBe(true);
  expect(gl.isBuffer(buffer)).toBe(true);
  fixture.unmount();
  expect(gl.isProgram(program)).toBe(false);
  expect(gl.isBuffer(buffer)).toBe(false);
});

test.each(["light", "dark"] as const)(
  "stops and resumes the %s renderer on native motion-preference changes",
  async (theme) => {
    const original = matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference";
    try {
      await cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
      });
      const fixture = render(
        <ThemeProvider forcedTheme={theme}>
          <VoiceOrb state="speaking" volume={0.5} />
        </ThemeProvider>,
      );
      const element = fixture.getByRole("img", { name: "Voice activity: speaking" });
      if (!(element instanceof HTMLCanvasElement)) throw new Error("Expected the native canvas renderer");
      const gl = element.getContext("webgl2");
      if (!gl) throw new Error("Expected native WebGL2 in the acceptance browser");
      await waitFor(() => expect(gl.getParameter(gl.CURRENT_PROGRAM)).toBeInstanceOf(WebGLProgram));
      const program = gl.getParameter(gl.CURRENT_PROGRAM);
      if (!(program instanceof WebGLProgram)) throw new Error("Expected an actual linked shader program");
      const clock = gl.getUniformLocation(program, "u_time");
      if (!clock) throw new Error("Expected the linked animation clock uniform");
      await waitFor(() => expect(gl.getUniform(program, clock)).toBeGreaterThan(0));
      await cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      await waitFor(() => {
        expect(gl.isContextLost()).toBe(false);
        expect(gl.getUniform(program, clock)).toBe(0);
      });
      await cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
      });
      await waitFor(() => {
        expect(gl.isContextLost()).toBe(false);
        expect(gl.getUniform(program, clock)).toBeGreaterThan(0);
      });
    } finally {
      await cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: original }],
      });
    }
  },
);
