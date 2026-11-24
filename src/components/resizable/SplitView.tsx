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
import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { useDefaultLayout, usePanelRef, type LayoutStorage } from "react-resizable-panels";
import { Resizable, ResizablePanel, ResizableHandle } from "./Resizable.js";
import { Separator } from "../Separator.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { Button } from "../Button.js";
import { useDirection } from "../DirectionProvider.js";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "../Drawer.js";

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
   * place, with the content hidden but still mounted, as a narrow window's inspector or review does; "strip" places an
   * open sidebar above the content as a strip whose height the divider resizes, so both stay in view and usable, as a
   * persistent tool panel under a player does. "sheet" opens the sidebar as a modal, full-height panel from its own
   * edge, titled `sidebarLabel` with a Close button, as a phone's navigation does; "drawer" opens it as a modal bottom
   * drawer at 85% of the viewport height, full height while `sidebarExpanded`, as a phone's comments do. Both close on
   * Escape, an outside press or a swipe toward their edge, report it through `onSidebarOpenChange`, and leave the
   * content in the document's flow so the page scrolls as one document.
   */
  narrowLayout?: "stack" | "takeover" | "strip" | "sheet" | "drawer";
  /**
   * Widens the sidebar to `maxSidebarSize`; turning it off restores the width it had before. With the "drawer" narrow
   * layout it raises the drawer to the full viewport height.
   */
  sidebarExpanded?: boolean;
  /**
   * Height of the "drawer" narrow layout until `sidebarExpanded` raises it to full height: "tall" (the default) is 85%
   * of the viewport, as a phone's comments; "half" is 50%, so content the drawer refers to, such as a region on an
   * image, stays in view above it.
   */
  drawerHeight?: "tall" | "half";
  /**
   * With the "drawer" narrow layout, a CSS length from the viewport's top where the drawer's top edge sits instead of
   * `drawerHeight`, such as "3rem" to start it right under a phone's top bar, so no cut slice of the page shows above it.
   */
  drawerTopInset?: string;
  /** Called when a "sheet" or "drawer" narrow layout asks to open or close the sidebar, such as on Escape or a swipe. */
  onSidebarOpenChange?: (open: boolean) => void;
  /**
   * Where focus goes when a "sheet" or "drawer" narrow layout closes, as Base UI's `finalFocus`: by default the element
   * that had focus before it opened; return `false` from a function to leave focus where the consumer put it.
   */
  sidebarFinalFocus?: DialogPrimitive.Popup.Props["finalFocus"];
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
      // A sidebar width in pixels, or a layout of percentages.
      if (typeof value === "number") return Number.isFinite(value) && value > 0 ? raw : null;
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

/** The sidebar's width beside the content is kept in pixels, so a width chosen in one window size keeps in another. */
function getSidebarWidthKey(storageKey: string): string {
  return `split-view:${storageKey}:sidebar-px`;
}

