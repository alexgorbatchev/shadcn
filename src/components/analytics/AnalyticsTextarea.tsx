import type { ComponentProps, ReactElement } from "react";
import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalyticsInput } from "../../hooks/useAnalyticsInput.js";

type AnalyticsTextareaProps = ComponentProps<"textarea"> & IAnalyticsProps & { component: string };

export function AnalyticsTextarea({ component, analytics, ...props }: AnalyticsTextareaProps): ReactElement {
  const handlers = useAnalyticsInput(component, analytics, props);
  return <textarea {...props} {...handlers} />;
}
