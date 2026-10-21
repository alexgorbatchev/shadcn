import stripAnsi from "strip-ansi";

import Anser from "anser";
import { stripTerminalControls } from "./stripTerminalControls.js";

export interface ITerminalFragment {
  text: string;
  foregroundColor: string | null;
  backgroundColor: string | null;
  isBold: boolean;
  isDim: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isHidden: boolean;
  isReverse: boolean;
}
export interface IParsedTerminalLine {
  fragments: ITerminalFragment[];
  text: string;
}

export function parseTerminalLine(line: string): IParsedTerminalLine {
  // Canonicalize the equivalent C1/ESC encodings before handling string boundaries.
  const normalized = line.replace(
    /[\u0090\u0098\u009b-\u009f]/gu,
    (control) => `\u001b${String.fromCharCode(control.charCodeAt(0) - 0x40)}`,
  );
  const parsed = Anser.ansiToJson(stripTerminalControls(normalized), { remove_empty: true, use_classes: false });
  const fragments = parsed.map((fragment): ITerminalFragment => ({
    text: stripAnsi(fragment.content),
    foregroundColor: fragment.fg ? `rgb(${fragment.fg})` : null,
    backgroundColor: fragment.bg ? `rgb(${fragment.bg})` : null,
    isBold: fragment.decorations.includes("bold"),
    isDim: fragment.decorations.includes("dim"),
    isItalic: fragment.decorations.includes("italic"),
    isUnderline: fragment.decorations.includes("underline"),
    isStrikethrough: fragment.decorations.includes("strikethrough"),
    isHidden: fragment.decorations.includes("hidden"),
    isReverse: fragment.decorations.includes("reverse"),
  }));
  return { fragments, text: fragments.map((fragment) => fragment.text).join("") };
}
