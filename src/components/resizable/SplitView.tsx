import type { ReactElement, ReactNode } from "react";
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
}: ISplitViewProps): ReactElement {
  const isWide = useMediaQuery("(min-width: 1024px)");
  const layout = useDefaultLayout({ id: storageKey, storage, onlySaveAfterUserInteractions: true });
  if (!isWide)
    return (
      <div className="flex min-w-0 flex-col bg-card">
        <aside aria-label={sidebarLabel} className="min-w-0 p-4">
          {sidebar}
        </aside>
        <Separator thickness="strong" />
        <section aria-label={contentLabel} className="min-w-0 p-4">
          {children}
        </section>
      </div>
    );
  return (
    <Resizable orientation="horizontal" defaultLayout={layout.defaultLayout} onLayoutChanged={layout.onLayoutChanged}>
      <ResizablePanel id="sidebar" defaultSize={defaultSidebarSize} minSize={200} maxSize="50%">
        <aside aria-label={sidebarLabel} className="h-full min-w-0 bg-card p-4">
          {sidebar}
        </aside>
      </ResizablePanel>
      <ResizableHandle thickness="strong" aria-label={resizeLabel} />
      <ResizablePanel id="content" minSize="35%">
        <section aria-label={contentLabel} className="h-full min-w-0 bg-card p-4">
          {children}
        </section>
      </ResizablePanel>
    </Resizable>
  );
}
