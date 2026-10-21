import { defineToolkit } from "@assistant-ui/react";
import { EveAskQuestion } from "./elements/EveAskQuestion.js";
export const eveAskQuestionToolkit = defineToolkit({
  ask_question: {
    type: "backend",
    display: "standalone",
    render: EveAskQuestion,
  },
});
