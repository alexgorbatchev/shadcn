import { userEvent, within } from "storybook/test";
import { assertLayoutContained } from "../../../../.storybook/assertLayoutContained";

/** Exercise each composition in both sidebar states, restoring its initial state. */
export async function assertSidebarLayoutCycle(canvasElement: HTMLElement): Promise<void> {
  await assertLayoutContained(canvasElement);
  const sidebar = canvasElement.querySelector('[data-slot="sidebar"]');
  if (!sidebar || sidebar.getAttribute("data-collapsible") === "offcanvas") return;
  const trigger = within(canvasElement).queryByRole("button", { name: "Toggle Sidebar" });
  if (!trigger) return;
  await userEvent.click(trigger);
  await assertLayoutContained(canvasElement);
  await userEvent.click(trigger);
  await assertLayoutContained(canvasElement);
}
