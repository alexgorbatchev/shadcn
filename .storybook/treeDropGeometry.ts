import type { BrowserCommand } from "vitest/node";

interface ITreeDropGeometry {
  lineCenter: number;
  lineLeft: number;
  expectedTop: number;
  expectedLeft: number;
}

/** Inspect a real HTML drag while it is held over a nested row's outdent area. */
export const treeDropGeometry: BrowserCommand<
  [sourceName: string, targetName: string, expectedName: string],
  ITreeDropGeometry
> = async (context, sourceName, targetName, expectedName): Promise<ITreeDropGeometry> => {
  const source = context.iframe.getByRole("treeitem", { name: sourceName, exact: true });
  const target = context.iframe.getByRole("treeitem", { name: targetName, exact: true });
  const expected = context.iframe.getByRole("treeitem", { name: expectedName, exact: true });
  const start = await source.boundingBox();
  const end = await target.boundingBox();
  if (!start || !end) throw new Error("Tree drag requires visible rows.");
  await context.page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await context.page.mouse.down();
  try {
    await context.page.mouse.move(start.x + start.width / 2 + 8, start.y + start.height / 2, { steps: 2 });
    await context.page.mouse.move(end.x + 4, end.y + end.height - 2, { steps: 5 });
    await context.page.mouse.move(end.x + 4, end.y + end.height - 2);
    const indicator = context.iframe.locator('[data-slot="tree-drop-indicator"]');
    await indicator.waitFor({ state: "visible", timeout: 5000 });
    const line = await indicator.boundingBox();
    const row = await expected.boundingBox();
    if (!line || !row) throw new Error("Tree drop indicator requires visible geometry.");
    return { lineCenter: line.y + line.height / 2, lineLeft: line.x, expectedTop: row.y, expectedLeft: row.x };
  } finally {
    await context.page.mouse.up();
  }
};

declare module "vitest/browser" {
  interface BrowserCommands {
    treeDropGeometry: (sourceName: string, targetName: string, expectedName: string) => Promise<ITreeDropGeometry>;
  }
}
