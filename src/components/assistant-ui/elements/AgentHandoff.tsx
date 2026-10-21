import type { JSX } from "react";
import type { ComponentProps } from "react";
import { ArrowRightIcon, BotIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
export function AgentHandoff({
  from,
  to,
  reason,
  carried,
  settled,
  className,
  ...props
}: IAgentHandoffProps): JSX.Element {
  return (
    <div
      data-testid="AgentHandoff"
      data-slot="agent-handoff"
      className={cn(cn("flex w-full max-w-sm flex-col gap-2"), className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            field,
            "text-muted-foreground flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm transition-opacity duration-500",
            settled && "border-dashed",
          )}
        >
          <BotIcon aria-hidden="true" className={cn("size-3.5")} />
          {from}
        </span>

        <ArrowRightIcon
          aria-hidden="true"
          className={cn("size-3.5", settled ? "text-muted-foreground" : "text-primary")}
        />

        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm transition-colors duration-500",
            settled ? cn(field, "text-foreground") : "bg-primary/15 text-primary",
          )}
        >
          <BotIcon aria-hidden="true" className={cn("size-3.5")} />
          {to}
        </span>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">{reason}</p>

      {carried.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className={cn(mono, "text-muted-foreground")}>carried over</span>
          {carried.map((item) => (
            <span
              key={item}
              className="text-muted-foreground border-foreground/12 border-s ps-2.5 text-sm leading-relaxed"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
interface IAgentHandoffProps extends Omit<
  ComponentProps<"div">,
  "children" | "from" | "to" | "reason" | "carried" | "settled"
> {
  from: string;
  to: string;
  reason: string;
  carried: readonly string[];
  settled: boolean;
}
