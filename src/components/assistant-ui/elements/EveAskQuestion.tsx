import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import type { JSX } from "react";
import { readOutcome, type IAskQuestionArgs } from "../utils/askQuestion.js";
import { ToolFallbackApproval, ToolFallbackResult } from "../native/ToolFallbackRoot.js";
export function EveAskQuestion({
  args,
  approval,
  result,
  isError,
  status,
  respondToApproval,
}: ToolCallMessagePartProps<IAskQuestionArgs>): JSX.Element | null {
  const outcome = readOutcome(result, isError);
  const settled = approval !== undefined && (approval.approved !== undefined || approval.resolution !== undefined);
  if (
    approval !== undefined &&
    (outcome === undefined || (settled && ("answer" in outcome || (isError && approval.approved === false))))
  ) {
    return (
      <ToolFallbackApproval
        data-testid="EveAskQuestion"
        approval={
          outcome && "answer" in outcome && approval.text === undefined
            ? { ...approval, text: outcome.answer }
            : approval
        }
        respondToApproval={respondToApproval}
        status={status}
      />
    );
  }
  if (outcome === undefined) return null;
  const prompt = approval?.prompt ?? args.question;
  return (
    <div data-testid="EveAskQuestion" className="my-2 flex flex-col gap-1.5">
      {prompt && <p className="text-muted-foreground whitespace-pre-line">{prompt}</p>}
      {"raw" in outcome ? (
        <ToolFallbackResult result={outcome.raw} />
      ) : (
        <p className="whitespace-pre-line">{"answer" in outcome ? outcome.answer : outcome.note}</p>
      )}
    </div>
  );
}
