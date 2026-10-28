import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import { AnalyticsTextarea } from "../../analytics/AnalyticsTextarea.js";
import type { ComponentPropsWithRef, ReactElement, Ref } from "react";
import { useResolvedPortalContainer } from "../hooks/useResolvedPortalContainer.js";
import { useDensity } from "../../../hooks/useDensity.js";
import { ComposerAddAttachment, ComposerAttachments, UserMessageAttachments } from "./AttachmentPreview.js";
import { File } from "../elements/File.js";
import { getFileHref } from "../utils/fileUtils.js";
import { ThreadFollowupSuggestions } from "./FollowupSuggestionsRow.js";
import { Image } from "../elements/Image.js";
import { MarkdownText } from "../elements/MarkdownText.js";
import { Reasoning, ReasoningRoot } from "./Reasoning.js";
import { ReasoningContent } from "../elements/ReasoningContent.js";
import { ReasoningText } from "../elements/ReasoningText.js";
import { ReasoningTrigger } from "../elements/ReasoningTrigger.js";
import { ToolFallback } from "./ToolFallbackRoot.js";
import { ToolGroupContent, ToolGroupRoot, ToolGroupTrigger } from "./ToolGroup.js";
import { TooltipIconButton } from "../elements/TooltipIconButton.js";
import { Button } from "../../Button.js";
import { Skeleton } from "../../Skeleton.js";
import { cn } from "../../../utils/cn.js";
import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  type AssistantState,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  groupPartByType,
  MessagePrimitive,
  SuggestionPrimitive,
  ThreadPrimitive,
  type FileMessagePartComponent,
  type ImageMessagePartComponent,
  type TextMessagePartComponent,
  type ToolCallMessagePartComponent,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  AudioLinesIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  MicIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PhoneIcon,
  RefreshCwIcon,
  SquareIcon,
  PlayIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  type ComponentType,
  type FC,
  type PropsWithChildren,
} from "react";

type ThreadRootContract = {
  isEmpty: boolean;
  autoFocus: boolean;
  emptyComposerPosition: "center" | "bottom";
  viewportProps?: ThreadProps["viewportProps"];
  composerInputRef?: Ref<HTMLTextAreaElement> | undefined;
};

export type ThreadGroupPart = MessagePrimitive.GroupedParts.GroupPart;
const shouldShowComposerResume = (s: AssistantState) =>
  !!s.thread.canResume && s.composer.type === "thread" && s.composer.isEmpty;
const reasoningDuration = (timing: ThreadGroupPart["timing"]) =>
  timing?.completedAt === undefined ? undefined : Math.round((timing.completedAt - timing.startedAt) / 1000);
/**
 * Optional component overrides for the thread. `AssistantMessage` and
 * `Welcome` replace whole sections; the remaining slots override how the
 * assistant message renders tool calls and part groups. Tool UIs registered
 * by name (toolkit `render`, `useAssistantDataUI`) take precedence over
 * `ToolFallback`. When `TaskGroup` is set, tool calls that carry a nested
 * conversation and have no registered UI render through it instead of the
 * tool group; without it they render like any other tool call.
 */
