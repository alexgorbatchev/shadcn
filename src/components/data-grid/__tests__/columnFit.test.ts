import { constructTable, createColumnHelper } from "@tanstack/react-table";
import { storeReactivityBindings } from "@tanstack/table-core/store-reactivity-bindings";
import { expect, test } from "vitest";
import { dataGridFeatures, type DataGridFeatures } from "../DataGrid.js";
import { constrainDataGridColumnSizing } from "../constrainDataGridColumnSizing.js";
import { getDataGridColumnFit } from "../getDataGridColumnFit.js";
import { getDataGridColumnFitMaximum } from "../getDataGridColumnFitMaximum.js";
import { fitDataGridColumnSizing } from "../fitDataGridColumnSizing.js";

function createFitTable(requiredKind = false, fillSize?: number) {
  const helper = createColumnHelper<DataGridFeatures, { title: string }>();
  const features = { ...dataGridFeatures, coreReactivityFeature: storeReactivityBindings() };
  return constructTable({
    features,
    data: [{ title: "A track" }],
    columns: helper.columns([
      helper.display({ id: "select", size: 40, enableHiding: false, enableResizing: false }),
      helper.accessor("title", { size: fillSize, minSize: 160, enableHiding: false, meta: { fill: true } }),
      helper.display({ id: "kind", size: 100, minSize: 60, maxSize: 240, enableHiding: !requiredKind }),
      helper.display({ id: "owner", size: 90, minSize: 40, maxSize: 300 }),
      helper.display({ id: "size", size: 80, minSize: 40, maxSize: 160 }),
    ]),
    initialState: { columnVisibility: { owner: false } },
  });
}

test("fitting reserves required and fill space without changing saved visibility or widths", () => {
  const table = createFitTable();
  table.setColumnSizing({ kind: 140, owner: 260 });
  const sizing = table.atoms.columnSizing.get();
  const visibility = table.atoms.columnVisibility.get();
  expect(getDataGridColumnFit(table, 420)).toEqual([]);
  expect(getDataGridColumnFit(table, 300)).toEqual(["kind"]);
  expect(getDataGridColumnFit(table, 220)).toEqual(["kind", "size"]);
  expect(getDataGridColumnFit(table, 720)).toEqual([]);
  expect(table.atoms.columnSizing.get()).toBe(sizing);
  expect(table.atoms.columnVisibility.get()).toBe(visibility);
  expect(table.getColumn("kind")?.getSize()).toBe(140);
});

test("fitting follows column order and skips an oversized column so a later smaller one can fit", () => {
  const table = createFitTable();
  table.getColumn("owner")?.toggleVisibility(true);
  expect(getDataGridColumnFit(table, 390)).toEqual(["size"]);
  table.setColumnOrder(["select", "title", "size", "owner", "kind"]);
  expect(getDataGridColumnFit(table, 390)).toEqual(["kind"]);
  table.setColumnSizing({ size: 160 });
  expect(getDataGridColumnFit(table, 300)).toEqual(["size", "kind"]);
  table.getColumn("owner")?.toggleVisibility(false);
  expect(getDataGridColumnFit(table, 300)).toEqual(["size"]);
});

test("resize ceilings preserve fitted neighbours and respect declared maxima", () => {
  const table = createFitTable();
  expect(getDataGridColumnFitMaximum(table, "kind", 420)).toBe(140);
  table.getColumn("owner")?.toggleVisibility(true);
  expect(getDataGridColumnFit(table, 420)).toEqual(["size"]);
  expect(getDataGridColumnFitMaximum(table, "kind", 420)).toBe(130);
  expect(getDataGridColumnFitMaximum(table, "kind", 900)).toBe(240);
});

test("optional columns leave the fill column its preferred width until only required columns remain", () => {
  const table = createFitTable(true, 240);
  expect(getDataGridColumnFit(table, 420)).toEqual(["size"]);
  expect(getDataGridColumnFit(table, 460)).toEqual([]);
  table.setColumnSizing({ kind: 240 });
  expect(getDataGridColumnFit(table, 440)).toEqual(["size"]);
  expect(fitDataGridColumnSizing(table, { kind: 240 }, 440)).toEqual({ kind: 240 });
  expect(fitDataGridColumnSizing(table, { kind: 240 }, 400)).toEqual({ kind: 200 });
});

