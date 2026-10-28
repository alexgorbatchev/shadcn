import type { ComponentProps, ReactElement } from "react";
import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalyticsInput } from "../../hooks/useAnalyticsInput.js";

type AnalyticsInputProps = ComponentProps<"input"> & IAnalyticsProps & { component: string };

export function AnalyticsInput({ component, analytics, ...props }: AnalyticsInputProps): ReactElement {
  const handlers = useAnalyticsInput(component, analytics, props);
  return <input {...props} {...handlers} />;
}
