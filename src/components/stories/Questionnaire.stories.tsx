import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useMemo, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import {
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
} from "../questionnaire/Questionnaire";
import { Button } from "../Button";
import { DensityProvider } from "../DensityProvider";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../Dialog";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Card";
import { cn } from "../../utils/cn";
import { z } from "zod";

type SurveyProps = ComponentProps<typeof Questionnaire>;
type SurveyCompositionProps = SurveyProps & {
  progress?: ReactElement;
  nextAction?: ReactElement;
  itemClassName?: string;
};

function Survey({
  progress = <QuestionnaireProgress />,
  nextAction = <QuestionnaireNext />,
  itemClassName,
  ...props
}: SurveyCompositionProps): ReactElement {
  const [result, setResult] = useState("");
  return (
    <>
      <Questionnaire
        {...props}
        onSubmit={(event) => {
          event.preventDefault();
          setResult(JSON.stringify(Array.from(new FormData(event.currentTarget).entries())));
          props.onSubmit?.(event);
        }}
      >
        {progress}
        <QuestionnaireItem name="project" required className={itemClassName}>
          <QuestionnaireTitle>What should we build?</QuestionnaireTitle>
          <QuestionnaireDescription>Choose one answer or describe another project.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="library">
              Component library<QuestionnaireChoiceDescription>Reusable controls</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="app">Application</QuestionnaireChoice>
            <QuestionnaireInput aria-label="Another project" />
          </QuestionnaireChoices>
          <QuestionnaireError>Choose a project to continue.</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="context" multiple className={itemClassName}>
          <QuestionnaireTitle>What context should we inspect?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="source">Source code</QuestionnaireChoice>
            <QuestionnaireChoice value="tests">Existing tests</QuestionnaireChoice>
            <QuestionnaireChoice value="disabled" disabled>
              Private notes
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="schedule" required className={itemClassName}>
          <QuestionnaireTitle>When should work begin?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="now">Start now</QuestionnaireChoice>
            <QuestionnaireChoice value="later">Later</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          {nextAction}
          <QuestionnaireSubmit>Save plan</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
      <output aria-label="Saved answers">{result}</output>
    </>
  );
}

const meta: Meta<typeof Questionnaire> = {
  title: "shadcn-alexgorbatchev/components/Questionnaire",
  component: Questionnaire,
  tags: ["autodocs", "test"],
  args: { onItemChange: fn(), onSubmit: fn((event) => event.preventDefault()) },
  render: (args) => <Survey {...args} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const MultiStep: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole("progressbar", { name: "Questionnaire progress" });
    await expect(progress).toHaveAttribute("aria-valuenow", "1");
    await expect(canvas.queryByRole("group", { name: "What context should we inspect?" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("radio", { name: "Component library Reusable controls" }));
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByRole("group", { name: "What context should we inspect?" })).toHaveFocus();
    await expect(args.onItemChange).toHaveBeenLastCalledWith("context");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Source code" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Existing tests" }));
    await expect(canvas.getByRole("checkbox", { name: "Private notes" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Previous" }));
    await expect(canvas.getByRole("radio", { name: "Component library Reusable controls" })).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByRole("checkbox", { name: "Source code" })).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(progress).toHaveAttribute("aria-valuenow", "3");
    await userEvent.click(canvas.getByRole("radio", { name: "Start now" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save plan" }));
    await expect(canvas.getByLabelText("Saved answers")).toHaveTextContent(
      '[["project","library"],["context","source"],["context","tests"],["schedule","now"]]',
    );
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const RequiredValidation: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Choose a project to continue.")).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    const answer = canvas.getByRole("radio", { name: "Component library Reusable controls" });
    await expect(answer).toHaveFocus();
    await expect(answer).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("group", { name: "What should we build?" })).toHaveAccessibleDescription(
      "Choose one answer or describe another project. Choose a project to continue.",
    );
    await userEvent.click(answer);
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByRole("group", { name: "What context should we inspect?" })).toHaveFocus();
  },
};

export const FreeformAnswer: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Application" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Another project" }), "Documentation site");
    await expect(canvas.getByRole("radio", { name: "Application" })).not.toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await userEvent.click(canvas.getByRole("button", { name: "Skip" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Later" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save plan" }));
    await expect(canvas.getByLabelText("Saved answers")).toHaveTextContent(
      '[["project","Documentation site"],["schedule","later"]]',
    );
  },
};

