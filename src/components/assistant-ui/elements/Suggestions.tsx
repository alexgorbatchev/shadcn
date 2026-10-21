import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
export interface ISuggestionsProps extends Omit<ComponentProps<"div">, "children"> {
  suggestions: readonly string[];
  selectedSuggestion: string | null;
  cycle: number;
  onSuggestion: (suggestion: string) => void;
  variant?: "pills" | "list";
}
export function Suggestions({
  suggestions,
  selectedSuggestion,
  cycle,
  onSuggestion,
  variant = "pills",
  className,
  ...props
}: ISuggestionsProps): JSX.Element {
  const list = variant === "list";
  return (
    <div
      data-testid="Suggestions"
      data-slot="suggestions"
      key={cycle}
      className={cn(
        cn(list ? "flex w-full max-w-sm flex-col gap-2" : "flex max-w-md flex-wrap justify-center gap-2"),
        className,
      )}
      {...props}
    >
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          type="button"
          aria-pressed={selectedSuggestion === suggestion}
          onClick={() => onSuggestion(suggestion)}
          variant="ghost"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
