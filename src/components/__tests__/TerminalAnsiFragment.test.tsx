import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import Color from "colorjs.io";
import { ThemeProvider } from "../ThemeProvider.js";
import { TerminalBlock } from "../assistant-ui/elements/TerminalBlock.js";
import "../../../.storybook/preview.css";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("remeasures ANSI contrast after the actual theme commits", async () => {
  const fixture = render(
    <ThemeProvider forcedTheme="dark">
      <TerminalBlock command="review" variant="ink" lines={["\u001b[31mred\u001b[0m"]} visibleCount={1} done />
    </ThemeProvider>,
  );
  await waitFor(() =>
    expect(
      new Color(getComputedStyle(screen.getByText("red")).color).contrastWCAG21(
        getComputedStyle(screen.getByTestId("TerminalBlock")).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(4.5),
  );
  await act(async () => {
    fixture.rerender(
      <ThemeProvider forcedTheme="light">
        <TerminalBlock command="review" variant="ink" lines={["\u001b[31mred\u001b[0m"]} visibleCount={1} done />
      </ThemeProvider>,
    );
  });
  await waitFor(() =>
    expect(
      new Color(getComputedStyle(screen.getByText("red")).color).contrastWCAG21(
        getComputedStyle(screen.getByTestId("TerminalBlock")).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(4.5),
  );
});

test("disconnects native theme observers when terminal fragments unmount", () => {
  const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect");
  const fixture = render(
    <ThemeProvider forcedTheme="dark">
      <TerminalBlock command="review" variant="ink" lines={["\u001b[31mred\u001b[0m"]} visibleCount={1} done />
    </ThemeProvider>,
  );
  expect(disconnect).not.toHaveBeenCalled();
  fixture.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

test("renders ANSI emphasis, reverse colors, concealed text and background-only runs", async () => {
  const view = render(
    <ThemeProvider forcedTheme="light">
      <TerminalBlock
        command="review"
        variant="ink"
        lines={[
          "\u001b[1;3;4;9;31;44mEmphasized output\u001b[0m",
          "\u001b[7;32;41mReversed output\u001b[0m",
          "\u001b[8mConcealed output\u001b[0m",
          "\u001b[2;44mBackground output\u001b[0m",
        ]}
        visibleCount={4}
        done
      />
    </ThemeProvider>,
  );
  const emphasized = view.getByText("Emphasized output");
  expect(getComputedStyle(emphasized).fontWeight).toBe("700");
  expect(getComputedStyle(emphasized).fontStyle).toBe("italic");
  expect(getComputedStyle(emphasized).textDecorationLine).toBe("underline line-through");
  expect(view.getByText("Concealed output")).not.toBeVisible();
  const reversed = view.getByText("Reversed output");
  await waitFor(() =>
    expect(
      new Color(getComputedStyle(reversed).color).contrastWCAG21(getComputedStyle(reversed).backgroundColor),
    ).toBeGreaterThanOrEqual(4.5),
  );
  const background = view.getByText("Background output");
  await waitFor(() =>
    expect(
      new Color(getComputedStyle(background).color).contrastWCAG21(getComputedStyle(background).backgroundColor),
    ).toBeGreaterThanOrEqual(4.5),
  );
});
