"use client";
import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { IDensityProps } from "../density/types.js";
import { useId, type ReactElement, type ReactNode } from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "../utils/cn.js";
import { Badge } from "./Badge.js";

type OptionCardGroupProps = IAnalyticsProps & RadioGroupPrimitive.Props & IDensityProps;

/**
 * A single-choice group of option cards. Each card is a radio: arrow keys move the selection between cards, Space
 * selects the focused card, and `name`, `required` and `form` take part in native form submission and validation.
 */
function OptionCardGroup({ analytics, density, className, ...props }: OptionCardGroupProps): ReactElement {
  const trackedOnValueChange = useAnalyticsCallback(
    "OptionCardGroup",
    analytics,
    { name: "ui.change-request" },
    props.onValueChange,
  );

  return (
    <RadioGroupPrimitive
      data-density={density}
      data-slot="option-card-group"
      className={(state) =>
        cn(
          "grid w-full gap-2 [counter-reset:option-card]",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
      onValueChange={trackedOnValueChange}
    />
  );
}

type OptionCardProps = Omit<RadioPrimitive.Root.Props, "children"> &
  IDensityProps & {
    /** The option's name, shown in bold and used as its accessible name. */
    label: ReactNode;
    /** A short explanation shown below the label, such as the option's trade-off. */
    description?: ReactNode;
    /** Marks the option the author recommends with a tag after its label and a tinted border. */
    recommended?: boolean;
    /** Text of the recommended tag. */
    recommendedLabel?: ReactNode;
    /** Short identifier in the leading column; defaults to the card's letter in its group: a, b, c. */
    marker?: ReactNode;
  };

/** One option of an `OptionCardGroup`: a bordered card with a leading letter, a bold label and a muted description. */
function OptionCard({
  label,
  description,
  recommended = false,
  recommendedLabel = "Recommended",
  marker,
  density,
  className,
  ...props
}: OptionCardProps): ReactElement {
  const id = useId();
  const labelId = `${id}-label`;
  const tagId = `${id}-recommended`;
  const descriptionId = `${id}-description`;
  return (
    <RadioPrimitive.Root
      data-density={density}
      data-slot="option-card"
      data-recommended={recommended || undefined}
      aria-labelledby={recommended ? `${labelId} ${tagId}` : labelId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      className={(state) =>
        cn(
          "group/option-card grid w-full cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-2 rounded-md border border-input bg-card p-panel-sm text-start text-sm text-card-foreground transition-colors outline-none [counter-increment:option-card] hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid data-checked:border-primary data-checked:ring-1 data-checked:ring-primary forced-colors:data-checked:border-[color:Highlight] aria-invalid:not-data-checked:border-destructive data-recommended:not-data-checked:not-aria-invalid:border-success data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-card data-readonly:cursor-default",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <span
        data-slot="option-card-marker"
        aria-hidden="true"
        className="font-mono leading-5 text-muted-foreground group-data-checked/option-card:text-primary forced-colors:group-data-checked/option-card:text-[color:Highlight]"
      >
        {marker ?? <span className="before:content-[counter(option-card,lower-alpha)]" />}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span id={labelId} data-slot="option-card-label" className="leading-5 font-semibold wrap-break-word">
            {label}
          </span>
          {recommended && (
            <Badge id={tagId} data-slot="option-card-recommended" variant="success" className="uppercase">
              {recommendedLabel}
            </Badge>
          )}
        </span>
        {description !== undefined && (
          <span
            id={descriptionId}
            data-slot="option-card-description"
            className="text-muted-foreground wrap-break-word"
          >
            {description}
          </span>
        )}
      </span>
    </RadioPrimitive.Root>
  );
}

export { OptionCardGroup, OptionCard };
export type { OptionCardGroupProps, OptionCardProps };
