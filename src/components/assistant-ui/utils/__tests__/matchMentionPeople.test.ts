import { describe, expect, test } from "vitest";
import { matchMentionPeople } from "../matchMentionPeople.js";
import type { IComposerPerson } from "../../elements/composer/types.js";
const people: readonly IComposerPerson[] = [
  { name: "Reviewer", role: "agent" },
  { name: "Alex", role: "human" },
];
describe("matchMentionPeople", () => {
  test("matches the trailing mention without case sensitivity", () => {
    expect(matchMentionPeople("Ask @RE", people).map((person) => person.name)).toEqual(["Reviewer"]);
  });
  test("returns every person at a trailing at sign", () => {
    expect(matchMentionPeople("Ask @", people)).toEqual([...people]);
  });
  test("ignores a mention already followed by text", () => {
    expect(matchMentionPeople("Ask @Alex about this", people)).toEqual([]);
  });
  test("handles missing people", () => {
    expect(matchMentionPeople("@Alex", undefined)).toEqual([]);
  });
});
