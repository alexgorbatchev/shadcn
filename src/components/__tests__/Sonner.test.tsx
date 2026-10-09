import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { useState } from "react";
import { Button } from "../Button";
import { Sonner, toast } from "../Sonner";
import { DensityProvider } from "../DensityProvider";
import { useSonner } from "../../hooks/useSonner";
import { DirectionProvider } from "../DirectionProvider";
import { ThemeProvider } from "../ThemeProvider";
import "../../../.storybook/preview.css";

test.each([false, true])("open notifications resize with density, expand=%s", async (expand) => {
  await page.viewport(390, 760);
  const id = `density-${expand}`;
  const dismissed: (string | number)[] = [];
  function Example() {
    const [compact, setCompact] = useState(true);
    const { toasts } = useSonner();
    return (
      <ThemeProvider forcedTheme="light">
        <DensityProvider density={compact ? "compact" : "comfortable"}>
          <Sonner id={id} expand={expand} position="top-center" duration={Infinity} closeButton />
          <div className="p-4 pt-64">
            <Button
              onClick={() => {
                for (const label of ["First", "Second", "Latest"]) {
                  toast.success(`${label} density notification`, {
                    id: `${id}-${label}`,
                    toasterId: id,
                    onDismiss: (notification) => dismissed.push(notification.id),
                  });
                }
              }}
            >
              Create stack
            </Button>
            <Button onClick={() => setCompact((value) => !value)}>Change density</Button>
            <output aria-label="Notification count">
              {toasts.filter((notification) => notification.toasterId === id).length}
            </output>
          </div>
        </DensityProvider>
      </ThemeProvider>
    );
  }
  const screen = await render(<Example />);
  await screen.getByRole("button", { name: "Create stack" }).click();
  const notifications = ["First", "Second", "Latest"].map((label) =>
    screen.getByText(`${label} density notification`).element().closest<HTMLElement>("[data-sonner-toast]")!,
  );
  const front = notifications[2]!;
  await expect.element(screen.getByRole("status", { name: "Notification count" })).toHaveTextContent("3");
  await expect.poll(() => front.getBoundingClientRect().height).toBe(36);
  await screen.getByRole("button", { name: "Change density" }).click();
  for (const notification of notifications) {
    await expect.poll(() => notification.getBoundingClientRect().height).toBe(60);
    expect(notification.isConnected).toBe(true);
  }
  if (expand) {
    await expect
      .poll(() => notifications[1]!.getBoundingClientRect().top - front.getBoundingClientRect().bottom)
      .toBeGreaterThanOrEqual(14);
    await expect
      .poll(() => notifications[0]!.getBoundingClientRect().top - notifications[1]!.getBoundingClientRect().bottom)
      .toBeGreaterThanOrEqual(14);
  }
  await screen.getByRole("button", { name: "Change density" }).click();
  for (const notification of notifications) {
    await expect.poll(() => notification.getBoundingClientRect().height).toBe(36);
    expect(notification.isConnected).toBe(true);
  }
  await page.elementLocator(front).getByRole("button", { name: "Close toast" }).click();
  await expect.poll(() => dismissed).toEqual([`${id}-Latest`]);
  await expect.element(screen.getByText("Latest density notification")).not.toBeInTheDocument();
  await expect.element(screen.getByRole("status", { name: "Notification count" })).toHaveTextContent("2");
  toast.dismiss(`${id}-First`);
  toast.dismiss(`${id}-Second`);
});

test("density changes preserve the running automatic-close timer", async () => {
  await page.viewport(390, 760);
  const closed: (string | number)[] = [];
  let checkpointReached = false;
  function Example() {
    const [compact, setCompact] = useState(true);
    return (
      <DensityProvider density={compact ? "compact" : "comfortable"}>
        <Sonner id="density-timer" position="top-center" />
        <Sonner id="density-clock" position="bottom-center" />
        <Button
          className="mt-64"
          onClick={() => {
            toast("Density timer", {
              id: "preserved-timer",
              toasterId: "density-timer",
              duration: 1000,
              onAutoClose: (notification) => closed.push(notification.id),
            });
            toast("Change density checkpoint", {
              toasterId: "density-clock",
              duration: 500,
              onAutoClose: () => {
                setCompact(false);
                toast("Timer deadline", {
                  toasterId: "density-clock",
                  duration: 750,
                  onAutoClose: () => {
                    checkpointReached = true;
                  },
                });
              },
            });
          }}
        >
          Start timer
        </Button>
      </DensityProvider>
    );
  }
  const screen = await render(
    <ThemeProvider forcedTheme="light">
      <Example />
    </ThemeProvider>,
  );
  await screen.getByRole("button", { name: "Start timer" }).click();
  await expect.poll(() => checkpointReached, { timeout: 5000 }).toBe(true);
  expect(closed).toEqual(["preserved-timer"]);
  await expect.element(screen.getByText("Density timer")).not.toBeInTheDocument();
});

