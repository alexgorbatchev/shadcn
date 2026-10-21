import type { ThreadListGroup, IThreadListGroups, ThreadSummary } from "../threadList/types.js";

export function groupThreads(
  threadIds: readonly string[],
  threadItems: readonly ThreadSummary[],
  searchQuery: string,
  startOfToday: number | undefined,
): IThreadListGroups {
  const query = searchQuery.trim().toLowerCase();
  const itemsById = new Map(threadItems.map((item) => [item.id, item]));
  const dates = threadIds.map((id) => itemsById.get(id)?.lastMessageAt);
  const filteredIndices = threadIds
    .map((id, index) => ({ id, index }))
    .filter(({ id }) => !query || (itemsById.get(id)?.title || "New Chat").toLowerCase().includes(query))
    .map(({ index }) => index);
  if (startOfToday === undefined || !filteredIndices.some((index) => dates[index])) {
    return { threadIds, filteredIndices, groups: null };
  }
  const yesterday = new Date(startOfToday);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = yesterday.getTime();
  const time = (index: number) => dates[index]?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const sorted = [...filteredIndices].sort((a, b) => time(b) - time(a));
  const groups: ThreadListGroup[] = [];
  for (const index of sorted) {
    const date = dates[index];
    const label =
      !date || date.getTime() >= startOfToday ? "Today" : date.getTime() >= startOfYesterday ? "Yesterday" : "Earlier";
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.label === label) lastGroup.indices.push(index);
    else groups.push({ label, indices: [index] });
  }
  return { threadIds, filteredIndices, groups };
}