export const LetterShortcuts: Story = {
  args: { shortcuts: "letters" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("group", { name: "What should we build?" }).focus();
    await userEvent.keyboard("b");
    await expect(canvas.getByRole("radio", { name: "Application" })).toBeChecked();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("group", { name: "What context should we inspect?" })).toHaveFocus();
    await userEvent.keyboard("a");
    await expect(canvas.getByRole("checkbox", { name: "Source code" })).toBeChecked();
    await userEvent.keyboard("a");
    await expect(canvas.getByRole("checkbox", { name: "Source code" })).not.toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Skip" }));
    await userEvent.keyboard("a{Enter}");
    await expect(canvas.getByLabelText("Saved answers")).toHaveTextContent('[["project","app"],["schedule","now"]]');
  },
};

export const NumberShortcuts: Story = {
  args: { shortcuts: "numbers" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Another project" });
    await userEvent.type(input, "12");
    await expect(canvas.getByRole("radio", { name: "Application" })).not.toBeChecked();
    await expect(input).toHaveValue("12");
    canvas.getByRole("group", { name: "What should we build?" }).focus();
    await userEvent.keyboard("2");
    await expect(canvas.getByRole("radio", { name: "Application" })).toBeChecked();
    await expect(input).toHaveValue("12");
    await expect(input).not.toHaveAttribute("name");
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    await expect(canvas.getByRole("group", { name: "What context should we inspect?" })).toHaveFocus();
  },
};

export const SkippedStatus: Story = {
  args: { defaultItem: "optional" },
  render: (args) => (
    <Questionnaire {...args}>
      <QuestionnaireItem name="optional" onStatusChange={fn()}>
        <QuestionnaireTitle>Optional preference</QuestionnaireTitle>
        <QuestionnaireChoice value="saved" defaultChecked>
          Saved preference
        </QuestionnaireChoice>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="last">
        <QuestionnaireTitle>Last question</QuestionnaireTitle>
        <QuestionnaireInput aria-label="Final answer" />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Skip" }));
    await userEvent.click(canvas.getByRole("button", { name: "Previous" }));
    await expect(canvas.getByRole("radio", { name: "Saved preference" })).not.toBeChecked();
    await expect(canvas.getByRole("group", { name: "Optional preference" })).toHaveAttribute("data-status", "skipped");
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByRole("group", { name: "Last question" })).toHaveFocus();
  },
};

export const ValidateAllItems: Story = {
  args: { defaultItem: "schedule" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Start now" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save plan" }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect(canvas.getByRole("radio", { name: "Component library Reusable controls" })).toHaveFocus();
    await expect(canvas.getByText("Choose a project to continue.")).toBeVisible();
  },
};

function ResumedSurvey(args: SurveyProps): ReactElement {
  return (
    <Questionnaire {...args} defaultItem="second">
      <QuestionnaireProgress />
      <QuestionnaireItem name="first" required>
        <QuestionnaireTitle>Saved first answer</QuestionnaireTitle>
        <QuestionnaireChoice value="yes" defaultChecked>
          Yes
        </QuestionnaireChoice>
      </QuestionnaireItem>
      <QuestionnaireItem name="second" required>
        <QuestionnaireTitle>Saved draft</QuestionnaireTitle>
        <QuestionnaireInput aria-label="Draft answer" defaultValue="Initial draft" />
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
        <Button type="reset">Reset draft</Button>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

export const ResumeAndReset: Story = {
  render: (args) => <ResumedSurvey {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Draft answer" })).toHaveValue("Initial draft");
    await userEvent.clear(canvas.getByRole("textbox", { name: "Draft answer" }));
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByRole("textbox", { name: "Draft answer" })).toHaveAttribute("aria-invalid", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Reset draft" }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Draft answer" })).toHaveValue("Initial draft"));
    await expect(canvas.getByRole("textbox", { name: "Draft answer" })).not.toHaveAttribute("aria-invalid", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Previous" }));
    await expect(canvas.getByRole("radio", { name: "Yes" })).toBeChecked();
  },
};

