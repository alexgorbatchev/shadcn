import { expect, test } from "vitest";
import { commands, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { VirtualDataGridExample, fixture_gridFiles } from "../stories/fixtures";
import "../../../.storybook/preview.css";

test("replacing column definitions removes an unavailable hidden column from the fitting notice", async () => {
  const screen = await render(<VirtualDataGridExample files={fixture_gridFiles} width={300} fitColumns />);
  await expect.element(screen.getByText("Hidden to fit: Size.")).toBeVisible();
  await screen.rerender(
    <VirtualDataGridExample files={fixture_gridFiles} width={300} fitColumns hasSizeColumn={false} />,
  );
  await expect.element(screen.getByRole("columnheader", { name: "Name" })).toBeVisible();
  await expect.element(screen.getByText("Hidden to fit: Size.")).not.toBeInTheDocument();
});

test("dragging a column's resize handle widens the column and its handle reports the new size", async () => {
  const screen = await render(<VirtualDataGridExample files={fixture_gridFiles} width={720} />);
  const handle = screen.getByRole("separator", { name: "Resize Kind" });
  await expect.element(handle).toHaveAttribute("aria-valuenow", "100");
  const header = screen.getByRole("columnheader", { name: "Kind" }).element();
  const name = screen.getByRole("columnheader", { name: "Name" }).element();
  const kindWidth = header.getBoundingClientRect().width;
  const nameWidth = name.getBoundingClientRect().width;
  await commands.nativeScrub('[aria-label="Resize Kind"]', 60);
  await expect.poll(() => Number(handle.element().getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(150);
  await expect.poll(() => header.getBoundingClientRect().width).toBeGreaterThan(kindWidth + 40);
  // The fill column gives up the width the resized column takes.
  await expect.poll(() => name.getBoundingClientRect().width).toBeLessThan(nameWidth - 40);
  await expect.element(handle).not.toHaveAttribute("data-resizing");
});

test("a required column restores its preferred width after shrinking and the first drag starts at its rendered size", async () => {
  const screen = await render(
    <VirtualDataGridExample files={fixture_gridFiles} width={720} fitColumns requiredKind preferredFillSize={240} />,
  );
  const handle = screen.getByRole("separator", { name: "Resize Kind" });
  const header = screen.getByRole("columnheader", { name: "Kind" });
  const name = screen.getByRole("columnheader", { name: "Name" });
  handle.element().focus();
  await userEvent.keyboard("{End}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "240");
  const container = screen.getByTestId("VirtualDataGrid").element().parentElement;
  if (!container) throw new Error("Grid example needs a width container");
  container.style.width = "500px";
  await expect.poll(() => name.element().getBoundingClientRect().width).toBe(220);
  await userEvent.keyboard("{Home}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "60");
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).toBeVisible();
  await userEvent.keyboard("{End}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "240");
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).not.toBeInTheDocument();
  await userEvent.keyboard("{Home}");
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).toBeVisible();
  await commands.nativeScrub('[aria-label="Resize Kind"]', 500);
  await expect.element(handle).toHaveAttribute("aria-valuenow", "240");
  await expect.element(handle).toBeVisible();
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).not.toBeInTheDocument();
  container.style.width = "300px";
  await expect.element(handle).toHaveAttribute("aria-valuenow", "100");
  await expect.poll(() => header.element().getBoundingClientRect().width).toBe(100);
  await expect.poll(() => name.element().getBoundingClientRect().width).toBeGreaterThanOrEqual(160);
  handle.element().focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "100");
  container.style.width = "720px";
  await expect.element(handle).toHaveAttribute("aria-valuenow", "240");
  container.style.width = "300px";
  await expect.element(handle).toHaveAttribute("aria-valuenow", "100");
  let startX = 0;
  let endX = 0;
  document.addEventListener(
    "mousedown",
    (event) => {
      startX = event.clientX;
    },
    { once: true },
  );
  document.addEventListener(
    "mouseup",
    (event) => {
      endX = event.clientX;
    },
    { once: true },
  );
  await commands.nativeScrub('[aria-label="Resize Kind"]', -16);
  const resized = 100 + endX - startX;
  await expect.element(handle).toHaveAttribute("aria-valuenow", String(resized));
  container.style.width = "720px";
  await expect.element(handle).toHaveAttribute("aria-valuenow", String(resized));
  await expect.poll(() => header.element().getBoundingClientRect().width).toBe(resized);
  container.style.width = "300px";
  handle.element().focus();
  await userEvent.keyboard("{End}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "100");
  container.style.width = "720px";
  await expect.element(handle).toHaveAttribute("aria-valuenow", "100");
});

test("preferred fill space hides optional columns first and keeps the native resize handle mounted", async () => {
  const screen = await render(
    <VirtualDataGridExample files={fixture_gridFiles} width={420} fitColumns preferredFillSize={240} />,
  );
  const handle = screen.getByRole("separator", { name: "Resize Kind" });
  const name = screen.getByRole("columnheader", { name: "Name" });
  await expect.element(screen.getByText("Hidden to fit: Size.")).toBeVisible();
  await expect.poll(() => name.element().getBoundingClientRect().width).toBeGreaterThanOrEqual(240);
  await expect.element(handle).toHaveAttribute("aria-valuemax", "140");
  await commands.nativeScrub('[aria-label="Resize Kind"]', 300);
  await expect.element(handle).toHaveAttribute("aria-valuenow", "140");
  await expect.element(handle).toBeVisible();
  await expect.poll(() => name.element().getBoundingClientRect().width).toBe(240);
  const container = screen.getByTestId("VirtualDataGrid").element().parentElement;
  if (!container) throw new Error("Grid example needs a width container");
  container.style.width = "220px";
  await expect.element(screen.getByRole("columnheader", { name: "Kind" })).not.toBeInTheDocument();
  await expect.poll(() => name.element().getBoundingClientRect().width).toBe(180);
  const viewport = screen.getByRole("region", { name: "Files" }).element();
  await expect
    .poll(() => screen.getByRole("table").element().getBoundingClientRect().width)
    .toBeLessThanOrEqual(viewport.clientWidth);
  container.style.width = "520px";
  await expect.element(handle).toHaveAttribute("aria-valuenow", "140");
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).toBeVisible();
  await expect.poll(() => name.element().getBoundingClientRect().width).toBeGreaterThanOrEqual(240);
});

test("fitted pointer resizing stops at the available width without losing its handle or preferred columns", async () => {
  const screen = await render(<VirtualDataGridExample files={fixture_gridFiles} width={420} fitColumns />);
  const handle = screen.getByRole("separator", { name: "Resize Kind" });
  const name = screen.getByRole("columnheader", { name: "Name" });
  await expect.element(handle).toHaveAttribute("aria-valuemax", "140");
  await commands.nativeScrub('[aria-label="Resize Kind"]', 300);
  await expect.element(handle).toHaveAttribute("aria-valuenow", "140");
  await expect.element(handle).toBeVisible();
  await expect.element(handle).not.toHaveAttribute("data-resizing");
  await expect.poll(() => name.element().getBoundingClientRect().width).toBeGreaterThanOrEqual(160);
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).toBeVisible();
  let startX = 0;
  let endX = 0;
  document.addEventListener(
    "mousedown",
    (event) => {
      startX = event.clientX;
    },
    { once: true },
  );
  document.addEventListener(
    "mouseup",
    (event) => {
      endX = event.clientX;
    },
    { once: true },
  );
  await commands.nativeScrub('[aria-label="Resize Kind"]', -40);
  // Vitest can scale its iframe; compare with the pointer's CSS delta inside the table's own document.
  await expect.element(handle).toHaveAttribute("aria-valuenow", String(140 + endX - startX));
  await expect.poll(() => name.element().getBoundingClientRect().width).toBeGreaterThan(160);
  const viewport = screen.getByRole("region", { name: "Files" }).element();
  await expect.poll(() => viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
  await expect
    .poll(() => screen.getByRole("table").element().getBoundingClientRect().width)
    .toBeLessThanOrEqual(viewport.clientWidth);
});
test("a required column can grow again after shrinking reveals an optional neighbour", async () => {
  const screen = await render(<VirtualDataGridExample files={fixture_gridFiles} width={720} fitColumns requiredKind />);
  const handle = screen.getByRole("separator", { name: "Resize Kind" });
  handle.element().focus();
  await userEvent.keyboard("{End}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "240");
  const grid = screen.getByTestId("VirtualDataGrid").element();
  const container = grid.parentElement!;
  container.style.width = "440px";
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).not.toBeInTheDocument();
  await userEvent.keyboard("{Home}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "60");
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).toBeVisible();
  await userEvent.keyboard("{End}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "240");
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).not.toBeInTheDocument();
  await userEvent.keyboard("{Home}");
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).toBeVisible();
  await commands.nativeScrub('[aria-label="Resize Kind"]', 300);
  await expect.element(handle).toHaveAttribute("aria-valuenow", "240");
  await expect.element(handle).not.toHaveAttribute("data-resizing");
  await expect.element(screen.getByRole("columnheader", { name: "Size" })).not.toBeInTheDocument();
  await expect
    .poll(() => screen.getByRole("columnheader", { name: "Name" }).element().getBoundingClientRect().width)
    .toBeGreaterThanOrEqual(160);
  const viewport = screen.getByRole("region", { name: "Files" }).element();
  await expect.poll(() => viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});
