import type { ComponentProps, JSX } from "react";
import { Button } from "../../Button.js";
interface IEmptyStateSuggestionProps extends Omit<ComponentProps<typeof Button>, "variant"> {
  index?: number;
}
export function EmptyStateSuggestion({ index = 0, ...props }: IEmptyStateSuggestionProps): JSX.Element {
  return (
    <li
      data-testid="EmptyStateSuggestion"
      className="animate-in fade-in fill-mode-both duration-300 motion-reduce:animate-none"
      style={{ animationDelay: `${Math.max(0, index) * 50}ms` }}
    >
      <Button variant="outline" {...props}></Button>
    </li>
  );
}
