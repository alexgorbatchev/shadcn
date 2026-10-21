import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { Drawer, DrawerClose, DrawerOverlay, DrawerPortal, DrawerTrigger } from "../Drawer";
import { Button } from "../Button";
import { ResponsiveDrawerExample } from "../stories/helpers";
import { DirectionProvider } from "../DirectionProvider";
import { DensityProvider } from "../DensityProvider";
import { ThemeProvider } from "../ThemeProvider";
import "../../../.storybook/preview.css";

test.each([
  [0, "ltr"],
  [0, "rtl"],
  [1000, "ltr"],
  [1000, "rtl"],
] as const)("absolute backdrop covers the viewport after scrolling %ipx in %s", async (scroll, direction) => {
  await page.viewport(390, 760);
  const screen = await render(
    <DirectionProvider direction={direction}>
      <div dir={direction} className="h-[300dvh]">
        <Drawer modal={false}>
          <DrawerTrigger render={<Button className="fixed top-4" />}>Open backdrop example</DrawerTrigger>
          <DrawerPortal>
            <DrawerOverlay className="absolute" />
            <DrawerPrimitive.Viewport dir={direction} className="pointer-events-none fixed inset-0">
              <DrawerPrimitive.Popup className="pointer-events-auto fixed inset-x-0 bottom-0 bg-popover p-panel">
                <DrawerPrimitive.Title>Backdrop example</DrawerPrimitive.Title>
                <DrawerPrimitive.Description>Review the project after scrolling.</DrawerPrimitive.Description>
                <DrawerClose render={<Button />}>Close example</DrawerClose>
              </DrawerPrimitive.Popup>
            </DrawerPrimitive.Viewport>
          </DrawerPortal>
        </Drawer>
      </div>
    </DirectionProvider>,
  );
  window.scrollTo(0, scroll);
  await expect.poll(() => window.scrollY).toBe(scroll);
  const trigger = screen.getByRole("button", { name: "Open backdrop example" });
  await trigger.click();
  const dialog = screen.getByRole("dialog", { name: "Backdrop example" });
  await expect.element(dialog).toBeVisible();
  await expect.poll(() => getComputedStyle(dialog.element()).direction).toBe(direction);
  const backdrop = document.querySelector<HTMLElement>('[data-slot="drawer-overlay"]');
  expect(backdrop).not.toBeNull();
  await expect.poll(() => backdrop!.getBoundingClientRect().top).toBeLessThanOrEqual(0);
  await expect.poll(() => backdrop!.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(window.innerHeight);
  await expect.poll(() => backdrop!.getBoundingClientRect().left).toBeLessThanOrEqual(0);
  await expect
    .poll(() => backdrop!.getBoundingClientRect().right)
    .toBeGreaterThanOrEqual(document.documentElement.clientWidth);
  await expect.poll(() => document.elementFromPoint(2, 2)).toBe(backdrop);
  await expect.poll(() => document.elementFromPoint(document.documentElement.clientWidth - 2, 2)).toBe(backdrop);
  await dialog.getByRole("button", { name: "Close example" }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await expect.poll(() => window.scrollY).toBe(scroll);
  window.scrollTo(0, 0);
});

test.each([
  [390, 760, "ltr", "drawer-popup"],
  [390, 760, "rtl", "drawer-popup"],
  [1024, 900, "ltr", "dialog-content"],
  [1024, 900, "rtl", "dialog-content"],
] as const)("responsive profile at %i×%i in %s uses native %s", async (width, height, direction, slot) => {
  await page.viewport(width, height);
  const screen = await render(
    <ThemeProvider forcedTheme="dark">
      <DensityProvider density="compact">
        <DirectionProvider direction={direction}>
          <div dir={direction}>
            <ResponsiveDrawerExample />
          </div>
        </DirectionProvider>
      </DensityProvider>
    </ThemeProvider>,
  );
  const trigger = screen.getByRole("button", { name: "Edit responsive profile" });
  await trigger.click();
  const dialog = screen.getByRole("dialog", { name: "Responsive profile" });
  await expect.element(dialog).toBeVisible();
  await expect.element(dialog).toHaveAttribute("data-slot", slot);
  await expect.poll(() => getComputedStyle(dialog.element()).direction).toBe(direction);
  await expect.poll(() => dialog.element().getBoundingClientRect().left).toBeGreaterThanOrEqual(0);
  await expect.poll(() => dialog.element().getBoundingClientRect().right).toBeLessThanOrEqual(width);
  const input = dialog.getByRole("textbox", { name: "Profile name" });
  await input.fill("Alex");
  await userEvent.keyboard("{Enter}");
  await expect.element(dialog).not.toBeInTheDocument();
  await expect
    .element(screen.getByRole("status", { name: "Responsive saved profile" }))
    .toHaveTextContent("Saved Alex");
  await expect.element(trigger).toHaveFocus();
  await trigger.click();
  await expect.element(dialog).toBeVisible();
  await input.fill("Discarded");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  await expect
    .element(screen.getByRole("status", { name: "Responsive saved profile" }))
    .toHaveTextContent("Saved Alex");
  await expect.element(trigger).toHaveFocus();
});