test.each(["dark", "light"] as const)("close control follows the ghost button palette in %s", async (theme) => {
  await page.viewport(1200, 800);
  const screen = await render(
    <ThemeProvider forcedTheme={theme}>
      <div className="flex flex-col gap-4 p-32 text-popover-foreground">
        <Sonner id={theme} duration={Infinity} closeButton />
        <Button onClick={() => toast.success("Palette notification", { toasterId: theme })}>Create notification</Button>
        <Button variant="ghost" size="icon-sm" aria-label="Reference close">
          ×
        </Button>
      </div>
    </ThemeProvider>,
  );
  await screen.getByRole("button", { name: "Create notification" }).click();
  const close = screen.getByRole("button", { name: "Close toast" });
  const reference = screen.getByRole("button", { name: "Reference close" });
  await expect.element(close).toBeVisible();
  await expect
    .poll(() => getComputedStyle(close.element()).backgroundColor)
    .toBe(getComputedStyle(reference.element()).backgroundColor);
  await expect
    .poll(() => getComputedStyle(close.element()).borderColor)
    .toBe(getComputedStyle(reference.element()).borderColor);
  await expect.poll(() => getComputedStyle(close.element()).color).toBe(getComputedStyle(reference.element()).color);
  const idleBackground = getComputedStyle(reference.element()).backgroundColor;
  await reference.hover();
  await expect.poll(() => getComputedStyle(reference.element()).backgroundColor).not.toBe(idleBackground);
  await expect.poll(() => reference.element().getAnimations().length).toBe(0);
  const hoveredBackground = getComputedStyle(reference.element()).backgroundColor;
  const hoveredBorder = getComputedStyle(reference.element()).borderColor;
  const hoveredColor = getComputedStyle(reference.element()).color;
  await close.hover();
  await expect.poll(() => getComputedStyle(close.element()).backgroundColor).toBe(hoveredBackground);
  await expect.poll(() => getComputedStyle(close.element()).borderColor).toBe(hoveredBorder);
  await expect.poll(() => getComputedStyle(close.element()).color).toBe(hoveredColor);
  await close.click();
  await expect.element(screen.getByText("Palette notification")).not.toBeInTheDocument();
});

test.each(["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"] as const)(
  "mobile RTL notification fits the viewport at %s",
  async (position) => {
    await page.viewport(390, 760);
    const screen = await render(
      <ThemeProvider forcedTheme="dark">
        <DirectionProvider direction="rtl">
          <Sonner id={position} position={position} duration={Infinity} closeButton />
          <Button onClick={() => toast.success("Saved notification", { toasterId: position })}>
            Create notification
          </Button>
        </DirectionProvider>
      </ThemeProvider>,
    );
    await screen.getByRole("button", { name: "Create notification" }).click();
    const title = screen.getByText("Saved notification");
    await expect.element(title).toBeVisible();
    const notification = title.element().closest<HTMLElement>("[data-sonner-toast]")!;
    await expect.poll(() => notification.getBoundingClientRect().left).toBeGreaterThanOrEqual(16);
    await expect.poll(() => notification.getBoundingClientRect().right).toBeLessThanOrEqual(374);
    await screen.getByRole("button", { name: "Close toast" }).click();
    await expect.element(title).not.toBeInTheDocument();
  },
);

test.each(["ltr", "rtl"] as const)("native mobile offsets and desktop resizing work in %s", async (direction) => {
  await page.viewport(390, 760);
  const screen = await render(
    <ThemeProvider forcedTheme="light">
      <DirectionProvider direction={direction}>
        <Sonner
          id={direction}
          position="top-center"
          mobileOffset={{ left: 24, right: 40 }}
          duration={Infinity}
          closeButton
        />
        <Button onClick={() => toast.success("Offset notification", { toasterId: direction })}>
          Create notification
        </Button>
      </DirectionProvider>
    </ThemeProvider>,
  );
  await screen.getByRole("button", { name: "Create notification" }).click();
  const title = screen.getByText("Offset notification");
  await expect.element(title).toBeVisible();
  const notification = title.element().closest<HTMLElement>("[data-sonner-toast]")!;
  await expect.poll(() => notification.getBoundingClientRect().left).toBe(24);
  await expect.poll(() => notification.getBoundingClientRect().right).toBe(350);
  await page.viewport(600, 760);
  await expect.poll(() => notification.getBoundingClientRect().left).toBe(24);
  await expect.poll(() => notification.getBoundingClientRect().right).toBe(560);
  await page.viewport(601, 760);
  await expect.poll(() => notification.getBoundingClientRect().width).toBe(356);
  await expect.poll(() => notification.getBoundingClientRect().left).toBeCloseTo((601 - 356) / 2);
  const close = screen.getByRole("button", { name: "Close toast" });
  await expect
    .poll(() => {
      const titleBounds = title.element().getBoundingClientRect();
      const closeBounds = close.element().getBoundingClientRect();
      return Math.min(titleBounds.right, closeBounds.right) - Math.max(titleBounds.left, closeBounds.left);
    })
    .toBeLessThanOrEqual(0);
  await close.click();
  await expect.element(title).not.toBeInTheDocument();
});
