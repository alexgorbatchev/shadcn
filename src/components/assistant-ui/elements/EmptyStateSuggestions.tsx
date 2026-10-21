import { cn } from "../../../utils/cn.js";
import type { ComponentProps, JSX } from "react";
type EmptyStateSuggestionsProps = ComponentProps<"ul">;
export function EmptyStateSuggestions({ className, ...props }: EmptyStateSuggestionsProps): JSX.Element {
  return (
    <ul
      data-testid="EmptyStateSuggestions"
      data-slot="empty-state-suggestions"
      className={cn("m-0 flex list-none flex-wrap justify-center gap-2 p-0", className)}
      {...props}
    />
  );
}