function ControlledSurvey(args: SurveyProps): ReactElement {
  const [item, setItem] = useState("first");
  return (
    <Questionnaire
      {...args}
      item={item}
      onItemChange={(next) => {
        setItem(next);
        args.onItemChange?.(next);
      }}
    >
      <QuestionnaireProgress
        render={(props, state) => (
          <div {...props}>
            {state.current}/{state.total}
          </div>
        )}
      />
      <QuestionnaireItem name="first" required>
        <QuestionnaireTitle>First question</QuestionnaireTitle>
        <QuestionnaireChoice value="yes">Continue</QuestionnaireChoice>
      </QuestionnaireItem>
      <QuestionnaireItem name="disabled" disabled>
        <QuestionnaireTitle>Unavailable question</QuestionnaireTitle>
        <QuestionnaireInput aria-label="Unavailable answer" defaultValue="Private" />
      </QuestionnaireItem>
      <QuestionnaireItem name="last" required>
        <QuestionnaireTitle>Final question</QuestionnaireTitle>
        <QuestionnaireInput aria-label="Final answer" />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}

export const ControlledAndDisabledItems: Story = {
  render: (args) => <ControlledSurvey {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar")).toHaveTextContent("1/2");
    await userEvent.click(canvas.getByRole("radio", { name: "Continue" }));
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(args.onItemChange).toHaveBeenLastCalledWith("last");
    await expect(canvas.getByRole("progressbar")).toHaveTextContent("2/2");
    await expect(canvas.getByRole("group", { name: "Final question" })).toHaveFocus();
    await userEvent.type(canvas.getByRole("textbox", { name: "Final answer" }), "Ready");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const ComfortableDensity: Story = {
  render: (args) => (
    <DensityProvider density="comfortable">
      <Survey {...args} />
    </DensityProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Another project" });
    await expect(input.getBoundingClientRect().height).toBe(28);
    await expect(canvas.getByRole("button", { name: "Next" }).getBoundingClientRect().height).toBe(28);
    await userEvent.type(input, "Accessible forms");
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByRole("group", { name: "What context should we inspect?" })).toHaveFocus();
  },
};

export const CompactDensity: Story = {
  render: (args) => (
    <DensityProvider density="compact">
      <Survey {...args} />
    </DensityProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Another project" }).getBoundingClientRect().height).toBe(20);
    await expect(canvas.getByRole("button", { name: "Next" }).getBoundingClientRect().height).toBe(20);
    await userEvent.click(canvas.getByRole("radio", { name: "Application" }));
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByRole("group", { name: "What context should we inspect?" })).toHaveFocus();
  },
};

export const ChoiceIndicators: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole("radio", { name: "Application" });
    await userEvent.click(radio);
    await expect(radio.closest("label")?.querySelector("[data-slot=questionnaire-choice-indicator-dot]")).toBeVisible();
    await expect(
      radio.closest("label")?.querySelector("[data-slot=questionnaire-choice-indicator-check]"),
    ).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    const checkbox = canvas.getByRole("checkbox", { name: "Source code" });
    await userEvent.click(checkbox);
    await expect(
      checkbox.closest("label")?.querySelector("[data-slot=questionnaire-choice-indicator-check]"),
    ).toBeVisible();
    await expect(
      checkbox.closest("label")?.querySelector("[data-slot=questionnaire-choice-indicator-dot]"),
    ).not.toBeVisible();
    await userEvent.click(checkbox);
    await expect(
      checkbox.closest("label")?.querySelector("[data-slot=questionnaire-choice-indicator-check]"),
    ).not.toBeVisible();
  },
};

