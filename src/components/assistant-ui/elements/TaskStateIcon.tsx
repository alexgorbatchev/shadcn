import { Ban, CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import type { JSX } from "react";
import type { TaskCardState } from "./TaskCard.js";
type TaskStateIconProps = {
  state: TaskCardState;
};
export function TaskStateIcon({ state }: TaskStateIconProps): JSX.Element {
  if (state === "done") {
    return (
      <span data-testid="TaskStateIcon">
        <CheckIcon aria-hidden="true" className={cn("size-4")} />
      </span>
    );
  }
  if (state === "failed") {
    return (
      <span data-testid="TaskStateIcon">
        <XIcon aria-hidden="true" className={cn("size-4", "text-destructive")} />
      </span>
    );
  }
  if (state === "cancelled") {
    return (
      <span data-testid="TaskStateIcon">
        <Ban aria-hidden="true" className={cn("size-4")} />
      </span>
    );
  }
  if (state === "working") {
    return (
      <span data-testid="TaskStateIcon">
        <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
      </span>
    );
  }
  return (
    <span
      data-testid="TaskStateIcon"
      aria-hidden
      className={cn("border-foreground/35 m-1 size-1.5 shrink-0 rounded-full border")}
    />
  );
}
