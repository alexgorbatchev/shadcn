import type { ThreadsState } from "@assistant-ui/react";

export type ThreadSummary = Pick<ThreadsState["threadItems"][number], "id" | "title" | "lastMessageAt">;
export interface ThreadListGroup {
  label: string;
  indices: number[];
}
export interface IThreadListGroups {
  threadIds: readonly string[];
  filteredIndices: number[];
  groups: ThreadListGroup[] | null;
}
