import { Button } from "../../Button.js";
import type { JSX } from "react";
type StoppedRunProps = Omit<ComponentProps<"div">, "children" | "words" | "reason" | "onContinue" | "onDiscard"> & {
  words: readonly string[];
  reason: string;
  onContinue?: () => void;
  onDiscard?: () => void;
};
import type { ComponentProps } from "react";
import { ArrowRightIcon, SquareIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, mono } from "./constants.js";
export function StoppedRun({
  words,
  reason,
  onContinue,
  onDiscard,
  className,
  ...props
}: StoppedRunProps): JSX.Element {
  return (
    <div
      data-testid="StoppedRun"
      data-slot="stopped-run"
      className={cn(cn("flex w-full max-w-sm flex-col gap-3"), className)}
      {...props}
    >
      <p className="text-foreground text-base leading-relaxed">
        {words.join(" ")}
        <span
          aria-hidden
          className="bg-foreground/20 ms-1 inline-block h-[1em] w-[2px] translate-y-[0.15em] rounded-full"
        />
      </p>

      <div className="flex items-center gap-2">
        <span
          className={cn(field, mono, "text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1")}
        >
          <SquareIcon aria-hidden="true" className={cn("size-4")} />
          {reason}
        </span>

        <Button type="button" onClick={onContinue} variant="ghost">
          Continue
          <ArrowRightIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
        <Button type="button" onClick={onDiscard} variant="ghost">
          Discard
        </Button>
      </div>
    </div>
  );
}
