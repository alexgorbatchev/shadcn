import type { IComposerCommand } from "../elements/composer/types.js";

export function matchSlashCommands(
  value: string,
  commands: readonly IComposerCommand[] | undefined,
): IComposerCommand[] {
  if (!commands || !value.startsWith("/")) return [];
  const query = value.slice(1).toLowerCase();
  return commands.filter((command) => command.name.toLowerCase().startsWith(query));
}
