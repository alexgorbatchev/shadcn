import type { ComponentProps, ReactElement } from "react";
import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalyticsCallback } from "../../hooks/useAnalyticsCallback.js";

type AnalyticsButtonProps = ComponentProps<"button"> & IAnalyticsProps & { component: string };

/** Unstyled native action for catalog compositions that do not use the public Button. */
export function AnalyticsButton({ component, analytics, ...props }: AnalyticsButtonProps): ReactElement {
  const onClick = useAnalyticsCallback(component, analytics, { name: "ui.activate" }, props.onClick);
  return <button {...props} onClick={onClick} />;
}
