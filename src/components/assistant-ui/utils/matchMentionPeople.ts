import type { IComposerPerson } from "../elements/composer/types.js";

export function matchMentionPeople(value: string, people: readonly IComposerPerson[] | undefined): IComposerPerson[] {
  if (!people) return [];
  const match = /@([\w]*)$/.exec(value);
  if (!match) return [];
  const query = match[1]?.toLowerCase() ?? "";
  return people.filter((person) => person.name.toLowerCase().startsWith(query));
}