export type ThreadComponents = {
  UserText?: TextMessagePartComponent | undefined;
  ComposerActions?: ComponentType | undefined;
  AssistantMessage?: ComponentType | undefined;
  Welcome?: ComponentType | undefined;
  ToolFallback?: ToolCallMessagePartComponent | undefined;
  ToolGroup?:
    | ComponentType<
        PropsWithChildren<{
          group: ThreadGroupPart;
        }>
      >
    | undefined;
  ReasoningGroup?:
    | ComponentType<
        PropsWithChildren<{
          group: ThreadGroupPart;
        }>
      >
    | undefined;
  TaskGroup?:
    | ComponentType<{
        group: ThreadGroupPart;
      }>
    | undefined;
};
const messageGroupBy = groupPartByType({
  reasoning: ["group-chainOfThought", "group-reasoning"],
  "tool-call": ["group-chainOfThought", "group-tool"],
  "standalone-tool-call": [],
});
type ThreadGroupKey = "group-chainOfThought" | "group-reasoning" | "group-tool" | "group-task";
const TASK_GROUP_PATH: readonly ThreadGroupKey[] = ["group-chainOfThought", "group-task"];
const taskAwareGroupBy = (
  part: Parameters<typeof messageGroupBy>[0],
  context?: Parameters<typeof messageGroupBy>[1],
): readonly ThreadGroupKey[] => {
  const path = messageGroupBy(part, context);
  return part.type === "tool-call" &&
    part.messages !== undefined &&
    path.length > 0 &&
    !context?.toolUIs?.[part.toolName]?.length
    ? TASK_GROUP_PATH
    : path;
};
export type ThreadProps = {
  /** Native viewport behavior and ref, including scroll restoration. */
  viewportProps?: Omit<ComponentPropsWithRef<typeof ThreadPrimitive.Viewport>, "children" | "render"> | undefined;
  /** Ref to the thread composer's native input. */
  composerInputRef?: Ref<HTMLTextAreaElement> | undefined;
  components?: ThreadComponents | undefined;
  autoFocus?: boolean | undefined;
  /** Place the composer at the bottom even before the first message. */
  emptyComposerPosition?: "center" | "bottom" | undefined;
};
const EMPTY_COMPONENTS: ThreadComponents = {};
const ThreadComponentsContext = createContext<ThreadComponents>(EMPTY_COMPONENTS);
// Startup exposes a loading placeholder thread; treat it as a new chat so
// the composer mounts centered. Loads after startup keep the docked layout.
const isNewChatView = (s: AssistantState) =>
  s.thread.messages.length === 0 && (!s.thread.isLoading || s.threads.isLoading);
// A switched thread that is still fetching its history: skeleton, not welcome.
const isHistoryLoadingView = (s: AssistantState) =>
  s.thread.messages.length === 0 && s.thread.isLoading && !s.thread.isDisabled && !s.threads.isLoading;
const ThreadHistorySkeleton: FC = () => (
  <div
    data-slot="aui_thread-history-skeleton"
    role="status"
    className="animate-in fade-in fill-mode-both flex flex-col gap-y-6 [animation-delay:150ms] [animation-duration:200ms]"
  >
    <span className="sr-only">Loading conversation</span>
    <Skeleton className="h-3 w-full" />
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
    </div>
    <Skeleton className="h-3 w-full" />
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
    </div>
  </div>
);
export function Thread({
  components = EMPTY_COMPONENTS,
  autoFocus = true,
  emptyComposerPosition = "center",
  viewportProps,
  composerInputRef,
}: ThreadProps): ReactElement {
  const isEmpty = useAuiState(isNewChatView);
  return (
    <ThreadComponentsContext.Provider value={components}>
      <ThreadRoot
        isEmpty={isEmpty}
        autoFocus={autoFocus}
        emptyComposerPosition={emptyComposerPosition}
        viewportProps={viewportProps}
        composerInputRef={composerInputRef}
      />
    </ThreadComponentsContext.Provider>
  );
}
const ThreadRoot: FC<ThreadRootContract> = ({
  isEmpty,
  autoFocus,
  emptyComposerPosition,
  viewportProps,
  composerInputRef,
}) => {
  const { Welcome = ThreadWelcome } = useContext(ThreadComponentsContext);
  const isCentered = isEmpty && emptyComposerPosition === "center";
  return (
    <ThreadPrimitive.Root
      render={
        <div
          className={cn(
            "aui-root aui-thread-root bg-background @container flex h-full flex-col",
            "[--thread-max-width:704px] [--composer-bg:var(--secondary)] [--composer-radius:var(--radius-md)] [--composer-padding:6px]",
          )}
        />
      }
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        {...viewportProps}
        data-slot="aui_thread-viewport"
        render={<div className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth" />}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-4",
            isCentered && "justify-center",
          )}
        >
          <AuiIf condition={isNewChatView}>
            <Welcome />
          </AuiIf>
          <AuiIf condition={isHistoryLoadingView}>
            <ThreadHistorySkeleton />
          </AuiIf>

          <ThreadLoadEarlier />

          <div data-slot="aui_message-group" className="mb-14 flex flex-col gap-y-6 empty:hidden">
            <ThreadPrimitive.Messages>{() => <ThreadMessage />}</ThreadPrimitive.Messages>
          </div>

          <div aria-hidden="true" className={cn(!isCentered && "flex-1")} />
          <ThreadPrimitive.ViewportFooter
            render={
              <div
                className={cn(
                  "aui-thread-viewport-footer bg-background sticky bottom-0 flex flex-col gap-4 overflow-visible pb-4 md:pb-6",
                  !isCentered && "rounded-t-(--composer-radius)",
                )}
              />
            }
          >
            <ThreadScrollToBottom />
            <ThreadFollowupSuggestions />
            <Composer autoFocus={autoFocus} inputRef={composerInputRef} />
            <AuiIf condition={(s) => isNewChatView(s) && s.composer.isEmpty}>
              <ThreadSuggestions />
            </AuiIf>
          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};
