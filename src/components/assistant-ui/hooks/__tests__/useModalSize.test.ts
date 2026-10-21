import { act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { factory_modalSizeHarness } from "./fixtures/fixtures.js";

beforeEach(async () => {
  await page.viewport(1024, 768);
});
afterEach(async () => {
  cleanup();
  localStorage.removeItem("aui-modal-size");
  await page.viewport(1024, 768);
});

test("resizes with real keyboard input, persists the size and resets it", async () => {
  const rendered = factory_modalSizeHarness();
  await act(async () => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
  });
  expect(rendered.getByRole("status").textContent).toBe("616 by 500");
  expect(JSON.parse(localStorage.getItem("aui-modal-size") ?? "null")).toEqual({ width: 616, height: 500 });
  await act(async () => {
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
  });
  expect(rendered.getByRole("status").textContent).toBe("616 by 564");
  await act(async () => {
    await userEvent.click(rendered.getByRole("button", { name: "Reset size" }));
  });
  expect(localStorage.getItem("aui-modal-size")).toBeNull();
  expect(rendered.getByRole("status").textContent).toBe("Default size");
});

test("fits a restored size inside a viewport smaller than its preferred minimum", async () => {
  await page.viewport(300, 360);
  localStorage.setItem("aui-modal-size", JSON.stringify({ width: 600, height: 500 }));
  const rendered = factory_modalSizeHarness();
  expect(rendered.getByRole("status").textContent).toBe("268 by 264");
});

test("ignores nonfinite persisted dimensions", () => {
  localStorage.setItem("aui-modal-size", '{"width":1e400,"height":500}');
  const rendered = factory_modalSizeHarness();
  expect(rendered.getByRole("status").textContent).toBe("Default size");
});

test.each(["null", "false", "[]", "{}", '{"width":600}', '{"width":"600","height":500}', "damaged-json"])(
  "ignores damaged modal dimensions: %s",
  (saved) => {
    localStorage.setItem("aui-modal-size", saved);
    const rendered = factory_modalSizeHarness();
    expect(rendered.getByRole("status").textContent).toBe("Default size");
  },
);

test("resets keyboard resizing with Space while leaving unrelated keys alone", async () => {
  const rendered = factory_modalSizeHarness();
  await act(async () => {
    await userEvent.tab();
    await userEvent.keyboard("x{ArrowRight}{ArrowDown}");
  });
  expect(rendered.getByRole("status").textContent).toBe("584 by 484");
  await act(async () => {
    await userEvent.keyboard(" ");
  });
  expect(rendered.getByRole("status").textContent).toBe("Default size");
});

test("commits native pointer dragging to the actual measured panel", async () => {
  const rendered = factory_modalSizeHarness();
  const handle = rendered.getByRole("button", { name: "Resize conversation" });
  const panel = rendered.getByTestId("ModalSizeHarness");
  const handleBounds = handle.getBoundingClientRect();
  const panelBounds = panel.getBoundingClientRect();
  const width = Math.round(panelBounds.width + handleBounds.left - panelBounds.left + handle.clientLeft + 20);
  const height = Math.round(panelBounds.height + handleBounds.top - panelBounds.top + handle.clientTop + 10);
  await act(async () => {
    await userEvent.dragAndDrop(handle, panel, { sourcePosition: { x: 20, y: 10 }, targetPosition: { x: 0, y: 0 } });
  });
  expect(rendered.getByRole("status").textContent).toBe(`${width} by ${height}`);
  expect(JSON.parse(localStorage.getItem("aui-modal-size") ?? "null")).toEqual({ width, height });
});

test("uses the native RTL direction for keyboard growth and Enter reset", async () => {
  const rendered = factory_modalSizeHarness();
  rendered.getByTestId("ModalSizeHarness").dir = "rtl";
  await act(async () => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
  });
  expect(rendered.getByRole("status").textContent).toBe("616 by 500");
  await act(async () => {
    await userEvent.keyboard("{Enter}");
  });
  expect(rendered.getByRole("status").textContent).toBe("Default size");
});
