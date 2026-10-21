import type { JSX, ComponentProps } from "react";
import { CheckIcon, CopyIcon, EllipsisIcon, RefreshCwIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { ToggleGroup, ToggleGroupItem } from "../../ToggleGroup.js";

export type Reaction = "up" | "down" | null;
export interface IMessageActionsProps extends Omit<ComponentProps<"div">, "children" | "className" | "style"> {
  copied: boolean;
  reaction: Reaction;
  regenerating: boolean;
  onCopy: () => void;
  onReactionChange: (reaction: Reaction) => void;
  onRegenerate: () => void;
  onMore: () => void;
}

export function MessageActions({
  copied,
  reaction,
  regenerating,
  onCopy,
  onReactionChange,
  onRegenerate,
  onMore,
  ...props
}: IMessageActionsProps): JSX.Element {
  return (
    <div
      data-testid="MessageActions"
      role="group"
      aria-label="Response actions"
      className="flex items-center gap-control-gap"
      {...props}
    >
      <Button
        variant={copied ? "success" : "ghost"}
        size="icon-sm"
        aria-label={copied ? "Copied response" : "Copy response"}
        onClick={onCopy}
      >
        {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
      </Button>
      <ToggleGroup
        value={reaction ? [reaction] : []}
        aria-label="Response rating"
        onValueChange={(next) => {
          const selected = next[0];
          onReactionChange(selected === "up" || selected === "down" ? selected : null);
        }}
      >
        <ToggleGroupItem value="up" aria-label="Mark response helpful">
          <ThumbsUpIcon aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="down" aria-label="Mark response unhelpful">
          <ThumbsDownIcon aria-hidden="true" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Regenerate response"
        aria-busy={regenerating}
        onClick={onRegenerate}
      >
        <RefreshCwIcon
          aria-hidden="true"
          className={regenerating ? "animate-spin motion-reduce:animate-none" : undefined}
        />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="More response actions" onClick={onMore}>
        <EllipsisIcon aria-hidden="true" />
      </Button>
    </div>
  );
}
