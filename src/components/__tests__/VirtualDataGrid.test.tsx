import { expect, test } from "vitest";
import { commands } from "vitest/browser";
import { render } from "vitest-browser-react";
import { VirtualDataGridExample, fixture_gridFiles } from "../stories/fixtures";
import "../../../.storybook/preview.css";

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
