import { expect, test } from "vitest";
import {
  asDate,
  isCalendarDate,
  isEmpty,
  textValue,
  fractionDigits,
  numberOptions,
  formatted,
  numericValue,
  relativeDate,
  relativeRefreshDelay,
  withUnit,
  isNumeric,
  compareValues,
  collatorFor,
  rowIdentifier,
} from "../dataTableUtils.js";

test.each([
  ["2024-02-29", true],
  ["2023-02-29", false],
  ["1900-02-29", false],
  ["2000-02-29", true],
  ["2024-04-31", false],
  ["2024-01-31", true],
  ["2024-00-01", false],
  ["2024-13-01", false],
  ["2024-01-00", false],
  ["2024", false],
])("validates calendar date %s", (input, expected) => {
  expect(isCalendarDate(String(input))).toBe(expected);
});

test("normalizes dates, numeric values, and missing cells", () => {
  expect(asDate("2024-02-29")?.toISOString()).toBe("2024-02-29T00:00:00.000Z");
  expect(asDate(0)?.getTime()).toBe(0);
  expect(asDate("2023-02-29")).toBeUndefined();
  expect(asDate("not a date")).toBeUndefined();
  expect(asDate(null)).toBeUndefined();
  expect(isEmpty(null)).toBe(true);
  expect(isEmpty(undefined)).toBe(true);
  expect(isEmpty(0)).toBe(false);
  expect(numericValue(3)).toBe(3);
  expect(numericValue(Number.NaN)).toBeUndefined();
  expect(numericValue("3")).toBeUndefined();
  expect(textValue(["a", "b"])).toBe("a, b");
  expect(textValue(false)).toBe("false");
});

test("formats precision and preserves raw data when Intl rejects input", () => {
  expect(fractionDigits(undefined)).toEqual({});
  expect(fractionDigits(Number.POSITIVE_INFINITY)).toEqual({});
  expect(fractionDigits(-2)).toEqual({ minimumFractionDigits: 0, maximumFractionDigits: 0 });
  expect(fractionDigits(30)).toEqual({ minimumFractionDigits: 20, maximumFractionDigits: 20 });
  expect(fractionDigits(2.7)).toEqual({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
  expect(numberOptions(undefined, true)).toEqual({ notation: "compact" });
  expect(numberOptions(undefined, false)).toEqual({ notation: "standard" });
  expect(formatted(3, () => new Intl.NumberFormat("en", { style: "currency", currency: "?" }).format(3))).toBe("3");
  expect(formatted(3, () => "three")).toBe("three");
  expect(withUnit("3", undefined)).toBe("3");
  expect(withUnit("3", "")).toBe("3");
  expect(withUnit("3", "%")).toBe("3%");
  expect(withUnit("3", "kg")).toBe("3 kg");
});

test("sorts missing, typed, date, and natural text cells", () => {
  const collator = collatorFor("en-US");
  expect(compareValues(null, undefined, { key: "value", label: "Value" }, collator)).toBe(0);
  expect(compareValues(null, 1, { key: "value", label: "Value" }, collator)).toBe(1);
  expect(compareValues(1, null, { key: "value", label: "Value" }, collator)).toBe(-1);
  expect(compareValues(4, 2, { key: "value", label: "Value" }, collator)).toBe(2);
  expect(compareValues(true, false, { key: "value", label: "Value" }, collator)).toBe(1);
  expect(compareValues(["a"], ["a", "b"], { key: "value", label: "Value" }, collator)).toBe(-1);
  expect(compareValues("item2", "item10", { key: "value", label: "Value" }, collator)).toBeLessThan(0);
  expect(
    compareValues("2024-01-01", "2024-01-02", { key: "value", label: "Value", format: { kind: "date" } }, collator),
  ).toBe(-86400000);
  expect(
    compareValues("bad", "worse", { key: "value", label: "Value", format: { kind: "date" } }, collator),
  ).toBeLessThan(0);
  expect(collatorFor("invalid_locale").compare("a", "b")).toBeLessThan(0);
  expect(rowIdentifier({ id: "record" }, "id", 2)).toBe("record");
  expect(rowIdentifier({ id: null }, "id", 2)).toBe(2);
  expect(rowIdentifier({}, undefined, 3)).toBe(3);
  expect(isNumeric({ kind: "currency", currency: "USD" })).toBe(true);
  expect(isNumeric({ kind: "percent" })).toBe(true);
  expect(isNumeric({ kind: "delta" })).toBe(true);
  expect(isNumeric({ kind: "number" })).toBe(true);
  expect(isNumeric(undefined)).toBe(false);
});

test.each([0, 60000, 3600000, 86400000, 604800000])(
  "refreshes relative dates at their visible granularity %i",
  (age) => {
    const expected = new Map([
      [0, 1000],
      [60000, 30000],
      [3600000, 60000],
      [86400000, 3600000],
      [604800000, 86400000],
    ]);
    expect(
      relativeRefreshDelay(
        [{ key: "when", label: "When", format: { kind: "date", style: "relative" } }],
        [{ when: -age }],
        0,
      ),
    ).toBe(expected.get(age));
  },
);

test("renders relative date units and ignores invalid cells when scheduling refresh", () => {
  expect(relativeDate(new Date(0), "en", 0)).toBe("now");
  expect(relativeDate(new Date(60000), "en", 0)).toBe("in 1 minute");
  expect(relativeDate(new Date(-86400000), "en", 0)).toBe("yesterday");
  expect(relativeDate(new Date(31536000000), "en", 0)).toBe("next year");
  expect(relativeRefreshDelay([{ key: "value", label: "Value" }], [{ value: "bad" }], 0)).toBe(86400000);
});
