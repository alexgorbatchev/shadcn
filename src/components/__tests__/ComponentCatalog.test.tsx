import { DensityProvider } from "../DensityProvider";
import { beforeEach, expect, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { useState, type ReactElement } from "react";
import { Kanban, type KanbanItem } from "../Kanban";
import { Gantt, type GanttTask } from "../gantt";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
} from "../NumberField";
import "../../../.storybook/preview.css";

beforeEach(async () => {
  await page.viewport(1200, 800);
});

function Board({ restricted = false }: { restricted?: boolean }): ReactElement {
  const [items, setItems] = useState<KanbanItem[]>([
    { id: "design", title: "Design", columnId: "todo" },
    { id: "build", title: "Build", columnId: "todo" },
  ]);
  return (
    <Kanban
      label="Board"
      items={items}
      columns={[
        { id: "todo", label: "To do" },
        { id: "done", label: "Done" },
      ]}
      onItemsChange={setItems}
      canMove={restricted ? (_, column) => column !== "done" : undefined}
    />
  );
}
test("native Kanban dragging moves cards between columns and reorders cards", async () => {
  const screen = await render(<Board />);
  await page.getByRole("group", { name: "Build" }).dropTo(page.getByRole("group", { name: "Design" }));
  await expect
    .poll(() => screen.getByRole("region", { name: "To do" }).element().querySelector("li")?.textContent)
    .toContain("Build");
  await page.getByRole("group", { name: "Design" }).dropTo(page.getByRole("region", { name: "Done" }));
  await expect
    .element(screen.getByRole("region", { name: "Done" }).getByRole("group", { name: "Design" }))
    .toBeVisible();
});
test("native Kanban dragging respects domain restrictions", async () => {
  const screen = await render(<Board restricted />);
  await page.getByRole("group", { name: "Design" }).dropTo(page.getByRole("region", { name: "Done" }));
  await expect
    .element(screen.getByRole("region", { name: "To do" }).getByRole("group", { name: "Design" }))
    .toBeVisible();
  await expect.element(screen.getByRole("region", { name: "Done" })).toHaveTextContent("No items");
});
function Timeline(): ReactElement {
  const [tasks, setTasks] = useState<GanttTask[]>([
    { id: "design", title: "Design", start: new Date("2026-10-20T10:00:00Z"), end: new Date("2026-10-22T10:00:00Z") },
  ]);
  return (
    <>
      <Gantt
        label="Delivery"
        tasks={tasks}
        startDate={new Date("2026-10-20T00:00:00Z")}
        days={7}
        timeZone="UTC"
        onTaskSelect={() => {}}
        onTaskChange={(task) => setTasks([task])}
      />
      <output aria-label="Task start">{tasks[0]?.start.toISOString()}</output>
    </>
  );
}
test("native Gantt dragging reschedules the entire task and preserves its duration", async () => {
  const screen = await render(<Timeline />);
  const target = screen.getByRole("table").element().querySelector('[data-date="2026-10-24"]');
  if (!target) throw new Error("Missing date drop target");
  await page.getByRole("button", { name: /Design: October 20th/ }).dropTo(page.elementLocator(target));
  await expect.element(screen.getByLabelText("Task start")).toHaveTextContent("2026-10-24T10:00:00.000Z");
  await expect
    .element(screen.getByRole("button", { name: /Design: October 24th, 2026 to October 26th/ }))
    .toBeVisible();
});
test("NumberField mouse scrubbing commits its rendered value when pointer lock is unavailable", async () => {
  const committed = vi.fn();
  const cursorFonts: string[] = [];
  const cursorWidths: number[] = [];
  const lock = vi
    .spyOn(Element.prototype, "requestPointerLock")
    .mockRejectedValue(new DOMException("Pointer lock unavailable", "SecurityError"));
  try {
    const screen = await render(
      <DensityProvider density="compact">
        <NumberField onValueCommitted={committed} defaultValue={20} min={0} max={100}>
          <NumberFieldScrubArea data-testid="quantity-scrub">
            Quantity
            <NumberFieldScrubAreaCursor
              ref={(element) => {
                if (element) {
                  cursorFonts.push(getComputedStyle(element).fontSize);
                  const icon = element.querySelector("[data-cursor-icon]");
                  if (icon) cursorWidths.push(icon.getBoundingClientRect().width);
                }
              }}
            >
              <span data-cursor-icon className="inline-block size-control">
                ↔
              </span>
            </NumberFieldScrubAreaCursor>
          </NumberFieldScrubArea>
          <NumberFieldGroup>
            <NumberFieldInput aria-label="Quantity" />
          </NumberFieldGroup>
        </NumberField>
      </DensityProvider>,
    );
    await commands.nativeScrub('[data-testid="quantity-scrub"]', 40);
    await expect.element(screen.getByRole("textbox", { name: "Quantity" })).toHaveValue("60");
    expect(committed).toHaveBeenLastCalledWith(60, expect.objectContaining({ reason: "scrub" }));
    expect(document.pointerLockElement).toBeNull();
    const group = screen
      .getByRole("textbox", { name: "Quantity" })
      .element()
      .closest<HTMLElement>('[data-slot="number-field-group"]');
    if (!group) throw new Error("Missing field group");
    expect(cursorWidths).toContain(group.getBoundingClientRect().height);
    expect(cursorFonts).toContain(
      getComputedStyle(screen.getByRole("textbox", { name: "Quantity" }).element()).fontSize,
    );
  } finally {
    lock.mockRestore();
  }
});
