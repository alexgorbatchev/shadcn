import { Button } from "../../Button.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../InputGroup.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { ArrowUpIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { paper } from "./constants.js";
export function ChatPanel({ ...props }: ChatPanelProps): JSX.Element {
  return (
    <div
      data-testid="ChatPanel"
      data-slot="chat-panel"
      data-scroll="none"
      className={cn(paper, "flex h-[270px] w-full max-w-md flex-col overflow-hidden rounded-md")}
      {...props}
    />
  );
}
export function ChatPanelMessages({ ...props }: ChatPanelMessagesProps): JSX.Element {
  return (
    <div
      data-testid="ChatPanelMessages"
      data-slot="chat-panel-messages"
      className={cn("flex flex-1 flex-col justify-end gap-2.5 overflow-y-auto p-4")}
      {...props}
    />
  );
}
export function ChatPanelUserMessage({ ...props }: ChatPanelUserMessageProps): JSX.Element {
  return (
    <div
      data-testid="ChatPanelUserMessage"
      data-slot="chat-panel-user-message"
      className={cn(
        field,
        "fade-in slide-in-from-bottom-1 animate-in self-end rounded-md px-3 py-1.5 text-sm duration-300",
      )}
      {...props}
    />
  );
}
export function ChatPanelAssistantMessage({ ...props }: ChatPanelAssistantMessageProps): JSX.Element {
  return (
    <p
      data-testid="ChatPanelAssistantMessage"
      data-slot="chat-panel-assistant-message"
      className={cn("text-foreground/70 max-w-[85%] self-start text-sm leading-relaxed")}
      {...props}
    />
  );
}
export function ChatPanelTyping({ ...props }: ChatPanelTypingProps): JSX.Element {
  return (
    <div
      data-testid="ChatPanelTyping"
      data-slot="chat-panel-typing"
      role="status"
      className={cn("fade-in animate-in flex gap-1 self-start px-1 duration-300")}
      {...props}
    >
      <span className="sr-only">Assistant is typing</span>
      {["-0.32s", "-0.16s", "0s"].map((delay) => (
        <span
          key={delay}
          aria-hidden
          className="bg-foreground/40 size-1 animate-bounce rounded-full motion-reduce:animate-none"
          style={{ animationDelay: delay, animationDuration: "1.1s" }}
        />
      ))}
    </div>
  );
}
export function ChatPanelComposer({
  placeholder,
  onSend,
  value = "",
  onValueChange,
  ...props
}: IChatPanelComposerProps): JSX.Element {
  return (
    <form
      data-testid="ChatPanelComposer"
      data-slot="chat-panel-composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onSend?.();
      }}
      className="mx-panel mb-panel"
      {...props}
    >
      <InputGroup>
        <InputGroupInput
          aria-label="Message"
          placeholder={placeholder}
          value={value}
          readOnly={!onValueChange}
          onChange={(event) => onValueChange?.(event.currentTarget.value)}
        />
        <InputGroupAddon align="inline-end">
          <Button type="submit" aria-label="Send" disabled={!onSend || !value.trim()} variant="default" size="icon">
            <ArrowUpIcon aria-hidden="true" data-icon="inline-start" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
interface IChatPanelComposerProps extends Omit<
  Omit<ComponentProps<"form">, "children" | "placeholder" | "onSubmit">,
  "className" | "style"
> {
  placeholder: string;
  onSend?: () => void;
  value?: string;
  onValueChange?: (value: string) => void;
}
type ChatPanelProps = Omit<ComponentProps<"div">, "className" | "style">;
type ChatPanelMessagesProps = Omit<ComponentProps<"div">, "className" | "style">;
type ChatPanelUserMessageProps = Omit<ComponentProps<"div">, "className" | "style">;
type ChatPanelAssistantMessageProps = Omit<ComponentProps<"p">, "className" | "style">;
type ChatPanelTypingProps = Omit<ComponentProps<"div">, "children" | "className" | "style">;
