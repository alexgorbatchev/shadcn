import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Button } from "../../Button.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../Tooltip.js";
interface ITooltipIconButtonProps extends ComponentProps<typeof Button> {
  children: ReactNode;
  tooltip: string;
  side?: "top" | "bottom" | "left" | "right";
}
export function TooltipIconButton({
  children,
  tooltip,
  side = "bottom",
  ...props
}: ITooltipIconButtonProps): ReactElement {
  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={tooltip} {...props} />}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
