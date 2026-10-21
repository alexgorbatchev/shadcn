import { useMemo, useSyncExternalStore } from "react";
import type { TaskTiming } from "../utils/taskUtils.js";

interface ITaskClock {
  subscribe: (onChange: VoidFunction) => VoidFunction;
  getSnapshot: () => number | undefined;
}

function createTaskClock(isTicking: boolean): ITaskClock {
  let now: number | undefined;
  return {
    subscribe(onChange) {
      if (!isTicking) return () => {};
      now = Date.now();
      onChange();
      const interval = setInterval(() => {
        now = Date.now();
        onChange();
      }, 1000);
      return () => clearInterval(interval);
    },
    getSnapshot: () => now,
  };
}

function readServerSnapshot(): undefined {
  return undefined;
}

export function useTaskElapsed(timing: TaskTiming | undefined, isRunning: boolean): number | undefined {
  const isTicking = timing !== undefined && timing.completedAt === undefined && isRunning;
  const clock = useMemo(() => createTaskClock(isTicking), [isTicking]);
  const now = useSyncExternalStore(clock.subscribe, clock.getSnapshot, readServerSnapshot);
  if (timing === undefined) return undefined;
  if (timing.completedAt !== undefined) return Math.max(0, timing.completedAt - timing.startedAt);
  return isTicking && now !== undefined ? Math.max(0, now - timing.startedAt) : undefined;
}