const ThreadMessage: FC = () => {
  const { AssistantMessage: AssistantMessageComponent = AssistantMessage } = useContext(ThreadComponentsContext);
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);
  const isSpoken = useAuiState((s) => s.message.metadata.modality === "voice");
  if (isEditing) return <EditComposer />;
  if (isSpoken) return <SpokenMessage />;
  if (role === "user") return <UserMessage />;
  return <AssistantMessageComponent />;
};
type VoiceRunPosition = "single" | "start" | "middle" | "end";
const useVoiceRunPosition = (): VoiceRunPosition =>
  useAuiState((s) => {
    const before = s.thread.messages[s.message.index - 1]?.metadata.modality === "voice";
    const after = s.thread.messages[s.message.index + 1]?.metadata.modality === "voice";
    if (before) return after ? "middle" : "end";
    return after ? "start" : "single";
  });
const SpokenText: TextMessagePartComponent = ({ text }) => <p className="aui-spoken-message-text m-0">{text}</p>;
const SpokenMessage: FC = () => {
  const role = useAuiState((s) => s.message.role);
  const position = useVoiceRunPosition();
  const isSpeaking = useAuiState((s) => s.message.role === "assistant" && s.message.status?.type === "running");
  const opensExchange = position === "start" || position === "single";
  return (
    <MessagePrimitive.Root
      data-slot="aui_spoken-message-root"
      data-role={role}
      data-voice-run={position}
      render={
        <div
          className={cn(
            "aui-spoken-message bg-muted/40 mx-2 px-3 py-1.5 [contain-intrinsic-size:auto_48px] [content-visibility:auto]",
            position === "single" && "rounded-md py-2",
            position === "start" && "rounded-t-xl pt-2",
            position === "middle" && "-mt-6",
            position === "end" && "-mt-6 rounded-b-xl pb-2",
          )}
        />
      }
    >
      {opensExchange && (
        <div
          data-slot="aui_spoken-exchange-header"
          className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-sm"
        >
          <PhoneIcon aria-hidden="true" className="size-3.5 shrink-0" />
          <span>Voice conversation</span>
        </div>
      )}
      <div
        data-slot="aui_spoken-message-content"
        className="text-foreground flex items-start gap-2 text-sm leading-relaxed"
      >
        <span className="text-muted-foreground mt-1 shrink-0" aria-hidden>
          {role === "user" ? (
            <MicIcon aria-hidden="true" className="size-3.5 shrink-0" />
          ) : (
            <AudioLinesIcon aria-hidden="true" className="size-3.5 shrink-0" />
          )}
        </span>
        <span className="sr-only">{role === "user" ? "You said" : "Assistant said"}</span>
        <div className="min-w-0 flex-1 wrap-break-word">
          <MessagePrimitive.Parts components={{ Text: SpokenText }} />
          {isSpeaking && (
            <span
              data-slot="aui_spoken-message-indicator"
              role="status"
              className="text-muted-foreground ms-1 animate-pulse font-sans"
              aria-label="Assistant is speaking"
            >
              ●
            </span>
          )}
        </div>
        <SpokenActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};
const SpokenActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="always"
      render={<div className="aui-spoken-action-bar text-muted-foreground flex shrink-0 gap-1" />}
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon aria-hidden="true" className="size-4 shrink-0" />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon aria-hidden="true" className="size-4 shrink-0" />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
    </ActionBarPrimitive.Root>
  );
};
const FOCUSABLE_SELECTOR =
  "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1']):not([disabled])";
