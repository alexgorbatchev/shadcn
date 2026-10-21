import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { BrainIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
export type MemoryChange = "added" | "updated" | "existing";
export interface IMemoryChip {
  id: string;
  text: string;
  change: MemoryChange;
}
export function MemoryChips({ chips, onForget, ...props }: IMemoryChipsProps): JSX.Element {
  const fresh = chips.filter((chip) => chip.change !== "existing").length;
  return (
    <div
      data-testid="MemoryChips"
      data-slot="memory-chips"
      className={cn("flex w-full max-w-sm flex-col gap-2")}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        <BrainIcon aria-hidden="true" className={cn("size-4")} />
        <span className={cn(mono, "text-muted-foreground")}>{fresh > 0 ? `remembered ${fresh}` : "memory"}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip.id}
            className={cn(
              "fade-in animate-in fill-mode-both group flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-sm duration-300",
              chip.change === "existing"
                ? cn(field, "text-muted-foreground")
                : "bg-primary/12 text-primary bg-primary/15 text-primary",
            )}
          >
            {chip.text}
            {onForget && (
              <Button
                type="button"
                aria-label={`Forget "${chip.text}"`}
                onClick={() => onForget(chip.id)}
                variant="ghost"
                size="icon"
              >
                <XIcon aria-hidden="true" data-icon="inline-start" />
              </Button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
interface IMemoryChipsProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "chips" | "onForget">,
  "className" | "style"
> {
  chips: readonly IMemoryChip[];
  onForget?: (id: string) => void;
}
