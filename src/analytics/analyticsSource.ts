/** Only inspect event metadata; never serialize callback arguments or DOM content. */
export function analyticsSource(value: unknown): Event | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  if (value instanceof Event) return value;
  if ("nativeEvent" in value) return analyticsSource(value.nativeEvent);
  if ("event" in value) return analyticsSource(value.event);
  return undefined;
}

export function isAnalyticsCanceled(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  return (
    ("isCanceled" in value && value.isCanceled === true) ||
    ("defaultPrevented" in value && value.defaultPrevented === true)
  );
}

export function isAnalyticsProgrammatic(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    (("isUserInteraction" in value && value.isUserInteraction === false) ||
      ("event" in value && analyticsSource(value.event)?.type === "base-ui"))
  );
}
