import type { ComponentProps, ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Questionnaire as QuestionnairePrimitive } from "@shadcn/react/questionnaire";
import { cn } from "../../utils/cn.js";

import { buttonVariants, type Button } from "../Button.js";
import { CheckIcon } from "lucide-react";

function Questionnaire({
  density,
  className,
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Root> & IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Root
      data-density={density}
      data-slot="questionnaire"
      className={cn("flex w-full min-w-0 flex-col gap-field-gap", className)}
      {...props}
    />
  );
}

function QuestionnaireProgress({
  density,
  className,
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Progress> & IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Progress
      data-density={density}
      data-slot="questionnaire-progress"
      className={cn("min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

function QuestionnaireItem({
  density,
  className,
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Item> & IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Item
      data-density={density}
      data-slot="questionnaire-item"
      className={cn("flex min-w-0 flex-col gap-field-gap border-0 p-0 outline-none", className)}
      {...props}
    />
  );
}

function QuestionnaireTitle({
  density,
  className,
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Title> & IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Title
      data-density={density}
      data-slot="questionnaire-title"
      className={cn(
        "text-base leading-snug font-medium text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

function QuestionnaireDescription({
  density,
  className,
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Description> & IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Description
      data-density={density}
      data-slot="questionnaire-description"
      className={cn("text-sm text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

function QuestionnaireChoices({
  density,
  className,
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Choices> & IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Choices
      data-density={density}
      data-slot="questionnaire-choices"
      className={cn("group/questionnaire-choices grid min-w-0 gap-control-gap", className)}
      {...props}
    />
  );
}

function QuestionnaireChoice({
  children,
  density,
  className,
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Choice> & IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Choice
      data-density={density}
      data-slot="questionnaire-choice"
      className={cn(
        "group/questionnaire-choice relative flex min-h-control cursor-pointer items-start gap-control-gap rounded-sm border border-input bg-transparent px-control-x py-1 text-start text-sm transition-colors outline-none select-none hover:bg-muted/50 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-1 has-[>input:focus-visible]:ring-ring data-invalid:border-destructive data-checked:border-primary/40 data-checked:bg-muted motion-reduce:transition-none",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <QuestionnairePrimitive.ChoiceInput
        data-density={density}
        data-slot="questionnaire-choice-input"
        className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        data-density={density}
        data-slot="questionnaire-choice-indicator"
        className="pointer-events-none relative flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-sm border border-input group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground"
      >
        <span
          data-density={density}
          data-slot="questionnaire-choice-indicator-dot"
          className="hidden size-2 rounded-full bg-primary-foreground group-data-[type=radio]/questionnaire-choice:group-data-checked/questionnaire-choice:block"
        />
        <CheckIcon
          data-density={density}
          data-slot="questionnaire-choice-indicator-check"
          className="hidden size-3.5 group-data-[type=checkbox]/questionnaire-choice:group-data-checked/questionnaire-choice:block"
        />
      </span>
      <QuestionnairePrimitive.ChoiceLabel
        data-density={density}
        data-slot="questionnaire-choice-label"
        className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug"
      >
        {children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut
        data-density={density}
        data-slot="questionnaire-choice-shortcut"
        className="pointer-events-none ms-auto hidden size-5 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-sm border border-input bg-background font-mono text-[0.625rem] leading-none font-medium text-muted-foreground group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[shortcut]/questionnaire-choice:inline-flex"
      />
    </QuestionnairePrimitive.Choice>
  );
}

function QuestionnaireChoiceDescription({
  density,
  className,
  ...props
}: ComponentProps<"span"> & IDensityProps): ReactElement {
  return (
    <span
      data-density={density}
      data-slot="questionnaire-choice-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function QuestionnaireInput({
  density,
  className,
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Input> & IDensityProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="questionnaire-input-wrapper"
      className="group/questionnaire-input relative w-full min-w-0"
    >
      <QuestionnairePrimitive.Input
        data-density={density}
        data-slot="questionnaire-input"
        className={cn(
          "h-control w-full min-w-0 rounded-sm border border-input bg-secondary px-control-x py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive motion-reduce:transition-none",
          "selection:bg-primary selection:text-primary-foreground placeholder:text-faint-foreground",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function QuestionnaireError({
  density,
  className,
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Error> & IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Error
      data-density={density}
      data-slot="questionnaire-error"
      className={cn("mt-2 text-sm text-destructive", className)}
      {...props}
    />
  );
}

function QuestionnaireActions({ density, className, ...props }: ComponentProps<"div"> & IDensityProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="questionnaire-actions"
      className={cn(
        "grid min-h-control w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-control-gap",
        className,
      )}
      {...props}
    />
  );
}

function QuestionnairePrevious({
  children,
  density,
  className,
  size = "default",
  variant = "outline",
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Previous> &
  Pick<ComponentProps<typeof Button>, "size" | "variant"> &
  IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Previous
      data-density={density}
      data-slot="questionnaire-previous"
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-1 row-start-1 motion-reduce:transition-none justify-self-start",
        className,
      )}
      {...props}
    >
      {children ?? "Previous"}
    </QuestionnairePrimitive.Previous>
  );
}

function QuestionnaireSkip({
  children,
  density,
  className,
  size = "default",
  variant = "outline",
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Skip> &
  Pick<ComponentProps<typeof Button>, "size" | "variant"> &
  IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Skip
      data-density={density}
      data-slot="questionnaire-skip"
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-2 row-start-1 motion-reduce:transition-none justify-self-end",
        className,
      )}
      {...props}
    >
      {children ?? "Skip"}
    </QuestionnairePrimitive.Skip>
  );
}

function QuestionnaireNext({
  children,
  density,
  className,
  size = "default",
  variant = "default",
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Next> &
  Pick<ComponentProps<typeof Button>, "size" | "variant"> &
  IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Next
      data-density={density}
      data-slot="questionnaire-next"
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-3 row-start-1 motion-reduce:transition-none justify-self-end",
        className,
      )}
      {...props}
    >
      {children ?? "Next"}
    </QuestionnairePrimitive.Next>
  );
}

function QuestionnaireSubmit({
  children,
  density,
  className,
  size = "default",
  variant = "default",
  ...props
}: ComponentProps<typeof QuestionnairePrimitive.Submit> &
  Pick<ComponentProps<typeof Button>, "size" | "variant"> &
  IDensityProps): ReactElement {
  return (
    <QuestionnairePrimitive.Submit
      data-density={density}
      data-slot="questionnaire-submit"
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-3 row-start-1 motion-reduce:transition-none justify-self-end",
        className,
      )}
      {...props}
    >
      {children ?? "Submit"}
    </QuestionnairePrimitive.Submit>
  );
}

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
};
