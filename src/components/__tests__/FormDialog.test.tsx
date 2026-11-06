import { AnimationFrame } from "@base-ui/utils/useAnimationFrame";
import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import { Button } from "../Button";
import { Input } from "../Input";
import { FormDialogFocusFixture } from "./fixtures";
import "../../../.storybook/preview.css";

afterEach(cleanup);

function holdAnimationFrames() {
  const nativeRequest = window.requestAnimationFrame.bind(window);
  const nativeCancel = window.cancelAnimationFrame.bind(window);
  const queued = new Map<number, VoidFunction>();
  const restoration = vi.spyOn(AnimationFrame.prototype, "request");
  const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    // Keep native frame delivery and timestamps; delay only execution of the real callback.
    const id = nativeRequest((timestamp) => queued.set(id, () => callback(timestamp)));
    return id;
  });
  const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    queued.delete(id);
    nativeCancel(id);
  });
  const release = () => {
    const callbacks = [...queued.values()];
    queued.clear();
    callbacks.forEach((callback) => callback());
  };
  const delivered = () => new Promise<void>((resolve) => nativeRequest(() => resolve()));

  return {
    queued,
    restoration,
    delivered,
    release,
    async restore() {
      await delivered();
      request.mockRestore();
      cancel.mockRestore();
      restoration.mockRestore();
      release();
    },
  };
}

test.each([
  { name: "removed", isDisabled: false },
  { name: "disabled then removed", isDisabled: true },
])(
  "keeps newer input focus when deferred restoration resumes after a focused control is $name",
  async ({ isDisabled }) => {
    const screen = await render(
      <FormDialogFocusFixture>
        <Button>Review removal</Button>
      </FormDialogFocusFixture>,
    );
    await screen.getByRole("button", { name: "Manage item" }).click();
    const dialog = page.getByRole("dialog", { name: "Manage item" });
    const review = dialog.getByRole("button", { name: "Review removal" });
    await review.click();
    const originalControl = review.element() as HTMLButtonElement;
    expect(document.activeElement).toBe(originalControl);
    const frames = holdAnimationFrames();

    try {
      await screen.rerender(
        <FormDialogFocusFixture>
          <Button disabled={isDisabled}>Review removal</Button>
        </FormDialogFocusFixture>,
      );
      expect(originalControl.disabled).toBe(isDisabled);
      await screen.rerender(
        <FormDialogFocusFixture>
          <Input aria-label="Rename item" />
        </FormDialogFocusFixture>,
      );
      expect(originalControl.isConnected).toBe(false);
      await expect.poll(() => frames.restoration.mock.calls.length).toBeGreaterThan(0);
      await frames.delivered();
      expect(frames.queued.size).toBeGreaterThan(0);
      expect(document.activeElement).toBe(dialog.element());

      const input = dialog.getByRole("textbox", { name: "Rename item" });
      await input.click();
      await userEvent.keyboard("At");
      await expect.element(input).toHaveValue("At");
      expect(document.activeElement).toBe(input.element());
      frames.release();
      expect(document.activeElement).toBe(input.element());
      await userEvent.keyboard("mosphere");
      await expect.element(input).toHaveValue("Atmosphere");
      await expect.element(input).toHaveFocus();
    } finally {
      await frames.restore();
    }
  },
);

test("restores popup focus when focus is still lost when the deferred callback resumes", async () => {
  const screen = await render(
    <FormDialogFocusFixture>
      <Button>Review removal</Button>
    </FormDialogFocusFixture>,
  );
  await screen.getByRole("button", { name: "Manage item" }).click();
  const dialog = page.getByRole("dialog", { name: "Manage item" });
  const review = dialog.getByRole("button", { name: "Review removal" });
  await review.click();
  const originalControl = review.element();
  expect(document.activeElement).toBe(originalControl);
  const frames = holdAnimationFrames();

  try {
    await screen.rerender(
      <FormDialogFocusFixture>
        <Input aria-label="Rename item" />
      </FormDialogFocusFixture>,
    );
    expect(originalControl.isConnected).toBe(false);
    await expect.poll(() => frames.restoration.mock.calls.length).toBeGreaterThan(0);
    await frames.delivered();
    expect(frames.queued.size).toBeGreaterThan(0);
    const popup = dialog.element() as HTMLElement;
    expect(document.activeElement).toBe(popup);
    popup.blur();
    expect(document.activeElement).toBe(document.body);
    frames.release();
    expect(document.activeElement).toBe(popup);
  } finally {
    await frames.restore();
  }
});

test("Escape dismisses the dialog and returns focus to its opener after editing", async () => {
  const screen = await render(
    <FormDialogFocusFixture>
      <Input aria-label="Rename item" />
    </FormDialogFocusFixture>,
  );

  const opener = screen.getByRole("button", { name: "Manage item" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Manage item" });
  const input = dialog.getByRole("textbox", { name: "Rename item" });
  await input.click();
  await userEvent.keyboard("Atmosphere");
  await expect.element(input).toHaveValue("Atmosphere");
  await userEvent.keyboard("{Escape}");
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(opener).toHaveFocus();
});
