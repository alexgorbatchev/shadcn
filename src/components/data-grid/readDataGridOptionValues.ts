const NO_VALUES: readonly string[] = [];

/** Reads an options filter value: its string items, or none when it is not an array. */
function readDataGridOptionValues(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return NO_VALUES;
  return value.filter((item): item is string => typeof item === "string");
}

export { readDataGridOptionValues };
