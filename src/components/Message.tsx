import type { ComponentProps, ReactElement } from "react";
import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { IDensityProps } from "../density/types.js";
import type { IMessageContextValue, MessageStyle } from "../message/types.js";
import { useRender } from "@base-ui/react/use-render";
import { MessageContext } from "../message/MessageContext.js";
import { cn } from "../utils/cn.js";
import { ChevronRightIcon } from "lucide-react";
import { buttonVariants } from "./Button.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible.js";

type MessageGroupProps = ComponentProps<"div"> & IDensityProps;

function MessageGroup({ density, className, ...props }: MessageGroupProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="message-group"
      className={cn("flex min-w-0 flex-col gap-control-gap", className)}
      {...props}
    />
  );
}

type MessageProps = ComponentProps<"div"> & IDensityProps & { align?: "start" | "end" };

function Message({ density, className, align = "start", style, ...props }: MessageProps): ReactElement {
  const [footerOffset, setFooterOffset] = useState(0);
  const context = useMemo<IMessageContextValue>(() => ({ setFooterOffset }), []);
  const messageStyle: MessageStyle = { ...style, "--message-footer-offset": `${footerOffset}px` };
  return (
    <MessageContext.Provider value={context}>
      <div
        data-density={density}
        data-slot="message"
        data-align={align}
        style={messageStyle}
        className={cn(
          "group/message relative flex w-full min-w-0 items-end gap-control-gap text-sm data-[align=end]:flex-row-reverse",
          className,
        )}
        {...props}
      />
    </MessageContext.Provider>
  );
}

type MessageAvatarProps = ComponentProps<"div"> & IDensityProps;

function MessageAvatar({ density, className, ...props }: MessageAvatarProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="message-avatar"
      className={cn(
        "flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-(--message-footer-offset)",
        className,
      )}
      {...props}
    />
  );
}

type MessageContentProps = ComponentProps<"div"> & IDensityProps;

function MessageContent({ density, className, ...props }: MessageContentProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="message-content"
      className={cn(
        "flex w-full min-w-0 flex-col gap-control-gap wrap-break-word group-data-[align=end]/message:[&>[data-slot]:not([data-slot=message-header])]:self-end",
        className,
      )}
      {...props}
    />
  );
}

type MessageHeaderProps = ComponentProps<"div"> & IDensityProps;

function MessageHeader({ density, className, ...props }: MessageHeaderProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="message-header"
      className={cn(
        "flex max-w-full min-w-0 items-center px-control-x text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0",
        className,
      )}
      {...props}
    />
  );
}

type MessageFooterProps = ComponentProps<"div"> & IDensityProps;

function MessageFooter({ density, className, ...props }: MessageFooterProps): ReactElement {
  const context = useContext(MessageContext);
  const footerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const footer = footerRef.current;
    const content = footer?.parentElement;
    if (!context || !footer || !content) return;
    const measure = () => {
      const surface = footer.previousElementSibling;
      context.setFooterOffset(
        surface ? content.getBoundingClientRect().bottom - surface.getBoundingClientRect().bottom : 0,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(footer, { box: "border-box" });
    observer.observe(content, { box: "border-box" });
    return () => {
      observer.disconnect();
      context.setFooterOffset(0);
    };
  }, [context]);
  return useRender({
    defaultTagName: "div",
    ref: footerRef,
    state: { slot: "message-footer", density },
    props: {
      ...props,
      className: cn(
        "flex max-w-full min-w-0 items-center px-control-x text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end",
        className,
      ),
    },
  });
}

type MessageThreadProps = ComponentProps<typeof Collapsible> & IDensityProps;

/**
 * The replies under a message, collapsed to one summary line such as "3 replies · last: your agent, 2 min ago" until
 * the reader expands them. Controlled through `open` and `onOpenChange`, or uncontrolled through `defaultOpen`.
 */
function MessageThread({ density, className, ...props }: MessageThreadProps): ReactElement {
  return (
    <Collapsible
      data-density={density}
      data-slot="message-thread"
      className={cn("flex min-w-0 flex-col gap-control-gap", className)}
      {...props}
    />
  );
}

type MessageThreadSummaryProps = ComponentProps<typeof CollapsibleTrigger> & IDensityProps;

/** The summary line that expands or collapses a thread's replies; it reports its state through `aria-expanded`. */
function MessageThreadSummary({ density, className, children, ...props }: MessageThreadSummaryProps): ReactElement {
  return (
    <CollapsibleTrigger
      data-density={density}
      data-slot="message-thread-summary"
      className={cn(
        buttonVariants({ variant: "link", size: "inline" }),
        "group/message-thread-summary w-fit max-w-full justify-start text-xs whitespace-normal text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ChevronRightIcon
        aria-hidden="true"
        className="size-3 shrink-0 group-aria-expanded/message-thread-summary:rotate-90 motion-reduce:transition-none"
      />
      {children}
    </CollapsibleTrigger>
  );
}

type MessageThreadRepliesProps = ComponentProps<typeof CollapsibleContent> & IDensityProps;

/** The replies a thread summary expands. */
function MessageThreadReplies({ density, className, ...props }: MessageThreadRepliesProps): ReactElement {
  return (
    <CollapsibleContent
      data-density={density}
      data-slot="message-thread-replies"
      className={cn("min-w-0", className)}
      {...props}
    />
  );
}

export {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
  MessageThread,
  MessageThreadSummary,
  MessageThreadReplies,
};
