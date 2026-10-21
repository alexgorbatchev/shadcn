import type { NumberRollPartValue, NumberRollRenderedPart } from "./numberRollTypes.js";

interface INumberRollAtom {
  kind: "integer" | "fraction" | "group" | "symbol";
  value: string;
  type: string;
}

/** Preserve integer place identity from the right, independently of the formatted width. */
export function getNumberRollParts(
  value: number,
  formatter: Intl.NumberFormat,
  prefix?: string,
  suffix?: string,
): NumberRollPartValue[] {
  const atoms: INumberRollAtom[] = [];
  if (prefix) atoms.push({ kind: "symbol", type: "prefix", value: prefix });
  for (const part of formatter.formatToParts(value)) {
    if (part.type === "integer" || part.type === "fraction") {
      for (const character of part.value) {
        const isDigit = character >= "0" && character <= "9";
        atoms.push({ kind: isDigit ? part.type : "symbol", type: part.type, value: character });
      }
    } else {
      atoms.push({
        kind: part.type === "group" ? "group" : "symbol",
        type: part.type === "minusSign" || part.type === "plusSign" ? "sign" : part.type,
        value: part.value,
      });
    }
  }
  if (suffix) atoms.push({ kind: "symbol", type: "suffix", value: suffix });
  const counts = new Map<string, number>();
  const nextKey = (type: string): string => {
    const count = counts.get(type) ?? 0;
    counts.set(type, count + 1);
    return `${type}:${count}`;
  };
  const integerKeys = new Map<number, string>();
  for (const [index, atom] of [...atoms.entries()].reverse()) {
    if (atom.kind === "integer" || atom.kind === "group")
      integerKeys.set(index, nextKey(atom.kind === "integer" ? "int" : "group"));
  }
  return atoms.map((atom, index) => {
    if (atom.kind === "integer" || atom.kind === "fraction") {
      return { type: "digit", key: integerKeys.get(index) ?? nextKey("fraction"), digit: Number(atom.value) };
    }
    return { type: "symbol", key: integerKeys.get(index) ?? `${nextKey(atom.type)}:${atom.value}`, value: atom.value };
  });
}

export function mergeNumberRollParts(
  previous: readonly NumberRollRenderedPart[],
  next: readonly NumberRollPartValue[],
): NumberRollRenderedPart[] {
  const nextKeys = new Set(next.map((part) => part.key));
  const previousKeys = new Set(previous.map((part) => part.key));
  const output: NumberRollRenderedPart[] = [];
  let cursor = 0;
  const emitExited = (until?: string): void => {
    while (cursor < previous.length) {
      const part = previous[cursor];
      if (!part || part.key === until) break;
      cursor++;
      if (!nextKeys.has(part.key)) output.push({ ...part, isExiting: true });
    }
  };
  for (const part of next) {
    if (previousKeys.has(part.key)) {
      emitExited(part.key);
      cursor++;
      output.push(part);
    } else output.push({ ...part, hasEntered: true });
  }
  emitExited();
  return output;
}

export function getRollDelta(from: number, to: number, direction: number): number {
  const up = (((to - from) % 10) + 10) % 10;
  if (up === 0) return 0;
  if (direction > 0) return up;
  if (direction < 0) return up - 10;
  return up > 5 ? up - 10 : up;
}

export function getNumberRollCellOffset(cell: number, position: number): number {
  return Math.max(-1, Math.min(1, ((((cell - position) % 10) + 15) % 10) - 5));
}
