import { useAnalyticsEnabled } from "./useAnalyticsEnabled.js";
import { useLayoutEffect, useRef, type ChangeEventHandler, type FocusEventHandler } from "react";
import { useAnalytics } from "./useAnalytics.js";
import type { IAnalyticsProps } from "../analytics/types.js";

interface IInputHandlers<Element extends HTMLElement> {
  onChange?: ChangeEventHandler<Element>;
  onBlur?: FocusEventHandler<Element>;
}

export function useAnalyticsInput<Element extends HTMLElement>(
  component: string,
  analytics: IAnalyticsProps["analytics"],
  handlers: IInputHandlers<Element>,
): Required<IInputHandlers<Element>> {
  const enabled = useAnalyticsEnabled(analytics);
  const dirty = useRef(false);
  useLayoutEffect(() => {
    dirty.current = false;
  }, [enabled]);
  const track = useAnalytics(component, analytics);
  return {
    onChange(event) {
      handlers.onChange?.(event);
      if (enabled && !event.defaultPrevented) dirty.current = true;
    },
    onBlur(event) {
      handlers.onBlur?.(event);
      const changed = dirty.current;
      dirty.current = false;
      if (changed && !event.defaultPrevented) track({ name: "ui.commit" }, event.nativeEvent);
    },
  };
}
