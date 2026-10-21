import { useEffect, useRef } from "react";
import type { ThreadMessage } from "@assistant-ui/react";
import type { ConversationProjection } from "../conversationMap/types.js";
import { projectConversation } from "../utils/projectConversation.js";
export function useConversationProjection(messages: readonly ThreadMessage[]): ConversationProjection {
  const cacheRef = useRef<ConversationProjection | undefined>(undefined);
  const cached = cacheRef.current;
  const projection = cached?.messages === messages ? cached : projectConversation(messages, cached);
  useEffect(() => {
    cacheRef.current = projection;
  }, [projection]);
  return projection;
}
