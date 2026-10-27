export function formatOutput(text: string, home: string): string {
  return text.replaceAll(home, (match, offset: number, source: string) => {
    const before = source[offset - 1];
    const after = source[offset + match.length];
    return (!before || /[\s"'=(]/.test(before)) && (!after || /[/\\\s"'):]/.test(after)) ? "~" : match;
  });
}
