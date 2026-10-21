import type { ToolApprovalQuestionOption } from "@assistant-ui/react";

export interface IAskQuestionArgs {
  question?: string;
  options?: readonly Pick<ToolApprovalQuestionOption, "label" | "description">[];
}

type AskQuestionOutcome = { answer: string } | { note: string } | { raw: unknown };

export const readOutcome = (result: unknown, isError: boolean | undefined): AskQuestionOutcome | undefined => {
  if (result === undefined) return undefined;
  if (!isError && typeof result === "object" && result !== null) {
    if ("interrupted" in result && result.interrupted === true) return { note: "Skipped" };
    if ("status" in result && result.status === "unavailable") return { note: "Unavailable in this session" };
    if ("status" in result && result.status === "answered" && "answer" in result && typeof result.answer === "string")
      return { answer: result.answer };
  }
  if (isError && typeof result === "object" && result !== null && "error" in result && typeof result.error === "string")
    return { note: `Error: ${result.error}` };
  return { raw: result };
};
