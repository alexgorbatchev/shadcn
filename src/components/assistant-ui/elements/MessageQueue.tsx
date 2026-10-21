import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { ArrowUpIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export interface IQueuedMessage {
  id: string;
  text: string;
}
export function MessageQueue({ running, queued, onCancel, ...props }: IMessageQueueProps): JSX.Element {
  return (
    <div
      data-testid="MessageQueue"
      data-slot="message-queue"
      className={cn("flex w-full max-w-sm flex-col gap-2")}
      {...props}
    >
      <div className={cn(paper, "flex items-center gap-2.5 rounded-md p-3")}>
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
          <span className="relative inline-flex size-2 rounded-full bg-primary bg-primary" />
        </span>
        <span className="text-foreground/90 min-w-0 flex-1 truncate text-base">{running}</span>
        <span className={cn(mono, "text-muted-foreground shrink-0")}>running</span>
      </div>

      {queued.length > 0 && (
        <div className="flex items-baseline justify-between px-1">
          <span className={cn(mono, "text-muted-foreground")}>{queued.length} queued</span>
          <span className={cn(mono, "text-muted-foreground")}>sends when this finishes</span>
        </div>
      )}

      <ul className="flex flex-col gap-1.5">
        {queued.map((message, index) => (
          <li
            key={message.id}
            className={cn(
              field,
              "fade-in slide-in-from-bottom-1 animate-in fill-mode-both flex items-center gap-2.5 rounded-md py-2 pr-2 pl-3 duration-300",
            )}
          >
            <span className={cn(mono, "text-muted-foreground w-3 shrink-0 tabular-nums")}>{index + 1}</span>
            <span className="text-foreground/60 min-w-0 flex-1 truncate text-base">{message.text}</span>
            <ArrowUpIcon aria-hidden="true" className={cn("size-3.5")} />
            {onCancel && (
              <Button
                type="button"
                aria-label={`Remove "${message.text}" from the queue`}
                onClick={() => onCancel(message.id)}
                variant="ghost"
                size="icon"
              >
                <XIcon aria-hidden="true" data-icon="inline-start" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
interface IMessageQueueProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "running" | "queued" | "onCancel">,
  "className" | "style"
> {
  running: string;
  queued: readonly IQueuedMessage[];
  onCancel?: (id: string) => void;
}
