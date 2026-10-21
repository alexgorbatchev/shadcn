import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { IConversationTurn } from "./types.js";
type SharedConversationProps = Omit<
  ComponentProps<"div">,
  "children" | "title" | "sharedBy" | "sharedAt" | "turns" | "onContinue"
> & {
  title: string;
  sharedBy: string;
  sharedAt: string;
  turns: readonly ISharedTurn[];
  onContinue?: () => void;
};
import type { ComponentProps } from "react";
import { LinkIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
export type ISharedTurn = IConversationTurn;
export function SharedConversation({
  title,
  sharedBy,
  sharedAt,
  turns,
  onContinue,
  className,
  ...props
}: SharedConversationProps): JSX.Element {
  return (
    <div
      data-testid="SharedConversation"
      data-slot="shared-conversation"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col overflow-hidden rounded-md"), className)}
      {...props}
    >
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-3">
        <LinkIcon aria-hidden="true" className={cn("size-4")} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-medium">{title}</span>
          <span className={cn(mono, "text-muted-foreground truncate")}>
            shared by {sharedBy} · {sharedAt}
          </span>
        </div>
      </div>

      <div className="border-foreground/[0.07] flex flex-col gap-2.5 border-t px-4 py-3.5">
        {turns.map((turn) => (
          <div
            key={turn.id}
            className={cn(
              "text-base leading-relaxed",
              turn.role === "user"
                ? "bg-foreground/[0.05] ms-auto max-w-[85%] rounded-md px-3 py-2"
                : "text-muted-foreground",
            )}
          >
            {turn.text}
          </div>
        ))}
      </div>

      <div className="border-foreground/[0.07] flex items-center gap-2 border-t px-4 py-3">
        <span className={cn(mono, "text-muted-foreground")}>read only</span>
        <Button type="button" onClick={onContinue} variant="default">
          Continue in your own chat
        </Button>
      </div>
    </div>
  );
}
