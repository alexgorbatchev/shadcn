import type { ComponentProps, ReactElement } from "react";
import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalyticsCallback } from "../../hooks/useAnalyticsCallback.js";

type AnalyticsLinkProps = ComponentProps<"a"> & IAnalyticsProps & { component: string };

export function AnalyticsLink({ component, analytics, ...props }: AnalyticsLinkProps): ReactElement {
  const onClick = useAnalyticsCallback(component, analytics, { name: "ui.activate" }, props.onClick);
  return <a {...props} onClick={onClick} />;
}
