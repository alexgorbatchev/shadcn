import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { ReactElement } from "react";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

function Collapsible({ analytics, ...props }: CollapsiblePrimitive.Root.Props & IAnalyticsProps): ReactElement {
  const trackedOnOpenChange = useAnalyticsCallback(
    "Collapsible",
    analytics,
    (open, _details) => ({ name: "ui.open-request", open }),
    props.onOpenChange,
  );

  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} onOpenChange={trackedOnOpenChange} />;
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props): ReactElement {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props): ReactElement {
  return <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
