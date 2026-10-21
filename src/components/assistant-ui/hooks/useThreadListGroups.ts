import { useMemo } from "react";
import { useAuiState } from "@assistant-ui/react";
import { groupThreads } from "../utils/groupThreads.js";
import type { IThreadListGroups } from "../threadList/types.js";
import { useStartOfToday } from "./useStartOfToday.js";

export function useThreadListGroups(searchQuery = ""): IThreadListGroups {
  const threadIds = useAuiState((state) => state.threads.threadIds);
  const threadItems = useAuiState((state) => state.threads.threadItems);
  const startOfToday = useStartOfToday();
  return useMemo(
    () => groupThreads(threadIds, threadItems, searchQuery, startOfToday),
    [threadIds, threadItems, searchQuery, startOfToday],
  );
}
