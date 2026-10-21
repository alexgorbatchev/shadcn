import type { JSX } from "react";
type RollingDigitProps = {
  digit: number;
};
type NumberTickerProps = Omit<ComponentProps<"div">, "children" | "value" | "label"> & {
  value: number;
  label: string;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
function RollingDigit({ digit }: RollingDigitProps): JSX.Element {
  return (
    <span data-testid="RollingDigit" className="inline-flex h-[1.15em] overflow-hidden">
      <span
        className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
        style={{ transform: `translateY(-${digit * 1.15}em)` }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="h-[1.15em] leading-[1.15]">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}
export function NumberTicker({ value, label, className, ...props }: NumberTickerProps): JSX.Element {
  const formatted = value.toLocaleString("en-US");
  return (
    <div
      data-testid="NumberTicker"
      data-slot="number-ticker"
      className={cn(cn("flex flex-col items-center gap-2.5"), className)}
      {...props}
    >
      <span className="flex text-3xl font-medium tracking-tight tabular-nums" aria-hidden="true">
        {formatted.split("").map((char, i) =>
          /\d/.test(char) ? (
            <RollingDigit key={i} digit={Number(char)} />
          ) : (
            <span key={i} className="h-[1.15em] leading-[1.15]">
              {char}
            </span>
          ),
        )}
      </span>
      <output aria-label={label} className="sr-only">
        {formatted}
      </output>
      <span aria-hidden="true" className={cn(mono, "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}
