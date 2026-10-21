import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactElement } from "react";
import { getNumberRollParts, mergeNumberRollParts } from "../utils/getNumberRollParts.js";
import type { NumberRollRenderedPart } from "../utils/numberRollTypes.js";
import { NumberRollPart } from "./NumberRollPart.js";

type NumberRollProps = Omit<ComponentProps<"span">, "children" | "prefix" | "className" | "style"> & {
  value: number;
  format?: Intl.NumberFormatOptions;
  locales?: Intl.LocalesArgument;
  prefix?: string;
  suffix?: string;
  trend?: "auto" | "up" | "down";
  duration?: number;
};
interface INumberRollDisplay {
  value: number;
  formatted: string;
  rendered: NumberRollRenderedPart[];
  direction: number;
}

/** Locale-aware odometer. Native Web Animations remain scoped to these elements in every ShadowRoot. */
export function NumberRoll({
  value,
  format,
  locales,
  prefix,
  suffix,
  trend = "auto",
  duration = 500,
  ...props
}: NumberRollProps): ReactElement {
  const formatter = useMemo(() => new Intl.NumberFormat(locales, format), [locales, format]);
  const parts = useMemo(() => getNumberRollParts(value, formatter, prefix, suffix), [value, formatter, prefix, suffix]);
  const formatted = `${prefix ?? ""}${formatter.format(value)}${suffix ?? ""}`;
  const animationDuration = Number.isFinite(duration) ? Math.max(0, duration) : 500;
  const [display, setDisplay] = useState<INumberRollDisplay>(() => ({
    value,
    formatted,
    rendered: parts,
    direction: 0,
  }));
  if (display.formatted !== formatted) {
    setDisplay({
      value,
      formatted,
      rendered: mergeNumberRollParts(display.rendered, parts),
      direction: trend === "up" ? 1 : trend === "down" ? -1 : Math.sign(value - display.value),
    });
  }
  const exitTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const previousDuration = useRef(animationDuration);
  useEffect(() => {
    const timers = exitTimers.current;
    if (previousDuration.current !== animationDuration) {
      previousDuration.current = animationDuration;
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    }
    const exiting = new Set(display.rendered.filter((part) => part.isExiting).map((part) => part.key));
    for (const [key, timer] of timers) {
      if (!exiting.has(key)) {
        clearTimeout(timer);
        timers.delete(key);
      }
    }
    for (const key of exiting) {
      if (timers.has(key)) continue;
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          setDisplay((current) => ({
            ...current,
            rendered: current.rendered.filter((part) => !(part.isExiting && part.key === key)),
          }));
        }, animationDuration),
      );
    }
  }, [display.rendered, animationDuration]);
  useEffect(() => {
    const timers = exitTimers.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);
  return (
    <span data-testid="NumberRoll" className="inline-block whitespace-nowrap tabular-nums" {...props}>
      <span className="sr-only">{formatted}</span>
      <span aria-hidden="true" className="inline-block select-none">
        {display.rendered.map((part) => (
          <NumberRollPart key={part.key} part={part} direction={display.direction} duration={animationDuration} />
        ))}
      </span>
    </span>
  );
}