const nextFocusable = (start: Element) => {
  for (let element = start.nextElementSibling; element; element = element.nextElementSibling) {
    const target = element.matches(FOCUSABLE_SELECTOR) ? element : element.querySelector(FOCUSABLE_SELECTOR);
    if (target instanceof HTMLElement) return target;
  }
  return null;
};
const ThreadLoadEarlier: FC = () => {
  const visible = useAuiState((s) => s.thread.hasEarlier || s.thread.isLoadingEarlier);
  const loading = useAuiState((s) => s.thread.isLoadingEarlier);
  const slotRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef<Element | null>(null);
  // The last page removes the button; a keyboard user on it continues from the
  // next control in tab order rather than from the document body.
  useLayoutEffect(() => {
    const focused = focusedRef.current;
    const slot = slotRef.current;
    if (visible || !focused || focused.isConnected || !slot) return;
    focusedRef.current = null;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    nextFocusable(slot)?.focus();
  }, [visible]);
  return (
    <div
      ref={slotRef}
      className="contents"
      onFocus={(event) => {
        focusedRef.current = event.target;
      }}
    >
      <span role="status" className="sr-only">
        {loading ? "Loading earlier messages" : ""}
      </span>
      {visible && (
        <ThreadPrimitive.LoadEarlier asChild>
          <Button variant="ghost" data-slot="aui_thread-load-earlier">
            <span className={cn(loading && "shimmer motion-reduce:animate-none")}>
              {loading ? "Loading earlier messages" : "Load earlier messages"}
            </span>
          </Button>
        </ThreadPrimitive.LoadEarlier>
      )}
    </div>
  );
};
const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="default"
        className="absolute end-0 bottom-full mb-2 disabled:invisible"
      >
        <ArrowDownIcon aria-hidden="true" className="size-4 shrink-0" />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};
