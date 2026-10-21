import type { ComponentProps, JSX } from "react";
import { Button } from "../../Button.js";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../../Popover.js";
import { ContextBreakdown } from "./ContextBreakdown.js";
import { announced, pct } from "../utils/range.js";
import type { IComposerUsage } from "./composer/types.js";
interface IComposerContextProps extends Omit<ComponentProps<"span">, "children" | "className" | "style"> {
  usage: IComposerUsage;
}
export function ComposerContext({ usage, ...props }: IComposerContextProps): JSX.Element {
  const used = usage.system + usage.tools + usage.messages;
  const percentage = announced(pct(used, usage.total));
  return (
    <span {...props} data-testid="ComposerContext" data-slot="composer-context">
      <Popover>
        <PopoverTrigger
          openOnHover
          render={<Button variant="ghost" aria-label={"Context usage: " + String(percentage) + "%"} />}
        >
          {percentage}%
        </PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Context usage</PopoverTitle>
          <ContextBreakdown
            variant="embedded"
            limit={usage.total * 1000}
            segments={[
              { label: "System", tokens: usage.system * 1000, tone: "primary" },
              { label: "Tools", tokens: usage.tools * 1000, tone: "success" },
              { label: "Messages", tokens: usage.messages * 1000, tone: "warning" },
            ]}
          />
        </PopoverContent>
      </Popover>
    </span>
  );
}
