import type { SuggestionAdapter, ThreadSuggestion } from "@assistant-ui/react";
import { fn } from "storybook/test";
export const fixture_generateSuggestions = fn(async (): Promise<readonly ThreadSuggestion[]> => [
  { prompt: "Explain the recovery steps", title: "Recovery", label: "Next steps" },
]);
export const fixture_suggestionAdapter: SuggestionAdapter = {
  generate: fixture_generateSuggestions,
};
