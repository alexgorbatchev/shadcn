import type { ReactElement } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { StarIcon, CircleOffIcon } from "lucide-react";
import type { IDensityProps } from "../density/types.js";

interface IStarRatingProps extends IDensityProps {
  label: string;
  value: number;
  disabled?: boolean;
  onValueChange: (value: number) => void;
}

export function StarRating({ label, value, disabled, density, onValueChange }: IStarRatingProps): ReactElement {
  return (
    <RadioGroup
      aria-label={label}
      value={value}
      disabled={disabled}
      data-density={density}
      className="inline-flex w-fit shrink-0 items-center gap-0.5"
      onValueChange={onValueChange}
    >
      {[1, 2, 3, 4, 5, 0].map((star) => (
        <Radio.Root
          key={star}
          value={star}
          nativeButton
          render={<button type="button" />}
          aria-label={star === 0 ? "Unrated" : `${star} ${star === 1 ? "star" : "stars"}`}
          title={star === 0 ? "Clear rating" : `${star} stars`}
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-primary focus-visible:ring-1 focus-visible:ring-ring data-disabled:cursor-not-allowed data-disabled:opacity-50"
        >
          {star === 0 ? (
            <CircleOffIcon aria-hidden="true" className="size-3" />
          ) : (
            <StarIcon
              aria-hidden="true"
              className={star <= value ? "size-3.5 fill-primary text-primary" : "size-3.5"}
            />
          )}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
