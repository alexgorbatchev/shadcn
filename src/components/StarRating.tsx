import { AnalyticsButton } from "./analytics/AnalyticsButton.js";
import { useState, type FocusEvent, type ReactElement } from "react";
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
  /**
   * When a rating is written. `change` (the default) reports every move, including arrow keys. `confirm` lets arrow
   * keys move a draft and reports it once, on Enter, Space, a click or leaving the stars, so a rating that saves on
   * change is never written by the first arrow press.
   */
  commit?: "change" | "confirm";
  /** Whether Unrated is offered; turn it off where clearing a rating is a separate, confirmed action. */
  clearable?: boolean;
  /** A confirmed rating is saving; the stars stay enabled and keep focus, and announce that they are busy. */
  busy?: boolean;
  /** In `confirm` mode, called when the current rating is chosen again, such as a click on the lit last star. */
  onReselect?: (value: number) => void;
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
  commit = "change",
  clearable = true,
  busy = false,
  onReselect,
  onValueChange,
}: IStarRatingProps): ReactElement {
  const density = useDensity(densityProp);
  // A draft belongs to the rating it started from, so a saved or externally changed rating replaces it.
  const [moved, setMoved] = useState<{ from: number; star: number } | null>(null);
  const isConfirm = commit === "confirm";
  const draft = moved?.from === value ? moved.star : null;
  const setDraft = (star: number | null): void => setMoved(star === null ? null : { from: value, star });
  const shown = isConfirm ? (draft ?? value) : value;
  const confirm = (star: number): void => {
    setDraft(null);
    if (star === value) onReselect?.(star);
    else onValueChange(star);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (!isConfirm || event.currentTarget.contains(event.relatedTarget)) return;
    if (draft !== null && draft !== value) onValueChange(draft);
    setDraft(null);
  };
  return (
    <RadioGroup
      analytics={analytics}
      aria-label={label}
      aria-busy={busy || undefined}
      value={shown}
      disabled={disabled}
      data-density={densityProp}
      className="inline-flex w-fit shrink-0 items-center gap-0.5"
      onValueChange={isConfirm ? (next: number) => setDraft(next) : onValueChange}
      onBlur={onBlur}
    >
      {[1, 2, 3, 4, 5, ...(clearable ? [0] : [])].map((star) => (
        <Radio.Root
          key={star}
          value={star}
          nativeButton
          {...(focusable ? {} : { tabIndex: -1 })}
          {...(isConfirm && {
            // A click or Space confirms the star; Enter, which a radio ignores, confirms the focused draft.
            onClick: () => confirm(star),
            onKeyDown: (event) => {
              if (event.key === "Enter") confirm(star);
            },
          })}
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
              className={star <= shown ? cn(STAR_SIZES[density], "fill-primary text-primary") : STAR_SIZES[density]}
            />
          )}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
