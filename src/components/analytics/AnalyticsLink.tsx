import type { ReactElement } from "react";
import { useRender } from "@base-ui/react/use-render";
import type { IAnalyticsProps } from "../../analytics/types.js";
import { useLinkAnalyticsCallback } from "../../hooks/useLinkAnalyticsCallback.js";

type AnalyticsLinkProps = useRender.ComponentProps<"a"> & IAnalyticsProps & { component: string };

export function AnalyticsLink({ component, analytics, render, ...props }: AnalyticsLinkProps): ReactElement {
  const onClick = useLinkAnalyticsCallback(component, analytics, props.onClick, render !== undefined);
  return useRender({ defaultTagName: "a", props: { ...props, onClick }, render });
}
