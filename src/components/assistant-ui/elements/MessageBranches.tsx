import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { indexIn } from "../utils/range.js";
export interface IMessageBranchesProps extends Omit<Omit<ComponentProps<"div">, "children">, "className" | "style"> {
  variants: readonly string[];
  index: number;
  onIndexChange: (index: number) => void;
}
export function MessageBranches({ variants, index, onIndexChange, ...props }: IMessageBranchesProps): JSX.Element {
  const activeIndex = indexIn(variants, index);
  const message = variants[activeIndex] ?? "";
  const hasNavigation = variants.length > 1;
  const goPrevious = () => {
    if (!hasNavigation) return;
    onIndexChange(activeIndex === 0 ? variants.length - 1 : activeIndex - 1);
  };
  const goNext = () => {
    if (!hasNavigation) return;
    onIndexChange(activeIndex === variants.length - 1 ? 0 : activeIndex + 1);
  };
  return (
    <div
      data-testid="MessageBranches"
      data-slot="message-branches"
      className={cn("flex max-w-sm flex-col gap-2")}
      {...props}
    >
      <p
        key={activeIndex}
        className="fade-in slide-in-from-bottom-1 animate-in text-foreground/90 min-h-[68px] text-sm leading-relaxed duration-300 motion-reduce:animate-none"
      >
        {message}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          aria-label="Show previous response"
          disabled={!hasNavigation}
          onClick={goPrevious}
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {variants.length === 0 ? "0 / 0" : `${activeIndex + 1} / ${variants.length}`}
        </span>
        <Button
          type="button"
          aria-label="Show next response"
          disabled={!hasNavigation}
          onClick={goNext}
          variant="ghost"
          size="icon"
        >
          <ChevronRightIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
      </div>
    </div>
  );
}
