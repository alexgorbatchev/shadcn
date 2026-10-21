interface IJobElapsed {
  dateTime: string;
  label: string;
}
export function formatJobElapsed(elapsedMs: number): IJobElapsed {
  const seconds = Math.max(0, Math.round(Number.isFinite(elapsedMs) ? elapsedMs / 1_000 : 0));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return {
    dateTime: `PT${seconds}S`,
    label: minutes === 0 ? `${seconds}s` : remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`,
  };
}
