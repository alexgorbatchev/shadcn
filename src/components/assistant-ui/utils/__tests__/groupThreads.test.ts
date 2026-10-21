import { describe, expect, test } from "vitest";
import { groupThreads } from "../groupThreads.js";

describe("groupThreads", () => {
  test("filters titles case insensitively while retaining runtime indices", () => {
    expect(
      groupThreads(
        ["a", "b", "c"],
        [{ id: "a", title: "Page review" }, { id: "b", title: "Server logs" }, { id: "c" }],
        " PAGE ",
        undefined,
      ),
    ).toEqual({ threadIds: ["a", "b", "c"], filteredIndices: [0], groups: null });
    expect(
      groupThreads(["a", "b"], [{ id: "a", title: "Page review" }, { id: "b" }], "new chat", undefined).filteredIndices,
    ).toEqual([1]);
    expect(groupThreads(["a"], [{ id: "a", title: "Page review" }], "missing", undefined).filteredIndices).toEqual([]);
  });

  test("groups activity using local calendar days and sorts newest first", () => {
    const today = new Date(2026, 9, 20).getTime();
    const result = groupThreads(
      ["old", "yesterday", "today", "undated"],
      [
        { id: "old", lastMessageAt: new Date(2026, 9, 18, 23, 59) },
        { id: "yesterday", lastMessageAt: new Date(2026, 9, 19) },
        { id: "today", lastMessageAt: new Date(2026, 9, 20) },
        { id: "undated" },
      ],
      "",
      today,
    );
    expect(result.groups).toEqual([
      { label: "Today", indices: [3, 2] },
      { label: "Yesterday", indices: [1] },
      { label: "Earlier", indices: [0] },
    ]);
    expect(result.filteredIndices).toEqual([0, 1, 2, 3]);
  });

  test("preserves original order without dates and during server rendering", () => {
    expect(groupThreads(["b", "a"], [{ id: "a" }, { id: "b" }], "", new Date(2026, 9, 20).getTime()).groups).toBeNull();
    expect(
      groupThreads(["b", "a"], [{ id: "a", lastMessageAt: new Date(2026, 9, 20) }, { id: "b" }], "", undefined)
        .filteredIndices,
    ).toEqual([0, 1]);
  });
});
