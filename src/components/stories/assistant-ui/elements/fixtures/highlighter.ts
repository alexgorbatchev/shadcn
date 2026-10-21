import type { LanguageRegistration, LanguageInput } from "shiki/core";
export const fixture_reviewLanguage: LanguageRegistration = {
  name: "review-language",
  scopeName: "source.review",
  repository: {},
  patterns: [{ name: "keyword.control.review", match: "READY" }],
};
export const fixture_reviewLanguageLoader: LanguageInput = async () => fixture_reviewLanguage;