test("fitting and optional resizing honor controlled fill preferences and native sizing limits", () => {
  const table = createFitTable(false, 240);
  const sizing = { title: 300 };
  table.setColumnSizing(sizing);
  expect(getDataGridColumnFit(table, 500)).toEqual(["size"]);
  expect(getDataGridColumnFitMaximum(table, "kind", 500)).toBe(160);
  expect(table.atoms.columnSizing.get()).toBe(sizing);
  table.setColumnSizing({ title: 120 });
  expect(table.getColumn("title")?.getSize()).toBe(160);
  expect(getDataGridColumnFit(table, 420)).toEqual([]);
  expect(getDataGridColumnFitMaximum(table, "kind", 420)).toBe(140);
});

test("required columns can reclaim space from optional columns revealed by shrinking", () => {
  const table = createFitTable(true);
  table.setColumnSizing({ kind: 240 });
  expect(getDataGridColumnFit(table, 440)).toEqual(["size"]);
  const smaller = constrainDataGridColumnSizing(table, { kind: 128 }, 440, { kind: 240 });
  table.setColumnSizing(smaller);
  expect(getDataGridColumnFit(table, 440)).toEqual([]);
  const restored = constrainDataGridColumnSizing(table, { kind: 240 }, 440, smaller);
  expect(restored).toEqual({ kind: 240 });
  table.setColumnSizing(restored);
  expect(getDataGridColumnFit(table, 440)).toEqual(["size"]);
});

test("preferred fill fitting preserves sizing and follows the optional column order", () => {
  const table = createFitTable(false, 240);
  const sizing = table.atoms.columnSizing.get();
  expect(getDataGridColumnFit(table, 500)).toEqual([]);
  expect(getDataGridColumnFit(table, 420)).toEqual(["size"]);
  expect(getDataGridColumnFit(table, 300)).toEqual(["kind", "size"]);
  expect(getDataGridColumnFit(table, 220)).toEqual(["kind", "size"]);
  expect(table.atoms.columnSizing.get()).toBe(sizing);
  expect(table.getColumn("title")?.getSize()).toBe(240);
  expect(getDataGridColumnFitMaximum(table, "kind", 420)).toBe(140);
  table.setColumnSizing({ kind: 140 });
  expect(getDataGridColumnFit(table, 420)).toEqual(["size"]);
  table.setColumnOrder(["select", "title", "size", "kind"]);
  expect(getDataGridColumnFit(table, 420)).toEqual(["kind"]);
});

test("required resizing can reclaim fill space below its preference when no optional columns fit", () => {
  const table = createFitTable(true, 240);
  const preferred = { kind: 240 };
  table.setColumnSizing(fitDataGridColumnSizing(table, preferred, 300));
  expect(table.getColumn("kind")?.getSize()).toBe(100);
  expect(getDataGridColumnFit(table, 300)).toEqual(["size"]);
  expect(getDataGridColumnFitMaximum(table, "kind", 300)).toBe(100);
  const smaller = constrainDataGridColumnSizing(table, { kind: 80 }, 300, preferred);
  table.setColumnSizing(fitDataGridColumnSizing(table, smaller, 300));
  expect(getDataGridColumnFitMaximum(table, "kind", 300)).toBe(100);
  expect(constrainDataGridColumnSizing(table, { kind: 100 }, 300, smaller)).toEqual({ kind: 100 });
  table.setColumnSizing(fitDataGridColumnSizing(table, preferred, 720));
  expect(table.getColumn("kind")?.getSize()).toBe(240);
  expect(getDataGridColumnFit(table, 720)).toEqual([]);
});

test("optional resizing preserves its own handle and neighbours while reserving preferred fill space", () => {
  const table = createFitTable(false, 240);
  const next = constrainDataGridColumnSizing(table, { kind: 240 }, 420, {});
  expect(next).toEqual({ kind: 140 });
  table.setColumnSizing(next);
  expect(getDataGridColumnFit(table, 420)).toEqual(["size"]);
  expect(getDataGridColumnFitMaximum(table, "kind", 420)).toBe(140);
  table.setColumnSizing({ kind: 100 });
  const wider = constrainDataGridColumnSizing(table, { kind: 240 }, 500, { kind: 100 });
  expect(wider).toEqual({ kind: 140 });
  table.setColumnSizing(wider);
  expect(getDataGridColumnFit(table, 500)).toEqual([]);
});

