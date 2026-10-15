import type { ComponentProps } from "react";
import type { DayPicker } from "@daypicker/react";
import type { IDensityProps } from "../density/types.js";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "../components/Button.js";

type CalendarProps = ComponentProps<typeof DayPicker> &
  IDensityProps & { buttonVariant?: VariantProps<typeof buttonVariants>["variant"] };

export type { CalendarProps };
