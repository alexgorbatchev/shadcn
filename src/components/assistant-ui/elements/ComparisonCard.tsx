import type { JSX } from "react";
import type { ComponentProps } from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export interface IComparisonOption {
  id: string;
  name: string;
  headline: string;
  traits: readonly (string | false)[];
}
export function ComparisonCard({
  traitLabels,
  options,
  recommendedId,
  reason,
  ...props
}: IComparisonCardProps): JSX.Element {
  return (
    <div
      data-testid="ComparisonCard"
      data-slot="comparison-card"
      data-scroll="none"
      className={cn(paper, "flex w-full max-w-md flex-col gap-3 rounded-md p-4")}
      {...props}
    >
      <div className="flex gap-2">
        {options.map((option) => {
          const recommended = option.id === recommendedId;
          return (
            <div
              key={option.id}
              className={cn(
                "flex min-w-0 flex-1 flex-col gap-2 rounded-md p-3 transition-colors",
                recommended ? "bg-primary/[0.07] bg-primary/10" : field,
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="flex items-baseline gap-1.5">
                  <span className="truncate text-base font-medium">{option.name}</span>
                  {recommended && <span className={cn(mono, "shrink-0 text-primary text-primary")}>pick</span>}
                </span>
                <span className="text-muted-foreground truncate text-sm">{option.headline}</span>
              </div>

              <div className="flex flex-col gap-1">
                {traitLabels.map((label, i) => {
                  const trait = option.traits[i];
                  const absent = !trait;
                  return (
                    <span key={`${i}-${label}`} className="flex items-center gap-1.5 text-sm">
                      {absent ? (
                        <MinusIcon aria-hidden="true" className={cn("size-3.5")} />
                      ) : (
                        <CheckIcon aria-hidden="true" className={cn("size-3.5", "text-success")} />
                      )}
                      <span className={cn("min-w-0 truncate", absent ? "text-muted-foreground" : "text-foreground/65")}>
                        {absent ? label : trait}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">{reason}</p>
    </div>
  );
}
interface IComparisonCardProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "traitLabels" | "options" | "recommendedId" | "reason">,
  "className" | "style"
> {
  traitLabels: readonly string[];
  options: readonly IComparisonOption[];
  recommendedId: string;
  reason: string;
}
