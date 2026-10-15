import type { VariantProps } from "class-variance-authority";
import type { toggleVariants } from "../components/Toggle.js";

export interface IToggleGroupContext extends VariantProps<typeof toggleVariants> {
  spacing: number;
}
