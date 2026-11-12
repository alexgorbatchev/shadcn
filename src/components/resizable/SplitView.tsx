import type { ReactElement, ReactNode } from "react";
import { cn } from "../../utils/cn.js";
import { useDefaultLayout, type LayoutStorage } from "react-resizable-panels";
import { Resizable, ResizablePanel, ResizableHandle } from "./Resizable.js";
import { Separator } from "../Separator.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";

interface ISplitViewProps {
  sidebar: ReactNode;
  children: ReactNode;
  storageKey: string;
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

export function SplitView({
  sidebar,
  children,
  storageKey,
  storage = layoutStorage,
  sidebarLabel,
  contentLabel,
  resizeLabel,
  defaultSidebarSize = 325,
  sidebarPadding = "panel",
  contentPadding = "panel",
  layout: layoutMode = "content",
}: ISplitViewProps): ReactElement {
  const isFill = layoutMode === "fill";
  const isWide = useMediaQuery("(min-width: 1024px)");
  const layout = useDefaultLayout({ id: storageKey, storage, onlySaveAfterUserInteractions: true });
  if (!isWide)
    return (
      <div className={cn("flex min-w-0 flex-col bg-card", isFill && "h-full min-h-0 overflow-hidden")}>
        <aside
          aria-label={sidebarLabel}
          className={cn(
            "min-w-0",
            sidebarPadding === "panel" && "p-4",
            isFill && "max-h-[35%] shrink-0 overflow-y-auto",
          )}
        >
          {sidebar}
        </aside>
        <Separator thickness="strong" />
        <section
          aria-label={contentLabel}
          className={cn(
            "min-w-0",
            contentPadding === "panel" && "p-4",
            isFill && "flex min-h-0 flex-1 flex-col overflow-hidden",
          )}
        >
          {children}
        </section>
      </div>
    );
  return (
    <Resizable orientation="horizontal" defaultLayout={layout.defaultLayout} onLayoutChanged={layout.onLayoutChanged}>
      <ResizablePanel id="sidebar" defaultSize={defaultSidebarSize} minSize={200} maxSize="50%">
        <aside
          aria-label={sidebarLabel}
          className={cn(
            "h-full min-w-0 bg-card",
            sidebarPadding === "panel" && "p-4",
            isFill && "min-h-0 overflow-y-auto",
          )}
        >
          {sidebar}
        </aside>
      </ResizablePanel>
      <ResizableHandle thickness="strong" aria-label={resizeLabel} />
      <ResizablePanel id="content" minSize="35%">
        <section
          aria-label={contentLabel}
          className={cn(
            "h-full min-w-0 bg-card",
            contentPadding === "panel" && "p-4",
            isFill && "flex min-h-0 flex-col overflow-hidden",
          )}
        >
          {children}
        </section>
      </ResizablePanel>
    </Resizable>
  );
}
