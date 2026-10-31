import type { ReactElement } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { ThemeProvider, type IThemeProviderProps } from "../ThemeProvider";
import { Button } from "../Button";
import { DensityProvider } from "../DensityProvider";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../Dialog";
import { useTheme } from "../../hooks/useTheme";
import type { Density } from "../../density/types";
import "../../../.storybook/preview.css";

type ThemeExampleProps = Omit<IThemeProviderProps, "children"> & { density?: Density };

function PresetStatus(): ReactElement {
  const { preset, resolvedTheme } = useTheme();
  return (
    <output>
      {preset} / {resolvedTheme}
    </output>
  );
}

function ThemeExample({ density = "comfortable", ...props }: ThemeExampleProps): ReactElement {
  return (
    <ThemeProvider {...props}>
      <DensityProvider density={density}>
        <PresetStatus />
        <Button>Sample action</Button>
        <code className="font-mono">Sample code</code>
        <Dialog>
          <DialogTrigger render={<Button />}>Open theme dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Theme preview</DialogTitle>
            <Button>Portal action</Button>
          </DialogContent>
        </Dialog>
      </DensityProvider>
    </ThemeProvider>
  );
}

test.each(["light", "dark"] as const)(
  "switches design in %s mode, including an open portal, and restores the default",
  async (theme) => {
    const screen = await render(<ThemeExample forcedTheme={theme} />);
    const button = screen.getByRole("button", { name: "Sample action", includeHidden: true });
    const originalBackground = getComputedStyle(button.element()).backgroundColor;
    const originalRadius = getComputedStyle(button.element()).borderRadius;
    const originalFont = getComputedStyle(button.element()).fontFamily;
    const originalCodeFont = getComputedStyle(screen.getByText("Sample code").element()).fontFamily;
    const originalHeight = button.element().getBoundingClientRect().height;
    await screen.getByRole("button", { name: "Open theme dialog" }).click();
    const portalButton = page.getByRole("button", { name: "Portal action" });
    await expect.element(portalButton).toBeVisible();

    await screen.rerender(<ThemeExample forcedTheme={theme} preset="shadcn" />);
    await expect.element(screen.getByRole("status", { includeHidden: true })).toHaveTextContent(`shadcn / ${theme}`);
    await expect.poll(() => getComputedStyle(button.element()).backgroundColor).not.toBe(originalBackground);
    expect(Number.parseFloat(getComputedStyle(button.element()).borderRadius)).toBeGreaterThan(
      Number.parseFloat(originalRadius),
    );
    expect(getComputedStyle(button.element()).fontFamily).not.toBe(originalFont);
    expect(getComputedStyle(screen.getByText("Sample code").element()).fontFamily).toBe(originalCodeFont);
    expect(button.element().getBoundingClientRect().height).toBe(originalHeight);
    await expect
      .poll(
        () =>
          getComputedStyle(portalButton.element()).backgroundColor ===
          getComputedStyle(button.element()).backgroundColor,
      )
      .toBe(true);
    expect(getComputedStyle(portalButton.element()).fontFamily).toBe(getComputedStyle(button.element()).fontFamily);
    expect(getComputedStyle(portalButton.element()).borderRadius).toBe(getComputedStyle(button.element()).borderRadius);

    await screen.rerender(<ThemeExample forcedTheme={theme} />);
    await expect.element(screen.getByRole("status", { includeHidden: true })).toHaveTextContent(`devhost / ${theme}`);
    await expect.poll(() => getComputedStyle(button.element()).backgroundColor).toBe(originalBackground);
    expect(getComputedStyle(button.element()).borderRadius).toBe(originalRadius);
    expect(getComputedStyle(button.element()).fontFamily).toBe(originalFont);
    await expect.poll(() => getComputedStyle(portalButton.element()).backgroundColor).toBe(originalBackground);
  },
);

test("keeps the shadcn preset when controlled mode and density change", async () => {
  const setTheme = (): void => {};
  const screen = await render(<ThemeExample preset="shadcn" controlledTheme={{ theme: "light", setTheme }} />);
  const button = screen.getByRole("button", { name: "Sample action", includeHidden: true });
  const lightBackground = getComputedStyle(button.element()).backgroundColor;
  const comfortableHeight = button.element().getBoundingClientRect().height;
  await screen.rerender(
    <ThemeExample preset="shadcn" density="compact" controlledTheme={{ theme: "dark", setTheme }} />,
  );
  await expect.element(screen.getByRole("status", { includeHidden: true })).toHaveTextContent("shadcn / dark");
  await expect.poll(() => getComputedStyle(button.element()).backgroundColor).not.toBe(lightBackground);
  expect(button.element().getBoundingClientRect().height).toBeLessThan(comfortableHeight);
  await screen.rerender(<ThemeExample preset="shadcn" controlledTheme={{ theme: "system", setTheme }} />);
  expect(document.documentElement.dataset.theme === "dark").toBe(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  expect(document.documentElement.dataset.themePreset).toBe("shadcn");
});
