export interface IOptionListOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface IConversationTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export interface ILabelValue {
  label: string;
  value: string;
}

export interface IQuestionFlowStep {
  id: string;
  question: string;
  description?: string;
  options: readonly IOptionListOption[];
  selectionMode?: "single" | "multiple";
  minSelections?: number;
  maxSelections?: number;
}
