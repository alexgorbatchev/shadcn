import { describe, expect, test } from "vitest";
import { applyMention } from "../applyMention.js";
describe("applyMention", () => {
  test("replaces only the trailing mention", () => {
    expect(applyMention("Ask @Alex and @rev", "Reviewer")).toBe("Ask @Alex and @Reviewer ");
  });
  test("inserts a name after an empty trailing mention", () => {
    expect(applyMention("Ask @", "Alex")).toBe("Ask @Alex ");
  });
  test("keeps messages without a trailing mention", () => {
    expect(applyMention("Ask Alex", "Reviewer")).toBe("Ask Alex");
  });
});
