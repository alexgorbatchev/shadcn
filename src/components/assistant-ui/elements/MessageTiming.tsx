import type { JSX } from "react";
import type { ILabelValue } from "./types.js";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
export type ITimingStat = ILabelValue;
export function MessageTiming({ stats, streaming, className, ...props }: IMessageTimingProps): JSX.Element {
  return (
    <dl
      data-testid="MessageTiming"
      data-slot="message-timing"
      className={cn(
        cn(
          "fade-in animate-in m-0 flex w-full max-w-sm flex-wrap items-center gap-x-3 gap-y-1 duration-500 motion-reduce:animate-none",
        ),
        className,
      )}
      {...props}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-baseline gap-1">
          <dt className={cn(mono, "text-muted-foreground")}>{stat.label}</dt>
          <dd className={cn(mono, "m-0 tabular-nums", streaming ? "text-primary" : "text-muted-foreground")}>
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
interface IMessageTimingProps extends Omit<ComponentProps<"dl">, "children" | "stats" | "streaming"> {
  stats: readonly ITimingStat[];
  streaming?: boolean;
}
