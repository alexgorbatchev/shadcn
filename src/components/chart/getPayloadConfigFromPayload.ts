import type { ChartConfig } from "./types.js";
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
): ChartConfig[string] | undefined {
  if (!isRecord(payload)) return undefined;
  const value = payload[key];
  const nested = isRecord(payload.payload) ? payload.payload[key] : undefined;
  const configLabelKey = typeof value === "string" ? value : typeof nested === "string" ? nested : key;
  return config[configLabelKey] ?? config[key];
}
