import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { useAuiState } from "@assistant-ui/store";

import { isFocusLost } from "../utils/mcpConfigState.js";
interface IServerActionFocus {
  actionRef: RefObject<HTMLButtonElement | null>;
  onActionFocus(element: Element): void;
}
export function useServerActionFocus(): IServerActionFocus {
  const state = useAuiState((s) => s.mcpServer.connectionState);
  const actionRef = useRef<HTMLButtonElement>(null);
  const focusedRef = useRef<Element | null>(null);

  useEffect(() => {
    const focused = focusedRef.current;
    if (!focused || focused.isConnected) return;
    focusedRef.current = null;
    if (isFocusLost()) actionRef.current?.focus();
  }, [state]);

  const onActionFocus = (element: Element) => {
    focusedRef.current = element;
  };

  return { actionRef, onActionFocus };
}
