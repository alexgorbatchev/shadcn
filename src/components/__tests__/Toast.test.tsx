import { useState } from "react";
import { expect, test } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "../Button";
import { ToastToaster, createToastManager } from "../Toast";
import { DensityProvider } from "../DensityProvider";
import { DirectionProvider } from "../DirectionProvider";
import "../../../.storybook/preview.css";

test.each(["ltr", "rtl"] as const)("open Toast stack follows density in %s", async (direction) => {
  await page.viewport(390, 760);
  const manager = createToastManager();
  function Example() {
    const [compact, setCompact] = useState(true);
    return (
      <DensityProvider density={compact ? "compact" : "comfortable"}>
        <DirectionProvider direction={direction}>
          <ToastToaster toastManager={manager} timeout={0}>
            <Button
              onClick={() => {
                manager.add({ title: "First density toast" });
                manager.add({ title: "Latest density toast" });
              }}
            >
              Create stack
            </Button>
            <Button onClick={() => setCompact((value) => !value)}>Change density</Button>
          </ToastToaster>
        </DirectionProvider>
      </DensityProvider>
    );
  }
  const screen = await render(<Example />);
  await screen.getByRole("button", { name: "Create stack" }).click();
  const first = screen
    .getByRole("heading", { name: "First density toast" })
    .element()
    .closest<HTMLElement>('[data-slot="toast"]')!;
  const latest = screen
    .getByRole("heading", { name: "Latest density toast" })
    .element()
    .closest<HTMLElement>('[data-slot="toast"]')!;
  await expect.poll(() => latest.getBoundingClientRect().height).toBe(36);
  await screen.getByRole("button", { name: "Change density" }).click();
  for (const notification of [first, latest]) {
    await expect.poll(() => notification.getBoundingClientRect().height).toBe(60);
    expect(notification.isConnected).toBe(true);
    expect(getComputedStyle(notification).direction).toBe(direction);
    expect(notification.getBoundingClientRect().left).toBeGreaterThanOrEqual(16);
    expect(notification.getBoundingClientRect().right).toBeLessThanOrEqual(374);
  }
  await expect.poll(() => latest.getBoundingClientRect().top - first.getBoundingClientRect().bottom).toBeGreaterThan(0);
  await screen.getByRole("button", { name: "Change density" }).click();
  await expect.poll(() => first.getBoundingClientRect().height).toBe(36);
  await expect.poll(() => latest.getBoundingClientRect().height).toBe(36);
  manager.close();
  await expect.element(screen.getByRole("heading", { name: "Latest density toast" })).not.toBeInTheDocument();
});

test("high-priority Toast supports native keyboard entry and dismissal", async () => {
  const manager = createToastManager();
  const screen = await render(
    <ToastToaster toastManager={manager} timeout={0}>
      <Button
        onClick={() =>
          manager.add({
            title: "Connection lost",
            description: "Reconnect to continue.",
            priority: "high",
            type: "error",
          })
        }
      >
        Report error
      </Button>
    </ToastToaster>,
  );
  await screen.getByRole("button", { name: "Report error" }).click();
  await userEvent.keyboard("{F6}");
  await expect.element(page.getByRole("region", { name: "Notifications" })).toHaveFocus();
  await userEvent.tab();
  const notification = page.getByRole("alertdialog", { name: "Connection lost" });
  await expect.element(notification).toHaveFocus();
  await expect.element(notification).toHaveAccessibleDescription("Reconnect to continue.");
  await userEvent.keyboard("{Escape}");
  await expect.element(notification).not.toBeInTheDocument();
});

test("native pointer swipe dismisses Toast", async () => {
  await page.viewport(390, 760);
  const manager = createToastManager();
  let isClosed = false;
  const screen = await render(
    <ToastToaster toastManager={manager} timeout={0}>
      <Button
        onClick={() =>
          manager.add({
            title: "Swipe notification",
            onClose: () => {
              isClosed = true;
            },
          })
        }
      >
        Create notification
      </Button>
    </ToastToaster>,
  );
  await screen.getByRole("button", { name: "Create notification" }).click();
  const notification = page.getByRole("dialog", { name: "Swipe notification" });
  await expect.element(notification).toBeVisible();
  await expect.poll(() => notification.element().getAnimations().length).toBe(0);
  await commands.nativeSwipe('[data-slot="toast"]', 150, 0);
  await expect.poll(() => isClosed).toBe(true);
  await expect.element(notification).not.toBeInTheDocument();
});
