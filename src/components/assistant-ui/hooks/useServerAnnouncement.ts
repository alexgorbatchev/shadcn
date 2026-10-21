import { useEffect, useState } from "react";
import { useAuiState } from "@assistant-ui/store";

import { STATUS_LABEL } from "../utils/mcpConfigState.js";
export function useServerAnnouncement(): string {
  const status = useAuiState((s) => s.mcpServer.connectionState);
  const message = useAuiState((s) => s.mcpServer.lastError?.message ?? null);
  const [seen, setSeen] = useState({ status, message });
  const [announcement, setAnnouncement] = useState("");

  if (seen.status !== status || seen.message !== message) {
    setSeen({ status, message });
    if (message && message !== seen.message) {
      setAnnouncement(`${STATUS_LABEL.error}: ${message}`);
    } else if (status !== seen.status) {
      setAnnouncement(STATUS_LABEL[status]);
    }
  }

  useEffect(() => {
    if (!announcement) return;
    const timeout = setTimeout(() => setAnnouncement(""), 1000);
    return () => clearTimeout(timeout);
  }, [announcement]);

  return announcement;
}
