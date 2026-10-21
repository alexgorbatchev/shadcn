import { type MCPConnectionState } from "@assistant-ui/react-mcp";
export const FOCUSABLE_SELECTOR = "button:not([disabled]), a[href]";

export const firstFocusable = (element: Element | null | undefined) =>
  element?.matches(FOCUSABLE_SELECTOR)
    ? (element as HTMLElement)
    : element?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

export const indexOfServer = (list: Element, element: Element) =>
  [...list.children].findIndex((card) => card.contains(element));

export const isFocusLost = () => {
  const active = document.activeElement;
  return !active || active === document.body || active.getAttribute("role") === "dialog";
};

export const STATUS_LABEL: Record<MCPConnectionState, string> = {
  connected: "Connected",
  connecting: "Connecting…",
  authRequired: "Auth required",
  authPending: "Authorizing…",
  error: "Error",
  disconnected: "Disconnected",
};
