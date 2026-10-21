import type { ReactElement } from "react";
import { useAuiState } from "@assistant-ui/react";
import { cn } from "../../../utils/cn.js";
import { ConversationMap } from "../elements/ConversationMap.js";
import { useConversationProjection } from "../hooks/useConversationProjection.js";
import { useConversationMapViewport } from "../hooks/useConversationMapViewport.js";
type ConversationMapAuiProps = {
  side?: "left" | "right";
  className?: string;
};

export function ConversationMapAui({ side = "left", className }: ConversationMapAuiProps): ReactElement {
  const messages = useAuiState((state) => state.thread.messages);
  const projection = useConversationProjection(messages);
  const { entries } = projection;
  const { activeId, visibleIds, viewportHeight, select } = useConversationMapViewport(projection);
  return (
    <div
      data-slot="conversation-map-rail"
      className={cn("pointer-events-none sticky top-0 z-10 h-0 w-full", className)}
    >
      <div
        className={cn("pointer-events-auto absolute top-0 px-3 py-10", side === "right" ? "right-0" : "left-0")}
        style={{ height: viewportHeight }}
      >
        <ConversationMap
          entries={entries}
          activeId={activeId}
          visibleIds={visibleIds}
          onSelect={select}
          side={side === "right" ? "left" : "right"}
        />
      </div>
    </div>
  );
}