const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root mb-6 flex flex-col px-2">
      <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-2xl font-medium tracking-tight duration-200">
        How can I help you today?
      </p>
    </div>
  );
};
const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions flex w-full flex-col">
      <ThreadPrimitive.Suggestions>{() => <ThreadSuggestionItem />}</ThreadPrimitive.Suggestions>
    </div>
  );
};
const ThreadSuggestionItem: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestion-display fade-in slide-in-from-bottom-2 animate-in fill-mode-both duration-200">
      <SuggestionPrimitive.Trigger
        send
        render={
          <AnalyticsButton
            component="ThreadSuggestionItem"
            type="button"
            className="aui-thread-welcome-suggestion group hover:bg-foreground/[0.03] focus-visible:ring-ring/50 flex w-full items-baseline gap-2.5 rounded-md px-2 py-2 text-start text-sm transition-colors outline-none focus-visible:ring-1 motion-reduce:transition-none"
          />
        }
      >
        <span
          aria-hidden
          className="text-muted-foreground/60 group-hover:text-foreground font-mono text-sm transition-colors motion-reduce:transition-none"
        >
          {">"}
        </span>
        <span className="min-w-0 flex-1 truncate">
          <SuggestionPrimitive.Title
            render={<span className="aui-thread-welcome-suggestion-text-1 text-foreground" />}
          />{" "}
          <SuggestionPrimitive.Description
            render={<span className="aui-thread-welcome-suggestion-text-2 text-muted-foreground empty:hidden" />}
          />
        </span>
      </SuggestionPrimitive.Trigger>
    </div>
  );
};
const Composer: FC<{
  autoFocus: boolean;
  inputRef?: Ref<HTMLTextAreaElement> | undefined;
}> = ({ autoFocus, inputRef }) => {
  return (
    <ComposerPrimitive.Root render={<form className="aui-composer-root relative flex w-full flex-col" />}>
      <ComposerPrimitive.AttachmentDropzone
        render={
          <div
            data-slot="aui_composer-shell"
            className="border-frame-edge focus-within:border-foreground/25 data-[dragging=true]:border-ring flex w-full cursor-text flex-col gap-2 rounded-(--composer-radius) border bg-(--composer-bg) p-(--composer-padding) transition-[border-color] data-[dragging=true]:border-dashed data-[dragging=true]:bg-[color-mix(in_oklab,var(--color-accent)_50%,var(--color-background))]"
          />
        }
      >
        <ComposerAttachments />
        <ComposerPrimitive.Input
          ref={inputRef}
          placeholder="Send a message..."
          rows={1}
          autoFocus={autoFocus}
          enterKeyHint="send"
          aria-label="Message input"
          render={
            <AnalyticsTextarea
              component="Composer"
              className="aui-composer-input caret-primary placeholder:text-muted-foreground/60 max-h-48 min-h-10 w-full resize-none bg-transparent px-2.5 py-1 text-lg leading-6 outline-none"
            />
          }
        />
        <ComposerAction />
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
};
const ComposerAction: FC = () => {
  const { ComposerActions } = useContext(ThreadComponentsContext);
  // The stop control only cancels the send while no run it could stop is going.
  const isSending = useAuiState(
    (s) => s.composer.submission !== undefined && !(s.thread.isRunning && s.thread.capabilities.cancel),
  );
  return (
    <div className="aui-composer-action-wrapper relative flex items-center justify-between">
      <ComposerAddAttachment />
      <div className="flex items-center gap-1.5">
        {ComposerActions && <ComposerActions />}
        <AuiIf condition={(s) => s.thread.capabilities.dictation}>
          <AuiIf condition={(s) => s.composer.dictation == null}>
            <ComposerPrimitive.Dictate asChild>
              <TooltipIconButton
                tooltip="Voice Input"
                side="bottom"
                type="button"
                variant="ghost"
                aria-label="Start Voice Input"
              >
                <MicIcon aria-hidden="true" className="size-4 shrink-0" />
              </TooltipIconButton>
            </ComposerPrimitive.Dictate>
          </AuiIf>
          <AuiIf condition={(s) => s.composer.dictation != null}>
            <ComposerPrimitive.StopDictation asChild>
              <TooltipIconButton
                tooltip="Stop Dictation"
                side="bottom"
                type="button"
                variant="ghost"
                aria-label="Stop Voice Input"
              >
                <SquareIcon aria-hidden="true" className="size-3.5 shrink-0 animate-pulse motion-reduce:animate-none" />
              </TooltipIconButton>
            </ComposerPrimitive.StopDictation>
          </AuiIf>
        </AuiIf>
        <AuiIf
          condition={(s) =>
            (!s.composer.canCancel || (s.thread.voice !== undefined && s.composer.submission === undefined)) &&
            !shouldShowComposerResume(s)
          }
        >
          <ComposerPrimitive.Send asChild>
            <TooltipIconButton
              tooltip="Send Message"
              side="bottom"
              type="button"
              variant="default"
              aria-label="Send Message"
            >
              <ArrowUpIcon aria-hidden="true" className="size-4 shrink-0" />
            </TooltipIconButton>
          </ComposerPrimitive.Send>
        </AuiIf>
        <AuiIf condition={shouldShowComposerResume}>
          <ComposerPrimitive.Resume asChild>
            <TooltipIconButton
              tooltip="Resume Generating"
              side="bottom"
              type="button"
              variant="default"
              aria-label="Resume Generating"
            >
              <PlayIcon aria-hidden="true" className="size-4 shrink-0" />
            </TooltipIconButton>
          </ComposerPrimitive.Resume>
        </AuiIf>
        <AuiIf
          condition={(s) =>
            s.composer.canCancel && (s.thread.voice === undefined || s.composer.submission !== undefined)
          }
        >
          <ComposerPrimitive.Cancel asChild>
            <Button type="button" variant="default" aria-label={isSending ? "Cancel Sending" : "Stop Generating"}>
              <SquareIcon aria-hidden="true" className="size-3.5 shrink-0" />
            </Button>
          </ComposerPrimitive.Cancel>
        </AuiIf>
      </div>
    </div>
  );
};
const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root
        role="alert"
        render={
          <div className="aui-message-error-root border-destructive bg-destructive/10 text-destructive mt-2 rounded-md border p-2 text-sm" />
        }
      >
        <ErrorPrimitive.Message render={<span className="aui-message-error-message line-clamp-2" />} />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};
