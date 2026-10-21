import type { ReactElement } from "react";
import { useResolvedPortalContainer } from "../hooks/useResolvedPortalContainer.js";
import { useDensity } from "../../../hooks/useDensity.js";
import { BotIcon, ChevronDownIcon, HistoryIcon, PlusIcon } from "lucide-react";
import { type ComponentPropsWithoutRef, type FC, forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import { AssistantModalPrimitive, ThreadListPrimitive, useAuiEvent, useAuiState } from "@assistant-ui/react";
import { Thread } from "./Thread.js";
import { ThreadListItems, ThreadListRoot, ThreadListSearch } from "./ThreadList.js";
import { TooltipIconButton } from "../elements/TooltipIconButton.js";
import { type ModalView, useModalSize } from "../hooks/useModalSize.js";

type AssistantModalHeaderContract = {
  titleId: string;
  view: ModalView;
  onViewChange: (view: ModalView) => void;
};

type AssistantModalThreadListContract = {
  onSelect: () => void;
};

export function AssistantModal(): ReactElement {
  const { container: portalContainer, isReady: isPortalReady } = useResolvedPortalContainer();
  const density = useDensity();

  const [view, setView] = useState<ModalView>("thread");
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { size, reset, handleProps } = useModalSize(contentRef);
  const thread = useMemo(() => <Thread />, []);
  useAuiEvent("thread.runStart", () => setView("thread"));
  return (
    <AssistantModalPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) setView("thread");
      }}
    >
      <AssistantModalPrimitive.Anchor
        render={<div className="aui-root aui-modal-anchor fixed end-4 bottom-4 size-11" />}
      >
        <AssistantModalPrimitive.Trigger asChild>
          <AssistantModalButton isOpen={isOpen} />
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      {isPortalReady && (
        <AssistantModalPrimitive.Content
          data-density={density}
          ref={contentRef}
          sideOffset={16}
          aria-labelledby={titleId}
          render={
            <div
              style={size ?? undefined}
              className="group/modal aui-root aui-modal-content bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=open]:fade-in-0  data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0  data-[state=closed]:slide-out-to-bottom-2 [&[data-state=open]_.aui-thread-viewport-footer]:animate-in [&[data-state=open]_.aui-thread-viewport-footer]:fade-in-0 [&[data-state=open]_.aui-thread-viewport-footer]:slide-in-from-bottom-2 [&[data-state=open]_.aui-thread-viewport-footer]:fill-mode-backwards [&_.aui-thread-viewport-footer]:bg-popover ring-frame-edge z-50 flex h-125 max-h-(--radix-popover-content-available-height) w-100 max-w-[calc(100vw-32px)] origin-(--radix-popover-content-transform-origin) flex-col overflow-clip overscroll-contain rounded-md p-0 antialiased shadow-frame ring-1 transition-none ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-[state=closed]:duration-200 data-[state=open]:duration-300 motion-reduce:animate-none  [&_.aui-thread-root]:bg-inherit motion-reduce:[&_.aui-thread-viewport-footer]:animate-none [&_[data-slot=aui\_thread-viewport]]:[scrollbar-gutter:stable_both-edges] [&[data-state=open]_.aui-thread-viewport-footer]:delay-100 [&[data-state=open]_.aui-thread-viewport-footer]:duration-300 [&[data-state=open]_.aui-thread-viewport-footer]:ease-[cubic-bezier(0.32,0.72,0,1)]"
            />
          }
          portalProps={{ container: portalContainer }}
        >
          <AssistantModalResizeHandle {...handleProps} onDoubleClick={reset} />
          <AssistantModalHeader titleId={titleId} view={view} onViewChange={setView} />
          <div className="aui-modal-body relative min-h-0 flex-1">
            <div
              ref={(node) => {
                if (node) node.inert = view === "list";
              }}
              className="aui-modal-thread h-full"
            >
              {thread}
            </div>
            {view === "list" && <AssistantModalThreadList onSelect={() => setView("thread")} />}
          </div>
        </AssistantModalPrimitive.Content>
      )}
    </AssistantModalPrimitive.Root>
  );
}
const AssistantModalHeader: FC<AssistantModalHeaderContract> = ({ titleId, view, onViewChange }) => {
  const title = useAuiState((s) => s.threadListItem.title);
  const hasThreads = useAuiState((s) => s.threads.threadIds.length > 0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const shownViewRef = useRef(view);
  useEffect(() => {
    if (shownViewRef.current === view) return;
    shownViewRef.current = view;
    const heading = titleRef.current;
    const active = document.activeElement;
    if (active === document.body || active === heading?.closest("[role='dialog']")) {
      heading?.focus();
    }
  }, [view]);
  return (
    <div className="aui-modal-header border-frame-edge flex h-11 shrink-0 items-center gap-2 border-b ps-3.5 pe-2">
      <h2
        ref={titleRef}
        id={titleId}
        tabIndex={-1}
        className="aui-modal-title min-w-0 flex-1 truncate text-lg font-medium outline-none"
      >
        {view === "list" ? "Threads" : title || "New Chat"}
      </h2>
      <div className="flex shrink-0 items-center gap-0.5">
        <TooltipIconButton
          tooltip="Threads"
          side="bottom"
          aria-pressed={view === "list"}
          disabled={!hasThreads && view === "thread"}
          onClick={() => onViewChange(view === "list" ? "thread" : "list")}
        >
          <HistoryIcon aria-hidden="true" className="size-3.5 shrink-0" />
        </TooltipIconButton>
        <ThreadListPrimitive.New asChild>
          <TooltipIconButton tooltip="New Thread" side="bottom" onClick={() => onViewChange("thread")}>
            <PlusIcon aria-hidden="true" className="size-3.5 shrink-0" />
          </TooltipIconButton>
        </ThreadListPrimitive.New>
      </div>
    </div>
  );
};
const AssistantModalThreadList: FC<AssistantModalThreadListContract> = ({ onSelect }) => {
  const [search, setSearch] = useState("");
  const hasThreads = useAuiState((s) => s.threads.threadIds.length > 0);
  return (
    <ThreadListRoot
      className="aui-modal-thread-list bg-popover absolute inset-0 overflow-y-auto p-2"
      onClick={(event) => {
        const target = event.target;
        if (target instanceof Element && target.closest("[data-slot='aui_thread-list-item-trigger']")) {
          onSelect();
        }
      }}
    >
      {hasThreads && <ThreadListSearch value={search} onValueChange={setSearch} />}
      <ThreadListItems searchQuery={hasThreads ? search : ""} />
    </ThreadListRoot>
  );
};
const AssistantModalResizeHandle: FC<ComponentPropsWithoutRef<"button">> = (props) => {
  return (
    <button
      type="button"
      aria-label="Resize Assistant"
      className="aui-modal-resize-handle group-hover/modal:border-foreground/15 hover:border-foreground/40 focus-visible:border-ring absolute start-0 top-0 z-10 size-6 cursor-nwse-resize touch-none rounded-ss-xl border-s-2 border-t-2 border-transparent transition-colors outline-none [clip-path:polygon(0_0,100%_0,100%_6px,6px_6px,6px_100%,0_100%)] motion-reduce:transition-none rtl:cursor-nesw-resize rtl:[clip-path:polygon(0_0,100%_0,100%_100%,calc(100%_-_6px)_100%,calc(100%_-_6px)_6px,0_6px)]"
      {...props}
    />
  );
};
type AssistantModalButtonProps = ComponentPropsWithoutRef<"button"> & {
  isOpen: boolean;
};
const AssistantModalButton = forwardRef<HTMLButtonElement, AssistantModalButtonProps>(({ isOpen, ...rest }, ref) => {
  const tooltip = isOpen ? "Close Assistant" : "Open Assistant";
  return (
    <TooltipIconButton variant="ghost" tooltip={tooltip} side="left" {...rest} ref={ref}>
      {isOpen ? (
        <ChevronDownIcon aria-hidden="true" className="size-4" />
      ) : (
        <BotIcon aria-hidden="true" className="size-4" />
      )}
    </TooltipIconButton>
  );
});
AssistantModalButton.displayName = "AssistantModalButton";
