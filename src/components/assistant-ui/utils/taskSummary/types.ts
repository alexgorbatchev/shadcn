export interface TaskSummary {
  readonly total: number;
  readonly running: number;
  readonly waiting: number;
  readonly failed: number;
  readonly startedAt: number | undefined;
  readonly runningLabel: string | undefined;
}