const AssistantMessage: FC = () => {
  const {
    ToolFallback: ToolFallbackComponent = ToolFallback,
    ToolGroup,
    ReasoningGroup,
    TaskGroup: TaskGroupComponent,
  } = useContext(ThreadComponentsContext);
  const groupBy = TaskGroupComponent ? taskAwareGroupBy : messageGroupBy;
  const ACTION_BAR_PT = "pt-1.5";
  // Keep the action bar inside the contained root's paint box, then cancel its reserved space in flow.
  const ACTION_BAR_HEIGHT = `min-h-7.5 ${ACTION_BAR_PT}`;
  return (
    <MessagePrimitive.Root
      data-slot="aui_assistant-message-root"
      data-role="assistant"
      render={
        <div className="fade-in slide-in-from-bottom-1 animate-in relative -mb-7.5 pb-7.5 duration-150 [contain-intrinsic-size:auto_200px] [content-visibility:auto]" />
      }
    >
      <div data-slot="aui_assistant-message-content" className="text-foreground px-2 leading-relaxed wrap-break-word">
        <MessagePrimitive.GroupedParts groupBy={groupBy}>
          {({ part, children }) => {
            switch (part.type) {
              case "group-chainOfThought":
                return <div data-slot="aui_chain-of-thought">{children}</div>;
              case "group-task":
                return TaskGroupComponent ? <TaskGroupComponent group={part} /> : null;
              case "group-tool":
                if (ToolGroup) {
                  return <ToolGroup group={part}>{children}</ToolGroup>;
                }
                return (
                  <ToolGroupRoot variant="ghost">
                    <ToolGroupTrigger count={part.indices.length} active={part.status.type === "running"} />
                    <ToolGroupContent>{children}</ToolGroupContent>
                  </ToolGroupRoot>
                );
              case "group-reasoning": {
                if (ReasoningGroup) {
                  return <ReasoningGroup group={part}>{children}</ReasoningGroup>;
                }
                const running = part.status.type === "running";
                return (
                  <ReasoningRoot streaming={running}>
                    <ReasoningTrigger active={running} duration={reasoningDuration(part.timing)} />
                    <ReasoningContent aria-busy={running}>
                      <ReasoningText>{children}</ReasoningText>
                    </ReasoningContent>
                  </ReasoningRoot>
                );
              }
              case "text":
                return <MarkdownText />;
              case "reasoning":
                return <Reasoning {...part} />;
              case "tool-call":
                return part.toolUI ?? <ToolFallbackComponent {...part} />;
              case "data":
                return part.dataRendererUI;
              case "file":
                return (
                  <div data-slot="aui_assistant-message-file" className="py-1">
                    <MessageFile {...part} />
                  </div>
                );
              case "image":
                return (
                  <div data-slot="aui_assistant-message-image" className="py-1">
                    <Image {...part} />
                  </div>
                );
              case "indicator":
                return (
                  <span
                    data-slot="aui_assistant-message-indicator"
                    className="animate-pulse font-sans"
                    aria-label="Assistant is working"
                  >
                    {"●"}
                  </span>
                );
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
        <MessageError />
      </div>

      <div data-slot="aui_assistant-message-footer" className={cn("ms-2 flex items-center", ACTION_BAR_HEIGHT)}>
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};
const AssistantActionBar: FC = () => {
  const { container: portalContainer, isReady: isPortalReady } = useResolvedPortalContainer();
  const density = useDensity();

  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      render={
        <div className="aui-assistant-action-bar-root text-muted-foreground animate-in fade-in col-start-3 row-start-2 -ms-1 flex gap-1 duration-200" />
      }
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon aria-hidden="true" className="size-4 shrink-0" />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon aria-hidden="true" className="size-4 shrink-0" />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <AuiIf condition={(s) => s.thread.capabilities.feedback}>
        <ActionBarPrimitive.FeedbackPositive asChild>
          <TooltipIconButton tooltip="Helpful">
            <ThumbsUpIcon aria-hidden="true" className="size-4 shrink-0" />
          </TooltipIconButton>
        </ActionBarPrimitive.FeedbackPositive>
        <ActionBarPrimitive.FeedbackNegative asChild>
          <TooltipIconButton tooltip="Not helpful">
            <ThumbsDownIcon aria-hidden="true" className="size-4 shrink-0" />
          </TooltipIconButton>
        </ActionBarPrimitive.FeedbackNegative>
      </AuiIf>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon aria-hidden="true" className="size-4 shrink-0" />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger asChild>
          <TooltipIconButton tooltip="More">
            <MoreHorizontalIcon aria-hidden="true" className="size-4 shrink-0" />
          </TooltipIconButton>
        </ActionBarMorePrimitive.Trigger>
        {isPortalReady && (
          <ActionBarMorePrimitive.Content
            data-density={density}
            side="bottom"
            align="start"
            sideOffset={6}
            asChild
            portalProps={{ container: portalContainer }}
          >
            <div className="aui-action-bar-more-content bg-popover text-popover-foreground data-[state=open]:fade-in-0  data-[state=open]:animate-in data-[state=closed]:fade-out-0  data-[state=closed]:animate-out data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[128px] overflow-hidden rounded-md border p-1.5">
              <ActionBarPrimitive.ExportMarkdown asChild>
                <ActionBarMorePrimitive.Item asChild>
                  <div className="aui-action-bar-more-item hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none select-none">
                    <DownloadIcon aria-hidden="true" className="size-4 shrink-0" />
                    Export as Markdown
                  </div>
                </ActionBarMorePrimitive.Item>
              </ActionBarPrimitive.ExportMarkdown>
            </div>
          </ActionBarMorePrimitive.Content>
        )}
      </ActionBarMorePrimitive.Root>
    </ActionBarPrimitive.Root>
  );
};
const MessageFile: FileMessagePartComponent = (part) => {
  const image = part.mimeType.toLowerCase().startsWith("image/")
    ? getFileHref(part.data, part.mimeType, part.sourceType)
    : null;
  if (!image) return <File {...part} />;
  return (
    <Image
      type="image"
      image={image}
      status={part.status}
      {...(part.filename !== undefined && { filename: part.filename })}
    />
  );
};
const UserFilePart: FileMessagePartComponent = (part) => (
  <div data-slot="aui_user-message-file" className="py-1">
    <MessageFile {...part} />
  </div>
);
const UserImagePart: ImageMessagePartComponent = (part) => (
  <div data-slot="aui_user-message-image" className="py-1">
    <Image {...part} />
  </div>
);
const UserMessage: FC = () => {
  const { UserText } = useContext(ThreadComponentsContext);
  return (
    <MessagePrimitive.Root
      data-slot="aui_user-message-root"
      data-role="user"
      render={
        <div className="fade-in slide-in-from-bottom-1 animate-in grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 duration-150 [contain-intrinsic-size:auto_200px] [content-visibility:auto] [&:where(>*)]:col-start-2" />
      }
    >
      <UserMessageAttachments />

      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content peer bg-muted text-foreground rounded-(--composer-radius) px-4 py-2 wrap-break-word empty:hidden">
          <MessagePrimitive.Parts components={{ Text: UserText, File: UserFilePart, Image: UserImagePart }} />
        </div>
        <div className="aui-user-action-bar-wrapper absolute start-0 top-1/2 -translate-x-full -translate-y-1/2 pe-2 peer-empty:hidden rtl:translate-x-full">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker data-slot="aui_user-branch-picker" className="col-span-full col-start-1 -me-1 justify-end" />
    </MessagePrimitive.Root>
  );
};
const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      render={<div className="aui-user-action-bar-root flex flex-col items-end" />}
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit">
          <PencilIcon aria-hidden="true" className="size-4 shrink-0" />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};
const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_edit-composer-wrapper"
      render={<div className="flex flex-col px-2 [contain-intrinsic-size:auto_200px] [content-visibility:auto]" />}
    >
      <ComposerPrimitive.Root
        render={
          <form className="aui-edit-composer-root border-frame-edge focus-within:border-foreground/25 ms-auto flex w-full max-w-[85%] cursor-text flex-col rounded-(--composer-radius) border bg-(--composer-bg) transition-[border-color]" />
        }
      >
        <ComposerPrimitive.Input
          aria-label="Edit message"
          autoFocus
          render={
            <AnalyticsTextarea
              component="EditComposer"
              className="aui-edit-composer-input text-foreground min-h-14 w-full resize-none bg-transparent px-2 pt-2 pb-1 text-base outline-none"
            />
          }
        />
        <div className="aui-edit-composer-footer mx-2.5 mb-2.5 flex items-center gap-1.5 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost">Cancel</Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button>Update</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};
const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({ className, ...rest }) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      {...rest}
      render={
        <div
          className={cn(
            "aui-branch-picker-root text-muted-foreground -ms-2 me-2 inline-flex items-center text-sm",
            className,
          )}
        />
      }
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon aria-hidden="true" className="size-4 shrink-0" />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span>
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0" />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
