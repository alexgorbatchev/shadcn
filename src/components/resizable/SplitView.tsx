import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn.js";
import { useDefaultLayout, usePanelRef, type LayoutStorage } from "react-resizable-panels";
import { Resizable, ResizablePanel, ResizableHandle } from "./Resizable.js";
import { Separator } from "../Separator.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";

interface ISplitViewProps {
  sidebar: ReactNode;
  children: ReactNode;
  storageKey: string;
  sidebarPosition?: "start" | "end";
  sidebarOpen?: boolean;
  storage?: LayoutStorage;
  sidebarLabel: string;
  contentLabel: string;
  resizeLabel: string;
  defaultSidebarSize?: number;
  /** Panel padding; use none when children supply their own spacing. */
  sidebarPadding?: "none" | "panel";
  contentPadding?: "none" | "panel";
  /** Fill a bounded parent; mobile navigation scrolls within at most 35% of its height. */
  layout?: "content" | "fill";
  /** The sidebar's smallest width beside the content: pixels as a number, or a percentage such as "20%". */
  minSidebarSize?: number | string;
  /** The sidebar's largest width beside the content: pixels as a number, or a percentage such as "60%". */
  maxSidebarSize?: number | string;
  /** The media query above which the panes sit side by side. */
  wideQuery?: string;
  /**
   * Below `wideQuery`: "stack" places the panes one above the other; "takeover" shows an open sidebar in the content's
   * place, with the content hidden but still mounted, as a narrow window's inspector or review does.
   */
  narrowLayout?: "stack" | "takeover";
  /** Widens the sidebar to `maxSidebarSize`; turning it off restores the width it had before. */
  sidebarExpanded?: boolean;
}

interface ISplitViewSlots {
  sidebar: HTMLDivElement;
  content: HTMLDivElement;
}

interface ISlotHostProps {
  slot: HTMLDivElement;
}

const layoutStorage: LayoutStorage = {
  getItem(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const value: unknown = JSON.parse(raw);
      if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
      return Object.values(value).every(
        (size) => typeof size === "number" && Number.isFinite(size) && size >= 0 && size <= 100,
      )
        ? raw
        : null;
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Resizing remains available without browser storage. */
    }
  },
};

function createSlot(): HTMLDivElement {
  const slot = document.createElement("div");
  slot.className = "contents";
  return slot;
}

function createSlots(): ISplitViewSlots | null {
  return typeof document === "undefined" ? null : { sidebar: createSlot(), content: createSlot() };
}

function subscribeToHydration(): () => void {
  return () => {};
}

/** Moves a panel's slot into the current layout without remounting the panel. */
function SlotHost({ slot }: ISlotHostProps): ReactElement {
  const attach = useCallback((host: HTMLDivElement | null) => host?.append(slot), [slot]);
  return <div className="contents" ref={attach} />;
}

/**
 * Pairs a resizable sidebar with its content above `wideQuery` (1024px by default) and stacks them below it, or lets an
 * open sidebar take over the content's place. The sidebar and content render into slots that move between the
 * layouts, so their state survives resizing across the breakpoint and opening or closing the sidebar.
 */
