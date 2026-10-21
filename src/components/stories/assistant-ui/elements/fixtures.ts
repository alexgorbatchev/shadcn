import { SearchIcon, TerminalIcon } from "lucide-react";
import type {
  IComposerAttachment,
  IComposerCommand,
  IComposerPerson,
  IComposerUsage,
} from "../../../assistant-ui/elements/composer/types.js";

export const fixture_composerCommand: IComposerCommand = {
  name: "review",
  description: "Review a change",
  icon: SearchIcon,
};
export const fixture_composerPerson: IComposerPerson = { name: "Reviewer", role: "agent" };
export const fixture_composerCommands: readonly IComposerCommand[] = [
  fixture_composerCommand,
  { name: "run", description: "Run a command", icon: TerminalIcon },
];
export const fixture_composerPeople: readonly IComposerPerson[] = [
  fixture_composerPerson,
  { name: "Alex", role: "human" },
];
export const fixture_composerUsage: IComposerUsage = { system: 4, tools: 2, messages: 10, total: 64 };
export const fixture_composerAttachment: IComposerAttachment = {
  name: "Layout.tsx",
  meta: "TypeScript source",
  state: "done",
  kind: "text",
};
export const fixture_composerAudioLevels: readonly number[] = [0.2, 0.6, 0.9, 0.5, 0.3, 0.7, 0.8, 0.4];
