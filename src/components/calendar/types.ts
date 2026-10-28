import type { IAnalyticsProps } from "../../analytics/types.js";
import type { ComponentProps } from "react";
import type { DayPicker } from "@daypicker/react";
import type { IDensityProps } from "../../density/types.js";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "../Button.js";

type CalendarProps = IAnalyticsProps &
  ComponentProps<typeof DayPicker> &
  IDensityProps & { buttonVariant?: VariantProps<typeof buttonVariants>["variant"] };

export type { CalendarProps };
