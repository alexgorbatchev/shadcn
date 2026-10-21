import { type ToolCallMessagePart, type ToolCallMessagePartStatus } from "@assistant-ui/react";

import type { TaskCardState } from "../elements/TaskCard.js";

export type TaskTiming = NonNullable<ToolCallMessagePart["timing"]>;

export const TASK_PAGE_SIZE = 4;

export const LABEL_KEYS = ["description", "task", "title", "name", "prompt", "query", "instructions"];

export const META_KEYS = ["subagent_type", "subagentType", "agent", "model"];

export function firstString(args: unknown, keys: readonly string[]) {
  if (typeof args !== "object" || args === null) return undefined;
  const record = args as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return undefined;
}

export function taskStateOf(status: ToolCallMessagePartStatus, isError?: boolean): TaskCardState {
  if (status.type === "running") return "working";
  if (status.type === "requires-action") return "waiting";
  if (status.type === "incomplete") {
    return status.reason === "cancelled" ? "cancelled" : "failed";
  }
  if (isError) return "failed";
  return "done";
}

export function taskLabel(toolName: string, args: unknown) {
  return firstString(args, LABEL_KEYS) ?? toolName;
}

export function taskMeta(args: unknown) {
  return firstString(args, META_KEYS);
}

export function formatElapsed(ms: number) {
  if (ms < 1000) return "<1s";
  const seconds = ms / 1000;
  if (seconds < 10) return `${(Math.floor(seconds * 10) / 10).toFixed(1)}s`;
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
}