export function SplitView({
  sidebar,
  children,
  storageKey,
  sidebarPosition = "start",
  sidebarOpen = true,
  storage = layoutStorage,
  sidebarLabel,
  contentLabel,
  resizeLabel,
  defaultSidebarSize = 325,
  sidebarPadding = "panel",
  contentPadding = "panel",
  layout: layoutMode = "content",
  minSidebarSize = 200,
  maxSidebarSize = "50%",
  wideQuery = "(min-width: 1024px)",
  narrowLayout = "stack",
  sidebarExpanded = false,
}: ISplitViewProps): ReactElement {
  const isFill = layoutMode === "fill";
  const isWide = useMediaQuery(wideQuery);
  const isTakeover = !isWide && narrowLayout === "takeover" && sidebarOpen;
  const layout = useDefaultLayout({ id: storageKey, storage, onlySaveAfterUserInteractions: true });
  const sidebarRef = usePanelRef();
  // Server rendering and hydration render the panels in place; the browser then moves them into stable slots.
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [slots] = useState(createSlots);
  const portalSlots = isHydrated ? slots : null;
  // The width an open sidebar returns to: the one it had when it last closed, else the saved layout's, else the
  // default. Expanding a panel that collapsed while its group was still narrow would restore a clamped size instead.
  const storedSize = layout.defaultLayout?.sidebar;
  const openSize = useRef<number | string>(
    storedSize !== undefined && storedSize > 0 ? `${storedSize}%` : defaultSidebarSize,
  );
  // Only a sidebar that was shown open records its width; one closed from the start keeps the default.
  const wasShownOpen = useRef(false);
  const pendingOpenSize = useRef<number | string | null>(null);
  useEffect(() => {
    const panel = sidebarRef.current;
    if (!isWide || !panel) return;
    if (sidebarOpen) {
      // A collapsed panel ignores resize(), so the open width is applied once expand() has given it a size.
      if (panel.isCollapsed()) {
        pendingOpenSize.current = openSize.current;
        panel.expand();
      }
      wasShownOpen.current = true;
      return;
    }
    if (wasShownOpen.current && !panel.isCollapsed()) openSize.current = `${panel.getSize().asPercentage}%`;
    wasShownOpen.current = false;
    panel.collapse();
  }, [isWide, sidebarOpen, sidebarRef]);
  // The width before Expand, which turning it off restores.
  const unexpandedSize = useRef<number | null>(null);
  useEffect(() => {
    const panel = sidebarRef.current;
    if (!isWide || !sidebarOpen || !panel) return;
    if (sidebarExpanded) {
      unexpandedSize.current ??= panel.getSize().inPixels;
      panel.resize(maxSidebarSize);
    } else if (unexpandedSize.current !== null) {
      panel.resize(unexpandedSize.current);
      unexpandedSize.current = null;
    }
  }, [isWide, sidebarOpen, sidebarExpanded, maxSidebarSize, sidebarRef]);
  const sidebarContent = (
    <aside
      hidden={!sidebarOpen}
      aria-label={sidebarLabel}
      className={cn(
        "min-w-0 bg-card",
        isWide && "h-full",
        sidebarPadding === "panel" && "p-4",
        isFill && "min-h-0 overflow-y-auto",
        !isWide && isFill && !isTakeover && "max-h-[35%] shrink-0",
        isTakeover && isFill && "flex-1",
      )}
    >
      {sidebar}
    </aside>
  );
  const content = (
    <section
      aria-label={contentLabel}
      hidden={isTakeover}
      className={cn(
        "min-w-0 bg-card",
        isWide && "h-full",
        contentPadding === "panel" && "p-4",
        isFill && "flex min-h-0 flex-1 flex-col overflow-hidden",
      )}
    >
      {children}
    </section>
  );
  const sidebarSlot = portalSlots ? <SlotHost slot={portalSlots.sidebar} /> : sidebarContent;
  const contentSlot = portalSlots ? <SlotHost slot={portalSlots.content} /> : content;
  const sidebarPanel = (
    <ResizablePanel
      id="sidebar"
      panelRef={sidebarRef}
      collapsible
      collapsedSize={0}
      // Only closing collapses it; resizing an open sidebar past its minimum returns it to the minimum.
      onResize={(size) => {
        if (!sidebarOpen) return;
        const pending = pendingOpenSize.current;
        if (pending !== null && size.inPixels > 0) {
          pendingOpenSize.current = null;
          sidebarRef.current?.resize(pending);
        } else if (pending === null && size.inPixels === 0) sidebarRef.current?.resize(minSidebarSize);
      }}
      defaultSize={defaultSidebarSize}
      minSize={minSidebarSize}
      maxSize={maxSidebarSize}
    >
      {sidebarSlot}
    </ResizablePanel>
  );
  const contentPanel = (
    <ResizablePanel id="content" minSize="35%">
      {contentSlot}
    </ResizablePanel>
  );
  const frame = isWide ? (
    <Resizable orientation="horizontal" defaultLayout={layout.defaultLayout} onLayoutChanged={layout.onLayoutChanged}>
      {sidebarPosition === "start" ? sidebarPanel : contentPanel}
      {/* A closed sidebar leaves no divider behind; the handle stays laid out, which the panel group's map requires. */}
      <ResizableHandle
        thickness="strong"
        disabled={!sidebarOpen}
        aria-label={resizeLabel}
        className={cn(!sidebarOpen && "invisible w-0")}
      />
      {sidebarPosition === "start" ? contentPanel : sidebarPanel}
    </Resizable>
  ) : (
    <div className={cn("flex min-w-0 flex-col bg-card", isFill && "h-full min-h-0 overflow-hidden")}>
      {sidebarPosition === "start" ? sidebarSlot : contentSlot}
      <Separator thickness="strong" hidden={!sidebarOpen || isTakeover} />
      {sidebarPosition === "start" ? contentSlot : sidebarSlot}
    </div>
  );
  // The frame precedes the portals so the slots join the document before the panels' layout effects run.
  return (
    <>
      {frame}
      {portalSlots && createPortal(sidebarContent, portalSlots.sidebar)}
      {portalSlots && createPortal(content, portalSlots.content)}
    </>
  );
}