function readSidebarWidth(storage: LayoutStorage, storageKey: string): number | null {
  try {
    const raw = storage.getItem(getSidebarWidthKey(storageKey));
    const value: unknown = raw === null ? null : JSON.parse(raw);
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeSidebarWidth(storage: LayoutStorage, storageKey: string, width: number): void {
  try {
    storage.setItem(getSidebarWidthKey(storageKey), JSON.stringify(width));
  } catch {
    /* Resizing remains available without browser storage. */
  }
}

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
  drawerHeight = "tall",
  drawerTopInset,
  onSidebarOpenChange,
  sidebarFinalFocus,
}: ISplitViewProps): ReactElement {
  const isFill = layoutMode === "fill";
  const isWide = useMediaQuery(wideQuery);
  const direction = useDirection();
  const isTakeover = !isWide && narrowLayout === "takeover" && sidebarOpen;
  const isStrip = !isWide && narrowLayout === "strip" && sidebarOpen;
  const isOverlay = !isWide && (narrowLayout === "sheet" || narrowLayout === "drawer");
  // The strip's height is remembered apart from the side-by-side width.
  const stripLayout = useDefaultLayout({ id: `${storageKey}:strip`, storage, onlySaveAfterUserInteractions: true });
  const sidebarRef = usePanelRef();
  // Server rendering and hydration render the panels in place; the browser then moves them into stable slots.
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [slots] = useState(createSlots);
  const portalSlots = isHydrated ? slots : null;
  // The width an open sidebar returns to, in pixels: the width it last had while open, else the saved width, else the
  // default. Only an open sidebar records its width, so one closed from the start keeps the default, and expanding a
  // panel that collapsed while its group was still narrow restores this width rather than a clamped one.
  const [storedWidth] = useState(() => readSidebarWidth(storage, storageKey));
  const openSize = useRef<number | string>(storedWidth ?? defaultSidebarSize);
  const pendingOpenSize = useRef<number | string | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = sidebarRef.current;
    if (!isWide || !panel) return;
    if (sidebarOpen) {
      // A collapsed panel ignores resize(), so the open width is applied once expand() has given it a size.
      if (panel.isCollapsed()) {
        pendingOpenSize.current = openSize.current;
        panel.expand();
      }
      return;
    }
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
      // An overlay keeps its sidebar visible while it animates closed.
      hidden={!sidebarOpen && !isOverlay}
      aria-label={sidebarLabel}
      className={cn(
        "min-w-0 bg-card",
        isWide && "h-full",
        sidebarPadding === "panel" && "p-4",
        (isFill || isOverlay) && "min-h-0 overflow-y-auto",
        isOverlay && "flex-1",
        !isWide && isFill && !isTakeover && !isStrip && !isOverlay && "max-h-[35%] shrink-0",
        isStrip && "h-full",
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
        // An overlay leaves the content in the document's flow, so the page scrolls as one document.
        isFill && (isOverlay ? "flex min-h-0 flex-1 flex-col" : "flex min-h-0 flex-1 flex-col overflow-hidden"),
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
        else if (pending === null) openSize.current = size.inPixels;
      }}
      defaultSize={openSize.current}
      // Its width stays in pixels while the window resizes; the content takes the difference.
      groupResizeBehavior="preserve-pixel-size"
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
    <Resizable
      orientation="horizontal"
      elementRef={groupRef}
      onLayoutChanged={(layout, meta) => {
        const share = layout.sidebar;
        const group = groupRef.current;
        if (!meta.isUserInteraction || !sidebarOpen || share === undefined || share <= 0 || !group) return;
        // The panel reports its new width only after this change, so the width comes from the group's layout, whose
        // shares divide the group's width without its divider.
        const dividers = Array.from(group.querySelectorAll(":scope > [role='separator']"));
        const width = dividers.reduce(
          (total, divider) => total - divider.getBoundingClientRect().width,
          group.getBoundingClientRect().width,
        );
        openSize.current = (width * share) / 100;
        writeSidebarWidth(storage, storageKey, openSize.current);
      }}
    >
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
  ) : isStrip ? (
    <Resizable
      orientation="vertical"
      className={cn(isFill && "h-full min-h-0")}
      defaultLayout={stripLayout.defaultLayout}
      onLayoutChanged={stripLayout.onLayoutChanged}
    >
      <ResizablePanel id="strip" defaultSize="40%" minSize="15%" maxSize="70%">
        {sidebarSlot}
      </ResizablePanel>
      <ResizableHandle thickness="strong" aria-label={resizeLabel} />
      <ResizablePanel id="content" minSize="25%">
        {contentSlot}
      </ResizablePanel>
    </Resizable>
  ) : isOverlay ? (
    <>
      <div className={cn("flex min-w-0 flex-col bg-card", isFill && "h-full min-h-0 flex-1")}>{contentSlot}</div>
      <Drawer
        open={sidebarOpen}
        onOpenChange={(open) => onSidebarOpenChange?.(open)}
        // The handle is what a mouse drags; a touch swipe also starts anywhere in the panel.
        showSwipeHandle
        swipeDirection={
          narrowLayout === "drawer"
            ? "down"
            : (sidebarPosition === "start") === (direction === "rtl")
              ? "right"
              : "left"
        }
      >
        <DrawerContent
          aria-label={sidebarLabel}
          finalFocus={sidebarFinalFocus}
          className={cn(
            narrowLayout === "drawer" &&
              "data-[swipe-axis=y]:[--drawer-content-max-height:100dvh] data-[swipe-axis=y]:rounded-t-none",
            narrowLayout === "drawer" &&
              (sidebarExpanded
                ? "h-dvh"
                : drawerTopInset
                  ? "h-[calc(100dvh-var(--split-view-drawer-top))]"
                  : drawerHeight === "half"
                    ? "h-[50dvh]"
                    : "h-[85dvh]"),
          )}
          style={drawerTopInset ? { ["--split-view-drawer-top" as string]: drawerTopInset } : undefined}
        >
          {narrowLayout === "sheet" && (
            <div className="flex shrink-0 items-center justify-between gap-2 p-panel pb-0">
              <DrawerTitle>{sidebarLabel}</DrawerTitle>
              <DrawerClose render={<Button variant="ghost" size="sm" />}>
                <XIcon aria-hidden="true" />
                Close
              </DrawerClose>
            </div>
          )}
          {sidebarSlot}
        </DrawerContent>
      </Drawer>
    </>
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
