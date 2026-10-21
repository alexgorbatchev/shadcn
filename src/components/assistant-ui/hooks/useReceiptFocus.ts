import { useLayoutEffect, useRef, type ComponentProps, type RefObject } from "react";

type FocusHandlers = Pick<ComponentProps<"div">, "onFocusCapture" | "onBlurCapture">;

interface IReceiptFocus<T extends HTMLElement> {
  receiptRef: RefObject<T | null>;
  focusHandlers: FocusHandlers;
}

export function useReceiptFocus<T extends HTMLElement = HTMLElement>(handlers: FocusHandlers = {}): IReceiptFocus<T> {
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const receiptRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    const focusedElement = focusedElementRef.current;
    const receipt = receiptRef.current;
    if (!focusedElement || focusedElement.isConnected || !receipt) return;
    focusedElementRef.current = null;
    const document = receipt.ownerDocument;
    const root = receipt.getRootNode();
    const isFocusUnclaimed =
      document.activeElement === document.body ||
      (root instanceof ShadowRoot && root.activeElement === null && document.activeElement === root.host);
    if (isFocusUnclaimed) receipt.focus({ preventScroll: true });
  });

  return {
    receiptRef,
    focusHandlers: {
      onFocusCapture: (event) => {
        handlers.onFocusCapture?.(event);
        if (event.target instanceof HTMLElement) focusedElementRef.current = event.target;
      },
      onBlurCapture: (event) => {
        handlers.onBlurCapture?.(event);
        if (
          event.target.isConnected &&
          !event.currentTarget.contains(event.relatedTarget ?? event.currentTarget.ownerDocument.activeElement)
        ) {
          focusedElementRef.current = null;
        }
      },
    },
  };
}
