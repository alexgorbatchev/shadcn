interface ITaskPartCandidate {
  readonly type: string;
  readonly messages?: unknown;
}
export function isTaskPart(part: ITaskPartCandidate): boolean {
  return part.type === "tool-call" && part.messages !== undefined;
}
