import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Button } from "../Button";
import { Kbd, KbdGroup } from "../Kbd";
import { ThemeProvider } from "../ThemeProvider";
import { Toolbar, ToolbarButton, ToolbarGroup } from "../Toolbar";
import "../../../.storybook/preview.css";

test("a button's keyboard hint sits at its trailing edge, past the label", async () => {
  const screen = await render(
    <ThemeProvider forcedTheme="light">
      <div style={{ width: 280 }}>
        <Button variant="outline" fullWidth align="start">
          Find a page…
          <KbdGroup data-testid="button-hint">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
        <Toolbar aria-label="Tools" orientation="vertical" variant="plain">
          <ToolbarGroup>
            <ToolbarButton>
              Search
              <Kbd data-testid="toolbar-hint">/</Kbd>
            </ToolbarButton>
          </ToolbarGroup>
        </Toolbar>
      </div>
    </ThemeProvider>,
  );
  for (const id of ["button-hint", "toolbar-hint"]) {
    const hint = screen.getByTestId(id).element();
    const control = hint.closest("button");
    expect(control).not.toBeNull();
    const controlBox = (control as HTMLElement).getBoundingClientRect();
    const padding = parseFloat(getComputedStyle(control as HTMLElement).paddingRight);
    const borderWidth = parseFloat(getComputedStyle(control as HTMLElement).borderRightWidth);
    expect(Math.abs(controlBox.right - padding - borderWidth - hint.getBoundingClientRect().right)).toBeLessThan(1);
  }
});
