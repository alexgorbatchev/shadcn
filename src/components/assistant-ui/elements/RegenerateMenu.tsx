import { Button } from "../../Button.js";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../DropdownMenu.js";
import type { JSX } from "react";
type RegenerateMenuProps = Omit<
  ComponentProps<"div">,
  "children" | "options" | "open" | "currentId" | "onOpenChange" | "onPick"
> & {
  options: readonly IRegenerateOption[];
  open: boolean;
  currentId: string;
  onOpenChange?: (open: boolean) => void;
  onPick?: (id: string) => void;
};
import type { ComponentProps } from "react";
import { RefreshCwIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
export interface IRegenerateOption {
  id: string;
  label: string;
  detail: string;
}
export function RegenerateMenu({
  options,
  open,
  currentId,
  onOpenChange,
  onPick,
  className,
  ...props
}: RegenerateMenuProps): JSX.Element {
  return (
    <div
      data-testid="RegenerateMenu"
      data-slot="regenerate-menu"
      className={cn(cn("flex w-full max-w-sm flex-col gap-2"), className)}
      {...props}
    >
      <DropdownMenu open={open} onOpenChange={(next) => onOpenChange?.(next)}>
        <DropdownMenuTrigger
          disabled={!onOpenChange}
          render={<Button aria-label="Regenerate with a different model" variant="ghost" size="icon" />}
        >
          <RefreshCwIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options.map((option) => {
            const content = (
              <>
                <span className="min-w-0 flex-1 truncate text-base">{option.label}</span>
                <span className={cn(mono, "text-muted-foreground shrink-0")}>
                  {option.id === currentId ? "current" : option.detail}
                </span>
              </>
            );
            return (
              <DropdownMenuItem key={option.id} disabled={!onPick} onClick={() => onPick?.(option.id)}>
                {content}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
