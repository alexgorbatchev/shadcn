import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
export interface IDatedMessage {
  id: string;
  day: string;
  time: string;
  role: "user" | "assistant";
  text: string;
}
export function DaySeparator({ messages, ...props }: IDaySeparatorProps): JSX.Element {
  return (
    <div
      data-testid="DaySeparator"
      data-slot="day-separator"
      className="flex w-full max-w-sm flex-col gap-2 text-sm"
      {...props}
    >
      {messages.map((message, index) => {
        const isNewDay = message.day !== messages[index - 1]?.day;
        return (
          <div key={message.id} className="flex flex-col gap-2">
            {isNewDay && (
              <div role="separator" aria-label={message.day} className="flex items-center gap-2 py-1">
                <span className="bg-foreground/[0.08] h-px flex-1" />
                <span className={cn(mono, "text-muted-foreground")}>{message.day}</span>
                <span className="bg-foreground/[0.08] h-px flex-1" />
              </div>
            )}
            <div className={cn("group flex items-baseline gap-2", message.role === "user" && "flex-row-reverse")}>
              <span
                className={cn(
                  "max-w-[80%] text-base leading-relaxed break-words",
                  message.role === "user" ? "bg-foreground/[0.05] rounded-md px-3.5 py-2" : "text-foreground/75",
                )}
              >
                {message.text}
              </span>
              <span
                className={cn(
                  mono,
                  "text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 shrink-0 tabular-nums transition-opacity",
                )}
              >
                {message.time}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
interface IDaySeparatorProps extends Omit<ComponentProps<"div">, "children" | "messages" | "className" | "style"> {
  messages: readonly IDatedMessage[];
}
