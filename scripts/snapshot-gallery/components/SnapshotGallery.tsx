import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SnapshotThumbnail } from "./SnapshotThumbnail";
import "../gallery.css";

const images = import.meta.glob<string>("../../../src/components/stories/**/__screenshots__/**/*.png", {
  eager: true,
  query: "?url&no-inline",
  import: "default",
});
const sources = Object.keys(import.meta.glob("../../../src/components/**/*.tsx")).filter(
  (path) => !path.includes("/stories/"),
);

interface Snapshot {
  name: string;
  url: string;
  storyPath: string;
  componentPath: string;
}
interface GalleryRow {
  key: string;
  componentPath: string;
  snapshots: Snapshot[];
  isHeader: boolean;
}

const snapshots: Snapshot[] = Object.entries(images)
  .map(([path, url]) => {
    const relativePath = path.replace("../../../", "");
    const [storyDirectory, snapshotPath = ""] = relativePath.split("/__screenshots__/");
    const [storyFile = "", name = ""] = snapshotPath.split("/");
    const componentName = storyFile.replace(/\.stories\.tsx$/, "");
    const source = sources.find((candidate) => candidate.endsWith(`/${componentName}.tsx`));
    const storyPath = `${storyDirectory}/${storyFile}`;
    return { name, url, storyPath, componentPath: source?.replace("../../../", "") ?? storyPath };
  })
  .sort((left, right) => left.componentPath.localeCompare(right.componentPath) || left.name.localeCompare(right.name));

export function SnapshotGallery(): ReactElement {
  const viewport = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);
  const [query, setQuery] = useState("");
  const [isTrimmed, setIsTrimmed] = useState(true);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setColumns(Math.max(1, Math.floor(entry.contentRect.width / 280)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const visible = snapshots.filter((snapshot) =>
    `${snapshot.componentPath} ${snapshot.storyPath} ${snapshot.name}`.toLowerCase().includes(query.toLowerCase()),
  );
  const groups = Map.groupBy(visible, (snapshot) => snapshot.componentPath);
  const rows: GalleryRow[] = [];
  for (const [componentPath, group] of groups) {
    rows.push({ key: componentPath, componentPath, snapshots: [], isHeader: true });
    for (let index = 0; index < group.length; index += columns) {
      rows.push({
        key: `${componentPath}:${index}`,
        componentPath,
        snapshots: group.slice(index, index + columns),
        isHeader: false,
      });
    }
  }
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => viewport.current,
    estimateSize: (index) => (rows[index]?.isHeader ? 64 : 216),
    getItemKey: (index) => rows[index]?.key ?? index,
    overscan: 2,
  });
  return (
    <main className="gallery" data-scroll="none">
      <header className="gallery-toolbar">
        <div>
          <h1>Snapshot gallery</h1>
          <p>
            {visible.length} / {snapshots.length} snapshots · {groups.size} components · click an image for full size
          </p>
        </div>
        <label>
          Preview
          <select
            value={isTrimmed ? "content" : "frame"}
            onChange={(event) => setIsTrimmed(event.target.value === "content")}
          >
            <option value="content">Trim empty margins</option>
            <option value="frame">Full frame</option>
          </select>
        </label>
        <label>
          Filter snapshots
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              virtualizer.scrollToOffset(0);
            }}
            placeholder="Component, theme, density, viewport…"
          />
        </label>
      </header>
      <div className="gallery-viewport" ref={viewport} tabIndex={0} role="region" aria-label="Snapshot gallery">
        {visible.length === 0 ? <p className="gallery-empty">No snapshots match your filter.</p> : null}
        <div className="gallery-canvas" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((item) => {
            const row = rows[item.index];
            if (!row) return null;
            return (
              <div
                key={item.key}
                className="gallery-row"
                style={{ height: item.size, transform: `translateY(${item.start}px)` }}
              >
                {row.isHeader ? (
                  <h2>{row.componentPath}</h2>
                ) : (
                  <div className="gallery-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                    {row.snapshots.map((snapshot) => (
                      <figure key={snapshot.url}>
                        <a href={snapshot.url} target="_blank" rel="noreferrer" aria-label={`Open ${snapshot.name}`}>
                          <SnapshotThumbnail url={snapshot.url} name={snapshot.name} isTrimmed={isTrimmed} />
                        </a>
                        <figcaption title={`${snapshot.storyPath}\n${snapshot.name}`}>{snapshot.name}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
