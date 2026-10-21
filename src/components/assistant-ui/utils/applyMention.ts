export function applyMention(value: string, name: string): string {
  return value.replace(/@[\w]*$/, `@${name} `);
}