test("controlled resize proposals clamp only the changed visible fixed column", () => {
  const table = createFitTable();
  table.setColumnSizing({ kind: 100, owner: 260 });
  const previous = table.atoms.columnSizing.get();
  const next = constrainDataGridColumnSizing(table, (sizes) => ({ ...sizes, kind: 900 }), 420, previous);
  expect(next).toEqual({ kind: 140, owner: 260 });
  expect(table.atoms.columnSizing.get()).toBe(previous);
  expect(table.getColumn("kind")?.getSize()).toBe(100);
  table.setColumnSizing(next);
  expect(table.getColumn("kind")?.getSize()).toBe(140);
  expect(getDataGridColumnFit(table, 420)).toEqual([]);
  expect(constrainDataGridColumnSizing(table, (sizes) => ({ ...sizes, kind: 10 }), 420, next)).toEqual({
    kind: 60,
    owner: 260,
  });
});

test("hidden and fill preferences do not get rewritten by constraints on a resize", () => {
  const table = createFitTable();
  table.setColumnSizing({ kind: 100, owner: 260, title: 400 });
  expect(
    constrainDataGridColumnSizing(table, { kind: 100, owner: 280, title: 500 }, 300, table.atoms.columnSizing.get()),
  ).toEqual({
    kind: 100,
    owner: 280,
    title: 500,
  });
});

test("resets and updates before a measurable container preserve the native sizing proposal", () => {
  const table = createFitTable();
  table.setColumnSizing({ kind: 140 });
  expect(constrainDataGridColumnSizing(table, () => ({}), 420, { kind: 140 })).toEqual({});
  const proposal = { kind: 190 };
  expect(constrainDataGridColumnSizing(table, proposal, 0, { kind: 140 })).toEqual(proposal);
  expect(constrainDataGridColumnSizing(table, proposal, -1, { kind: 140 })).toEqual(proposal);
  expect(table.getColumn("kind")?.getSize()).toBe(140);
});

test("required columns shrink temporarily toward their minima and restore their preferred width", () => {
  const table = createFitTable(true);
  const preferred = { kind: 240, owner: 260 };
  table.setColumnSizing(preferred);
  const narrow = fitDataGridColumnSizing(table, preferred, 300);
  expect(narrow).toEqual({ kind: 100, owner: 260 });
  expect(preferred.kind).toBe(240);
  table.setColumnSizing(narrow);
  expect(table.getColumn("kind")?.getSize()).toBe(100);
  expect(fitDataGridColumnSizing(table, preferred, 300)).toBe(table.atoms.columnSizing.get());
  expect(fitDataGridColumnSizing(table, preferred, 260)).toEqual({ kind: 60, owner: 260 });
  const restored = fitDataGridColumnSizing(table, preferred, 720);
  table.setColumnSizing(restored);
  expect(table.getColumn("kind")?.getSize()).toBe(240);
});

test("resizing another column keeps temporarily reduced widths out of preferences", () => {
  const table = createFitTable(true);
  const preferred = { kind: 240, owner: 260 };
  table.setColumnSizing(fitDataGridColumnSizing(table, preferred, 300));
  expect(constrainDataGridColumnSizing(table, (sizes) => ({ ...sizes, kind: 116 }), 300, preferred)).toEqual(preferred);
  expect(constrainDataGridColumnSizing(table, (sizes) => ({ ...sizes, owner: 280 }), 300, preferred)).toEqual({
    kind: 240,
    owner: 280,
  });
  expect(constrainDataGridColumnSizing(table, (sizes) => ({ ...sizes, kind: 80 }), 300, preferred)).toEqual({
    kind: 80,
    owner: 260,
  });
  expect(constrainDataGridColumnSizing(table, () => ({}), 300, preferred)).toEqual({});
  const defaults = fitDataGridColumnSizing(table, {}, 280);
  expect(defaults).toEqual({ kind: 80 });
  table.setColumnSizing(defaults);
  expect(constrainDataGridColumnSizing(table, (sizes) => ({ ...sizes, owner: 90 }), 280, {})).toEqual({});
  expect(constrainDataGridColumnSizing(table, (sizes) => ({ ...sizes, owner: 120 }), 280, {})).toEqual({ owner: 120 });
  expect(fitDataGridColumnSizing(table, {}, 0)).toEqual({});
});
