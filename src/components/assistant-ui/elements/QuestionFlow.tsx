import { useCallback, useId, useLayoutEffect, useRef, useState, type ComponentProps, type JSX } from "react";

import { Button } from "../../Button.js";
import { useReceiptFocus } from "../hooks/useReceiptFocus.js";
import { OptionList } from "./OptionList.js";
import type { IQuestionFlowStep } from "./types.js";

interface IQuestionFlowProps extends Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onSubmit" | "className" | "style"
> {
  steps: readonly IQuestionFlowStep[];
  defaultValue?: Readonly<Record<string, readonly string[]>>;
  onComplete?: (answers: Record<string, string[]>) => void | Promise<void>;
  completeLabel?: string;
  choice?: Readonly<Record<string, readonly string[]>>;
}

export function QuestionFlow({
  steps,
  defaultValue,
  onComplete,
  completeLabel = "Submit",
  choice,
  ref,
  ...props
}: IQuestionFlowProps): JSX.Element {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(Object.entries(defaultValue ?? {}).map(([id, value]) => [id, [...value]])),
  );
  const [confirmedAnswers, setConfirmedAnswers] = useState<Record<string, string[]> | undefined>();
  const [isCompleting, setIsCompleting] = useState(false);
  const questionPrefix = useId();
  const optionListRef = useRef<HTMLDivElement>(null);
  const { receiptRef, focusHandlers } = useReceiptFocus<HTMLDivElement>(props);
  const setReceiptRef = useCallback(
    (node: HTMLDivElement | null) => {
      receiptRef.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
      return undefined;
    },
    [ref, receiptRef],
  );
  const currentIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const currentStep = steps[currentIndex];
  const previousStepId = useRef(currentStep?.id);

  useLayoutEffect(() => {
    if (previousStepId.current === currentStep?.id) return;
    previousStepId.current = currentStep?.id;
    optionListRef.current
      ?.querySelector<HTMLElement>(
        'button:not([disabled]), [role="checkbox"]:not([aria-disabled="true"]), input:not([disabled])',
      )
      ?.focus();
  }, [currentStep?.id]);

  const completedChoice = choice ?? confirmedAnswers;

  async function confirm(ids: string[]): Promise<void> {
    if (!currentStep || !onComplete) return;
    const nextAnswers = { ...answers, [currentStep.id]: ids };
    if (currentIndex < steps.length - 1) {
      setAnswers(nextAnswers);
      setStepIndex(currentIndex + 1);
      return;
    }
    const stepIds = new Set(steps.map((step) => step.id));
    const completedAnswers = Object.fromEntries(Object.entries(nextAnswers).filter(([id]) => stepIds.has(id)));
    setIsCompleting(true);
    try {
      await onComplete(completedAnswers);
      setAnswers(nextAnswers);
      setConfirmedAnswers(completedAnswers);
    } catch (error) {
      setIsCompleting(false);
      throw error;
    }
  }

  if (completedChoice !== undefined)
    return (
      <div
        {...props}
        {...focusHandlers}
        ref={setReceiptRef}
        tabIndex={-1}
        data-testid="QuestionFlow"
        data-slot="question-flow"
        data-state="receipt"
        className="flex w-full max-w-sm flex-col gap-2 rounded-md border border-frame-edge bg-card p-2 text-card-foreground shadow-frame"
      >
        {steps.flatMap((step) => {
          const selected = completedChoice[step.id];
          if (!selected?.length) return [];
          return (
            <div key={step.id} className="flex flex-col gap-0.5">
              <span className="text-base text-muted-foreground">{step.question}</span>
              <span className="text-lg break-words">
                {step.options
                  .filter((option) => selected.includes(option.id))
                  .map((option) => option.label)
                  .join(", ")}
              </span>
            </div>
          );
        })}
      </div>
    );

  if (!onComplete)
    return (
      <div
        {...props}
        {...focusHandlers}
        ref={ref}
        data-testid="QuestionFlow"
        data-slot="question-flow"
        data-state="open"
        className="flex w-full max-w-sm flex-col gap-3 rounded-md border border-frame-edge bg-card p-2 text-card-foreground shadow-frame"
      >
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col gap-1">
            <p id={`${questionPrefix}-${step.id}`} className="text-lg font-medium">
              {step.question}
            </p>
            {step.description ? <p className="text-base text-muted-foreground">{step.description}</p> : null}
            <OptionList aria-labelledby={`${questionPrefix}-${step.id}`} options={step.options} variant="embedded" />
          </div>
        ))}
      </div>
    );

  if (!currentStep)
    return <div {...props} ref={ref} data-testid="QuestionFlow" data-slot="question-flow" data-state="open" />;

  return (
    <div
      {...props}
      {...focusHandlers}
      ref={ref}
      data-testid="QuestionFlow"
      data-slot="question-flow"
      data-state="open"
      className="flex w-full max-w-sm flex-col gap-2 rounded-md border border-frame-edge bg-card p-2 text-card-foreground shadow-frame"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-base text-muted-foreground tabular-nums">
          {currentIndex + 1} of {steps.length}
        </span>
        {currentIndex > 0 ? (
          <Button variant="ghost" disabled={isCompleting} onClick={() => setStepIndex(currentIndex - 1)}>
            Back
          </Button>
        ) : null}
      </div>
      <progress
        value={currentIndex + 1}
        max={steps.length}
        aria-label="Question progress"
        aria-valuetext={`Question ${currentIndex + 1} of ${steps.length}`}
        className="h-1 w-full accent-primary"
      />
      <p id={`${questionPrefix}-${currentStep.id}`} className="text-lg font-medium">
        {currentStep.question}
      </p>
      {currentStep.description ? <p className="text-base text-muted-foreground">{currentStep.description}</p> : null}
      <OptionList
        key={currentStep.id}
        ref={optionListRef}
        aria-labelledby={`${questionPrefix}-${currentStep.id}`}
        options={currentStep.options}
        selectionMode={currentStep.selectionMode}
        defaultValue={answers[currentStep.id]}
        minSelections={currentStep.minSelections}
        maxSelections={currentStep.maxSelections}
        onConfirm={confirm}
        confirmLabel={currentIndex === steps.length - 1 ? completeLabel : "Next"}
        variant="embedded"
      />
    </div>
  );
}
