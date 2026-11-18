import { AnalyticsButton } from "./analytics/AnalyticsButton.js";
import type { ReactElement } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "./RadioGroup.js";
import { StarIcon, CircleOffIcon } from "lucide-react";
import type { IAnalyticsProps } from "../analytics/types.js";
import type { IDensityProps } from "../density/types.js";
import { useDensity } from "../hooks/useDensity.js";
import { cn } from "../utils/cn.js";

interface IStarRatingProps extends IDensityProps, IAnalyticsProps {
  label: string;
  value: number;
  disabled?: boolean;
  /**
   * Whether the stars take a tab stop. Turn it off where the rating is a pointer affordance of a larger keyboard
   * target, such as a data-grid row that rates its track with its own keys.
   */
  focusable?: boolean;
  onValueChange: (value: number) => void;
}

const ITEM_SIZES = { comfortable: "size-5", compact: "size-4" } as const;
const STAR_SIZES = { comfortable: "size-3.5", compact: "size-3" } as const;
const CLEAR_SIZES = { comfortable: "size-3", compact: "size-2.5" } as const;

/** Five stars and Unrated as one radio group; compact density draws it to fit a single-line row. */
export function StarRating({
  analytics,
  label,
  value,
  disabled,
  density: densityProp,
  focusable = true,
  onValueChange,
}: IStarRatingProps): ReactElement {
  const density = useDensity(densityProp);
  return (
    <RadioGroup
      analytics={analytics}
      aria-label={label}
      value={value}
      disabled={disabled}
      data-density={densityProp}
      className="inline-flex w-fit shrink-0 items-center gap-0.5"
      onValueChange={onValueChange}
    >
      {[1, 2, 3, 4, 5, 0].map((star) => (
        <Radio.Root
          key={star}
          value={star}
          nativeButton
          {...(focusable ? {} : { tabIndex: -1 })}
          render={<AnalyticsButton component="StarRating" type="button" />}
          aria-label={star === 0 ? "Unrated" : `${star} ${star === 1 ? "star" : "stars"}`}
          title={star === 0 ? "Clear rating" : `${star} stars`}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-primary focus-visible:ring-1 focus-visible:ring-ring data-disabled:cursor-not-allowed data-disabled:opacity-50",
            ITEM_SIZES[density],
          )}
        >
          {star === 0 ? (
            <CircleOffIcon aria-hidden="true" className={CLEAR_SIZES[density]} />
          ) : (
            <StarIcon
              aria-hidden="true"
              className={star <= value ? cn(STAR_SIZES[density], "fill-primary text-primary") : STAR_SIZES[density]}
            />
          )}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
