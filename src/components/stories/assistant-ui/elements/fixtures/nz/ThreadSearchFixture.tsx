import { useState, type JSX } from "react";
import { ThreadSearch } from "../../../../../assistant-ui/elements/ThreadSearch.js";
export function ThreadSearchFixture(): JSX.Element {
  const [activeId, setActiveId] = useState("thread-0");
  return (
    <ThreadSearch
      variant="scrollable"
      threads={Array.from({ length: 24 }, (_, index) => ({
        id: `thread-${index}`,
        title: `Thread ${index}`,
        group: "Today",
        preview: `Conversation ${index}`,
      }))}
      query=""
      activeId={activeId}
      onActiveChange={setActiveId}
      onSelect={setActiveId}
    />
  );
}
