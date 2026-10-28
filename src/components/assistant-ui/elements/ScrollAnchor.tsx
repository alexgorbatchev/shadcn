import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import { useLayoutEffect, useRef, type ComponentProps, type JSX } from "react";
import { ArrowDownIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, inkButton, paper } from "./constants.js";
export interface IScrollAnchorMessage {
  role: "user" | "assistant";
  text: string;
}
interface IScrollAnchorProps extends Omit<ComponentProps<"div">, "children"> {
  messages: readonly IScrollAnchorMessage[];
  isFollowing: boolean;
  unreadCount: number;
  onFollowingChange: (isFollowing: boolean) => void;
}
export function ScrollAnchor({
  messages,
  isFollowing,
  unreadCount,
  onFollowingChange,
  className,
  ...props
}: IScrollAnchorProps): JSX.Element {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // A frame fires scroll events before resize observations, so a scroll away from the latest message pauses following
  // here before React renders the pause; otherwise a resize in that frame would scroll back and resume following.
  const isFollowingRef = useRef(isFollowing);
  useLayoutEffect(() => {
    isFollowingRef.current = isFollowing;
  }, [isFollowing]);
  useLayoutEffect(() => {
    if (!isFollowing) return;
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const follow = (): void => {
      if (isFollowingRef.current) viewport.scrollTo({ top: viewport.scrollHeight });
    };
    follow();
    const observer = new ResizeObserver(follow);
    observer.observe(content);
    return () => observer.disconnect();
  }, [isFollowing, messages.length]);
  return (
    <div
      data-testid="ScrollAnchor"
      data-slot="scroll-anchor"
      className={cn(cn(paper, "relative h-64 w-full max-w-sm overflow-hidden rounded-md"), className)}
      {...props}
    >
      <div
        ref={viewportRef}
        role="log"
        aria-label="Conversation messages"
        aria-live="polite"
        aria-relevant="additions text"
        tabIndex={0}
        onScroll={(event) => {
          const viewport = event.currentTarget;
          const isAtLatest = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 1;
          isFollowingRef.current = isAtLatest;
          if (isAtLatest !== isFollowing) onFollowingChange(isAtLatest);
        }}
        className="h-full overflow-y-auto p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div ref={contentRef} className="flex flex-col gap-2.5">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "max-w-[85%] text-sm leading-relaxed",
                message.role === "user"
                  ? cn(field, "self-end rounded-md px-3 py-1.5")
                  : "self-start text-muted-foreground",
              )}
            >
              {message.text}
            </div>
          ))}
        </div>
      </div>
      {!isFollowing && unreadCount > 0 ? (
        <AnalyticsButton
          component="ScrollAnchor"
          type="button"
          onClick={() => onFollowingChange(true)}
          className={cn(
            inkButton,
            "absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full px-3 py-1 text-sm",
          )}
        >
          <ArrowDownIcon aria-hidden="true" className={cn("size-4")} />
          {unreadCount} new {unreadCount === 1 ? "message" : "messages"}
        </AnalyticsButton>
      ) : null}
    </div>
  );
}