function ExternalValidationSurvey(args: SurveyProps): ReactElement {
  const [isInvalid, setIsInvalid] = useState(true);
  return (
    <Questionnaire {...args}>
      <QuestionnaireItem name="approval" invalid={isInvalid} required>
        <QuestionnaireTitle>Approval code</QuestionnaireTitle>
        <QuestionnaireInput
          aria-label="Code"
          onChange={(event) => setIsInvalid(event.currentTarget.value !== "accepted")}
        />
        <QuestionnaireError>Use the approval code supplied by your team.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}

export const ExternalValidation: Story = {
  render: (args) => <ExternalValidationSurvey {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Code" }), "incorrect");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await expect(canvas.getByRole("textbox", { name: "Code" })).toHaveFocus();
    await expect(canvas.getByRole("alert")).toHaveTextContent("Use the approval code supplied by your team.");
    await userEvent.clear(canvas.getByRole("textbox", { name: "Code" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "Code" }), "accepted");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const NativeRenderAndRefs: Story = {
  args: { ref: fn() },
  render: (args) => (
    <Questionnaire
      {...args}
      shortcuts="letters"
      items={[{ name: "tool", required: true, choices: [{ value: "disabled", disabled: true }, { value: "native" }] }]}
    >
      <QuestionnaireProgress
        render={(props, state) => (
          <div {...props}>
            {state.current} enabled step of {state.total}
          </div>
        )}
      />
      <QuestionnaireItem name="tool" required aria-labelledby="custom-question-title">
        <QuestionnaireTitle id="custom-question-title" render={<h2 />}>
          Choose a tool
        </QuestionnaireTitle>
        <QuestionnaireDescription render={<span />}>
          Disabled tools are omitted from shortcuts.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="disabled" disabled>
            Unavailable tool
          </QuestionnaireChoice>
          <QuestionnaireChoice
            value="native"
            render={(props, state) => <label {...props} title={String(state.checked)} />}
          >
            Native tool
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireActions>
          <QuestionnaireSubmit render={(props, state) => <button {...props} disabled={state.status !== "answered"} />}>
            Confirm tool
          </QuestionnaireSubmit>
        </QuestionnaireActions>
      </QuestionnaireItem>
    </Questionnaire>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await expect(args.ref).toHaveBeenCalledWith(expect.any(HTMLFormElement));
    await expect(canvas.getByRole("progressbar")).toHaveTextContent("1 enabled step of 1");
    await expect(canvas.getByRole("group", { name: "Choose a tool" })).toHaveAccessibleDescription(
      "Disabled tools are omitted from shortcuts.",
    );
    await expect(canvas.getByRole("button", { name: "Confirm tool" })).toBeDisabled();
    canvas.getByRole("group", { name: "Choose a tool" }).focus();
    await userEvent.keyboard("a");
    await expect(canvas.getByRole("radio", { name: "Native tool" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Native tool" }).closest("label")).toHaveAttribute("title", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Confirm tool" }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const DialogComposition: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger>Configure project</DialogTrigger>
      <DialogContent>
        <DialogTitle>Project configuration</DialogTitle>
        <DialogDescription>Complete the survey or cancel.</DialogDescription>
        <Survey {...args} />
        <DialogClose>Cancel configuration</DialogClose>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Configure project" });
    await userEvent.click(trigger);
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Project configuration" }),
    );
    await userEvent.click(dialog.getByRole("radio", { name: "Application" }));
    await userEvent.click(dialog.getByRole("button", { name: "Next" }));
    await expect(dialog.getByRole("group", { name: "What context should we inspect?" })).toHaveFocus();
    await userEvent.click(dialog.getByRole("button", { name: "Cancel configuration" }));
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

function ConditionalSurvey(args: SurveyProps): ReactElement {
  const [runtime, setRuntime] = useState("local");
  const [result, setResult] = useState("");
  const items = useMemo(
    () => [
      { name: "runtime", required: true },
      { name: "environment", required: true, disabled: runtime !== "cloud" },
      { name: "approval", required: true },
    ],
    [runtime],
  );
  return (
    <>
      <Questionnaire
        {...args}
        items={items}
        onSubmit={(event) => {
          event.preventDefault();
          setResult(JSON.stringify(Array.from(new FormData(event.currentTarget).entries())));
          args.onSubmit?.(event);
        }}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="runtime" required>
          <QuestionnaireTitle>Where should work run?</QuestionnaireTitle>
          <QuestionnaireDescription>Cloud runs include an environment question.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="local" checked={runtime === "local"} onChange={() => setRuntime("local")}>
              Local workspace
            </QuestionnaireChoice>
            <QuestionnaireChoice value="cloud" checked={runtime === "cloud"} onChange={() => setRuntime("cloud")}>
              Cloud workspace
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireItem name="environment" required disabled={runtime !== "cloud"}>
          <QuestionnaireTitle>Which environment?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="preview">Preview environment</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="approval" required>
          <QuestionnaireTitle>Who should review?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="team">Project team</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Save execution plan</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
      <output aria-label="Execution plan">{result}</output>
    </>
  );
}
export const ConditionalItems: Story = {
  render: (args) => <ConditionalSurvey {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole("progressbar");
    await expect(progress).toHaveAttribute("aria-valuemax", "2");
    await userEvent.click(canvas.getByRole("radio", { name: "Cloud workspace" }));
    await expect(progress).toHaveAttribute("aria-valuemax", "3");
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByRole("group", { name: "Which environment?" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("radio", { name: "Preview environment" }));
    await userEvent.click(canvas.getByRole("button", { name: "Previous" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Local workspace" }));
    await expect(progress).toHaveAttribute("aria-valuemax", "2");
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByRole("group", { name: "Who should review?" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("radio", { name: "Project team" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save execution plan" }));
    await expect(canvas.getByLabelText("Execution plan")).toHaveTextContent(
      '[["runtime","local"],["approval","team"]]',
    );
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const NavigationState: Story = {
  render: (args) => (
    <Survey
      {...args}
      nextAction={
        <QuestionnaireNext render={(props, state) => <button {...props} disabled={state.status !== "answered"} />} />
      }
    />
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole("button", { name: "Next" });
    await expect(next).toBeDisabled();
    await userEvent.click(canvas.getByRole("radio", { name: "Application" }));
    await expect(next).toBeEnabled();
    await userEvent.click(next);
    await expect(canvas.getByRole("group", { name: "What context should we inspect?" })).toHaveFocus();
    await expect(next).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Source code" }));
    await expect(next).toBeEnabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Source code" }));
    await expect(next).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Skip" }));
    await expect(canvas.getByRole("group", { name: "When should work begin?" })).toHaveFocus();
  },
};

export const CustomProgress: Story = {
  render: (args) => (
    <Survey
      {...args}
      progress={
        <QuestionnaireProgress
          className="w-full"
          render={(props, state) => (
            <div {...props}>
              <div aria-hidden="true" className="flex gap-2">
                {Array.from({ length: state.total }, (_, index) => (
                  <span key={index} className={cn("h-1 flex-1", index < state.current ? "bg-primary" : "bg-muted")} />
                ))}
              </div>
              <span>
                Checkpoint {state.current} of {state.total}
              </span>
            </div>
          )}
        />
      }
    />
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole("progressbar");
    await expect(progress).toHaveTextContent("Checkpoint 1 of 3");
    await expect(progress).toHaveAttribute("aria-valuenow", "1");
    await userEvent.click(canvas.getByRole("radio", { name: "Application" }));
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(progress).toHaveTextContent("Checkpoint 2 of 3");
    await expect(progress).toHaveAttribute("aria-valuenow", "2");
    await userEvent.click(canvas.getByRole("button", { name: "Skip" }));
    await expect(progress).toHaveTextContent("Checkpoint 3 of 3");
    await userEvent.click(canvas.getByRole("button", { name: "Previous" }));
    await expect(progress).toHaveTextContent("Checkpoint 2 of 3");
  },
};

export const AnimatedItems: Story = {
  render: (args) => (
    <Survey
      {...args}
      itemClassName="min-h-64 data-active:animate-in data-active:fade-in-0 data-active:duration-300 data-active:motion-reduce:animate-none"
    />
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole("progressbar");
    const next = canvas.getByRole("button", { name: "Next" });
    const progressTop = progress.getBoundingClientRect().top;
    const nextTop = next.getBoundingClientRect().top;
    await userEvent.click(canvas.getByRole("radio", { name: "Application" }));
    await userEvent.click(next);
    const item = canvas.getByRole("group", { name: "What context should we inspect?" });
    await expect(item).toHaveFocus();
    await expect(getComputedStyle(item).animationName).toBe(
      ["enter", "none"][Number(matchMedia("(prefers-reduced-motion: reduce)").matches)],
    );
    await waitFor(() =>
      expect(item.getAnimations().every((animation) => animation.playState !== "running")).toBe(true),
    );
    await expect(progress.getAnimations()).toHaveLength(0);
    await expect(next.getAnimations()).toHaveLength(0);
    await expect(progress.getBoundingClientRect().top).toBe(progressTop);
    await expect(next.getBoundingClientRect().top).toBe(nextTop);
  },
};

function CardSurvey(args: SurveyProps): ReactElement {
  const taskTitleId = useId();
  const outputTitleId = useId();
  return (
    <Questionnaire
      {...args}
      shortcuts="numbers"
      items={[
        { name: "task", required: true, choices: [{ value: "tests" }, { value: "docs" }] },
        { name: "output", required: true, choices: [{ value: "summary" }, { value: "files" }] },
      ]}
    >
      <Card>
        <QuestionnaireItem name="task" required aria-labelledby={taskTitleId}>
          <CardHeader>
            <QuestionnaireTitle id={taskTitleId} render={<CardTitle role="heading" aria-level={2} />}>
              Choose a task
            </QuestionnaireTitle>
            <QuestionnaireDescription render={<CardDescription />}>
              Choose the next task to review.
            </QuestionnaireDescription>
            <CardAction>
              <QuestionnaireProgress />
            </CardAction>
          </CardHeader>
          <CardContent>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="tests">Fix failing tests</QuestionnaireChoice>
              <QuestionnaireChoice value="docs">Write documentation</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </CardContent>
        </QuestionnaireItem>
        <QuestionnaireItem name="output" required aria-labelledby={outputTitleId}>
          <CardHeader>
            <QuestionnaireTitle id={outputTitleId} render={<CardTitle role="heading" aria-level={2} />}>
              Choose a handoff
            </QuestionnaireTitle>
            <QuestionnaireDescription render={<CardDescription />}>
              Pick the detail needed for review.
            </QuestionnaireDescription>
            <CardAction>
              <QuestionnaireProgress />
            </CardAction>
          </CardHeader>
          <CardContent>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="summary">Summary only</QuestionnaireChoice>
              <QuestionnaireChoice value="files">Summary and changed files</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </CardContent>
        </QuestionnaireItem>
        <CardFooter>
          <QuestionnaireActions className="w-full">
            <QuestionnairePrevious />
            <QuestionnaireNext />
            <QuestionnaireSubmit>Create task</QuestionnaireSubmit>
          </QuestionnaireActions>
        </CardFooter>
      </Card>
    </Questionnaire>
  );
}
export const CardComposition: Story = {
  render: (args) => <CardSurvey {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const task = canvas.getByRole("group", { name: "Choose a task" });
    await expect(task).toHaveAccessibleDescription("Choose the next task to review.");
    await expect(canvas.getByRole("heading", { name: "Choose a task" })).toHaveAttribute("aria-level", "2");
    task.focus();
    await userEvent.keyboard("2{Enter}");
    const output = canvas.getByRole("group", { name: "Choose a handoff" });
    await expect(output).toHaveFocus();
    await expect(output).toHaveAccessibleDescription("Pick the detail needed for review.");
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    await userEvent.keyboard("1{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

const responseSchema = z
  .object({ detail: z.enum(["summary", "complete"]), audience: z.enum(["team", "public"]) })
  .superRefine((answers, context) => {
    if (answers.audience === "public" && answers.detail === "summary") {
      context.addIssue({ code: "custom", path: ["detail"], message: "Public answers need complete context." });
    }
  });
function SchemaSurvey(args: SurveyProps): ReactElement {
  const [item, setItem] = useState("detail");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  return (
    <>
      <Questionnaire
        {...args}
        item={item}
        onItemChange={setItem}
        onSubmit={(event) => {
          event.preventDefault();
          const parsed = responseSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
          if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Review the response configuration.");
            setItem("detail");
            return;
          }
          setError("");
          setResult(JSON.stringify(parsed.data));
          args.onSubmit?.(event);
        }}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="detail" required invalid={Boolean(error)}>
          <QuestionnaireTitle>How much context?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="summary" onChange={() => setError("")}>
              Concise summary
            </QuestionnaireChoice>
            <QuestionnaireChoice value="complete" onChange={() => setError("")}>
              Complete answer
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError>{error || "Choose the response detail."}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="audience" required>
          <QuestionnaireTitle>Who will read it?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="team">My team</QuestionnaireChoice>
            <QuestionnaireChoice value="public">Public audience</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Validate response</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
      <output aria-label="Validated response">{result}</output>
    </>
  );
}
export const SchemaValidation: Story = {
  render: (args) => <SchemaSurvey {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Concise summary" }));
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Public audience" }));
    await userEvent.click(canvas.getByRole("button", { name: "Validate response" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("Public answers need complete context.");
    await expect(canvas.getByRole("group", { name: "How much context?" })).toHaveAttribute("aria-invalid", "true");
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("radio", { name: "Complete answer" }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByRole("radio", { name: "Public audience" })).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Validate response" }));
    await expect(canvas.getByLabelText("Validated response")).toHaveTextContent(
      '{"detail":"complete","audience":"public"}',
    );
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
