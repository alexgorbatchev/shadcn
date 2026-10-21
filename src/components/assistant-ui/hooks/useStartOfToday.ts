import { useSyncExternalStore } from "react";

function subscribeToNextDay(onDayChange: VoidFunction): VoidFunction {
  let timeout: number;
  function scheduleNextDay(): void {
    const now = new Date();
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    timeout = window.setTimeout(() => {
      onDayChange();
      scheduleNextDay();
    }, startOfTomorrow - now.getTime());
  }
  scheduleNextDay();
  return () => window.clearTimeout(timeout);
}

function getStartOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function getServerStartOfToday(): undefined {
  return undefined;
}

export function useStartOfToday(): number | undefined {
  return useSyncExternalStore(subscribeToNextDay, getStartOfToday, getServerStartOfToday);
}
