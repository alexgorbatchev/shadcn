const ESCAPE = String.fromCharCode(27);
const BELL = String.fromCharCode(7);

/** Removes non-display control strings before SGR interpretation by Anser. */
export function stripTerminalControls(line: string): string {
  let result = "";
  let index = 0;
  while (index < line.length) {
    const character = line[index];
    if (character !== ESCAPE) {
      result += character;
      index += 1;
      continue;
    }
    const command = line[index + 1];
    if (command === undefined) break;
    if (/[ -/]/u.test(command)) {
      let end = index + 2;
      while (end < line.length && /[ -/]/u.test(line[end] ?? "")) end += 1;
      if (end === line.length) break;
      const final = line.charCodeAt(end);
      index = final >= 0x30 && final <= 0x7e ? end + 1 : end;
      continue;
    }
    if (command === "]" || command === "P" || command === "X" || command === "^" || command === "_") {
      index += 2;
      while (index < line.length) {
        if (command === "]" && line[index] === BELL) {
          index += 1;
          break;
        }
        if (line[index] === ESCAPE && line[index + 1] === "\\") {
          index += 2;
          break;
        }
        index += 1;
      }
      continue;
    }
    if (command === "[") {
      let end = index + 2;
      while (end < line.length && /[ -?]/u.test(line[end] ?? "")) end += 1;
      if (end === line.length) break;
    }
    result += character;
    index += 1;
  }
  return result;
}
