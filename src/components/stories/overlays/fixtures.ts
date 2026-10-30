import { fn } from "storybook/test";

export const fixture_confirmation = { pending: Promise.withResolvers<void>() };
export const fixture_formDialogAction = fn();
