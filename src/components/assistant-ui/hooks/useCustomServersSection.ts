import type { RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { useAuiState } from "@assistant-ui/store";

import { firstFocusable } from "../utils/mcpConfigState.js";
import { indexOfServer } from "../utils/mcpConfigState.js";
import { isFocusLost } from "../utils/mcpConfigState.js";

type FocusedServerRefContract = { element: Element; index: number };

interface ICustomServersSection {
  showForm: boolean;
  listRef: RefObject<HTMLDivElement | null>;
  addTriggerRef: RefObject<HTMLButtonElement | null>;
  onListFocus(list: Element, element: Element): void;
  openForm: VoidFunction;
  closeForm: VoidFunction;
}
export function useCustomServersSection(): ICustomServersSection {
  const serverIds = useAuiState((s) => s.mcp.customServers.map((server) => server.id).join("\x1f"));
  const [showForm, setShowForm] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const focusedServerRef = useRef<FocusedServerRefContract | null>(null);
  const addTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);

  useLayoutEffect(() => {
    if (showForm || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    addTriggerRef.current?.focus();
  }, [showForm]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const focused = focusedServerRef.current;
    if (!list || !focused) return;
    if (focused.element.isConnected) {
      focused.index = indexOfServer(list, focused.element);
      return;
    }
    focusedServerRef.current = null;
    if (!isFocusLost()) return;
    (firstFocusable(list.children[focused.index]) ?? firstFocusable(list.nextElementSibling))?.focus();
  }, [serverIds]);

  const onListFocus = (list: Element, element: Element) => {
    focusedServerRef.current = {
      element,
      index: indexOfServer(list, element),
    };
  };

  const openForm = () => setShowForm(true);
  const closeForm = () => {
    restoreFocusRef.current = true;
    setShowForm(false);
  };

  return { showForm, listRef, addTriggerRef, onListFocus, openForm, closeForm };
}
