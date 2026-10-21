import type { JSX } from "react";
import { type ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
export function Composer({ ...props }: ComposerProps): JSX.Element {
  return <div data-testid="Composer" data-slot="composer" className={cn("relative w-full max-w-lg")} {...props} />;
}
type ComposerProps = Omit<ComponentProps<"div">, "className" | "style">;
