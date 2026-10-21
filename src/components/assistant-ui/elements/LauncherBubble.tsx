import { useId, type ComponentProps, type JSX } from "react";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { Badge } from "../../Badge.js";
import { cn } from "../../../utils/cn.js";
import { field, floating } from "./constants.js";
interface ILauncherBubbleProps extends Omit<ComponentProps<"div">, "children" | "className" | "style"> {
  open: boolean;
  unread: number;
  greeting: string;
  prompts: readonly string[];
  replyExpectation?: string;
  onToggle?: () => void;
  onPick?: (prompt: string) => void;
  onStart?: () => void;
}
export function LauncherBubble({
  open,
  unread,
  greeting,
  prompts,
  replyExpectation,
  onToggle,
  onPick,
  onStart,
  ...props
}: ILauncherBubbleProps): JSX.Element {
  const panelId = useId();
  const unreadId = useId();
  return (
    <div
      data-testid="LauncherBubble"
      data-slot="launcher-bubble"
      className="flex w-full max-w-xs flex-col items-end gap-2"
      {...props}
    >
      {open ? (
        <section
          id={panelId}
          aria-label="Assistant welcome"
          className={cn(floating, "flex w-full flex-col gap-2 rounded-md p-2")}
        >
          <h2 className="text-base font-medium">{greeting}</h2>
          {replyExpectation ? <p className="text-sm text-muted-foreground">{replyExpectation}</p> : null}
          <div className="flex flex-col gap-1">
            {prompts.map((prompt) =>
              onPick ? (
                <Button key={prompt} variant="ghost" align="start" onClick={() => onPick(prompt)}>
                  {prompt}
                </Button>
              ) : (
                <span key={prompt} className={cn(field, "rounded-sm p-1.5 text-sm")}>
                  {prompt}
                </span>
              ),
            )}
          </div>
          {onStart ? (
            <Button variant="default" onClick={onStart}>
              Start a conversation
            </Button>
          ) : null}
        </section>
      ) : null}
      {onToggle || !open ? (
        <Button
          variant="default"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-describedby={unread > 0 && !open ? unreadId : undefined}
          aria-label={open ? "Close the assistant" : "Open the assistant"}
          onClick={onToggle}
          disabled={!onToggle}
        >
          {open ? (
            <XIcon aria-hidden="true" data-icon="inline-start" />
          ) : (
            <MessageCircleIcon aria-hidden="true" data-icon="inline-start" />
          )}
          {unread > 0 && !open ? <Badge id={unreadId}>{unread} unread</Badge> : null}
        </Button>
      ) : null}
    </div>
  );
}
