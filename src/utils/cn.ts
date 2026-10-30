import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const mergeClasses = extendTailwindMerge({
  extend: {
    theme: {
      spacing: [
        "control",
        "control-xs",
        "control-sm",
        "control-lg",
        "control-x",
        "control-gap",
        "tag",
        "tag-x",
        "panel",
        "panel-sm",
        "field-gap",
        "section",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return mergeClasses(clsx(inputs));
}
