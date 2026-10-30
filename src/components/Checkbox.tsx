import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { IDensityProps } from "../density/types.js";
import type { ReactElement } from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "../utils/cn.js";
import { CheckIcon, MinusIcon } from "lucide-react";

type CheckboxProps = IAnalyticsProps & CheckboxPrimitive.Root.Props & IDensityProps;

function Checkbox({ analytics, density, className, ...props }: CheckboxProps): ReactElement {
  const trackedOnCheckedChange = useAnalyticsCallback(
    "Checkbox",
    analytics,
    { name: "ui.change-request" },
    props.onCheckedChange,
  );

  return (
    <CheckboxPrimitive.Root
      data-density={density}
      data-slot="checkbox"
      className={(state) =>
        cn(
          "peer relative flex size-4 shrink-0 items-center justify-center rounded-sm border border-input transition-colors outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
      onCheckedChange={trackedOnCheckedChange}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <MinusIcon data-slot="checkbox-mixed-indicator" />
            ) : (
              <CheckIcon data-slot="checkbox-checked-indicator" />
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
