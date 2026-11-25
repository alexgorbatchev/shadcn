import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { IDensityProps } from "../density/types.js";
import { useId, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import { CheckIcon, MinusIcon } from "lucide-react";
import { cn } from "../utils/cn.js";
import { buttonVariants } from "./Button.js";
import { Kbd } from "./Kbd.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip.js";

/** `"mixed"` is a value that only some of the chip's targets hold, such as a tag on 2 of 3 selected tracks. */
export type ToggleChipPressed = boolean | "mixed";

export interface IToolbarToggleChipProps extends IDensityProps, IAnalyticsProps {
  /** The chip's name, which is also its accessible name. */
  children: ReactNode;
  pressed: ToggleChipPressed;
  /** Called with `true` when an unpressed or mixed chip is activated, `false` when a pressed one is. */
  onPressedChange: (pressed: boolean) => void;
  /** A key that toggles the chip elsewhere, shown after the name and exposed as `aria-keyshortcuts`. */
  shortcut?: string;
  /** Extra text after the name, such as "2 of 3"; it becomes part of the accessible name. */
  detail?: ReactNode;
  /** A CSS color drawn as a swatch before the name, for color choices. */
  swatch?: string;
  /** Hides the name visually and keeps it as the accessible name, for compact swatches. */
  hideLabel?: boolean;
  /** Disables activation while keeping the chip focusable and explaining why on focus or hover. */
  disabledReason?: string;
  /**
   * Whether a pointer press moves focus to the chip. Turn it off where the chip acts on something another region owns,
   * such as a list whose keys should keep working after a click.
   */
  focusOnPointer?: boolean;
  /**
   * Whether Space activates the chip. Turn it off where Space belongs to the surrounding application, such as a player
   * whose transport key is Space; Enter still activates the chip, and Space reaches the application's listeners with its
   * default intact. The chip then carries `data-space-activates="false"` for key handlers that defer to native controls.
   */
  spaceActivates?: boolean;
  className?: string;
}

function pressedLabel(pressed: ToggleChipPressed): "true" | "false" | "mixed" {
  if (pressed === "mixed") return "mixed";
  return pressed ? "true" : "false";
}

/**
 * A tri-state toggle button for a `Toolbar`: pressed, unpressed or mixed (`aria-pressed="mixed"`), with an optional
 * shortcut key, detail text and color swatch. Activating a mixed chip presses it, so every target gains the value.
 */
export function ToolbarToggleChip({
  analytics,
  density,
  children,
  pressed,
  onPressedChange,
  shortcut,
  detail,
  swatch,
  hideLabel = false,
  disabledReason,
  focusOnPointer = true,
  spaceActivates = true,
  className,
}: IToolbarToggleChipProps): ReactElement {
  const reasonId = useId();
  const trackedChange = useAnalyticsCallback(
    "ToolbarToggleChip",
    analytics,
    { name: "ui.change-request" },
    onPressedChange,
  );
  const isDisabled = Boolean(disabledReason);
  const onMouseDown = (event: MouseEvent<HTMLButtonElement>): void => {
    if (!focusOnPointer) event.preventDefault();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement> & { preventBaseUIHandler?: () => void }): void => {
    if (spaceActivates || event.key !== " ") return;
    // The toolbar never turns this Space into a click; the key bubbles on, unprevented, to the application.
    event.preventBaseUIHandler?.();
  };
  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>): void => {
    // Without this, a native button would still click on Space's release.
    if (!spaceActivates && event.key === " ") event.preventDefault();
  };
  const button = (
    <ToolbarPrimitive.Button
      data-density={density}
      data-slot="toolbar-toggle-chip"
      data-pressed={pressedLabel(pressed)}
      data-space-activates={spaceActivates ? undefined : "false"}
      aria-pressed={pressedLabel(pressed)}
      {...(shortcut && { "aria-keyshortcuts": shortcut.toUpperCase() })}
      aria-describedby={disabledReason ? reasonId : undefined}
      disabled={isDisabled}
      focusableWhenDisabled
      className={cn(
        buttonVariants({ variant: "outline", size: hideLabel ? "icon-sm" : "sm" }),
        "rounded-full bg-secondary/70 text-muted-foreground hover:text-foreground",
        !hideLabel && "gap-1.5 ps-2.5 pe-3",
        "data-[pressed=true]:border-primary data-[pressed=true]:bg-primary/15 data-[pressed=true]:text-foreground",
        "data-[pressed=mixed]:border-dashed data-[pressed=mixed]:border-primary data-[pressed=mixed]:bg-primary/5 data-[pressed=mixed]:text-foreground",
        className,
      )}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onClick={() => {
        if (!isDisabled) trackedChange(pressed !== true);
      }}
    >
      {/* A toggle indicator in every state sets a filter chip apart from a select trigger beside it. */}
      {!swatch && !hideLabel && pressed === true && (
        <CheckIcon aria-hidden="true" data-slot="toolbar-toggle-chip-check" className="size-3.5 shrink-0" />
      )}
      {!swatch && !hideLabel && pressed === "mixed" && (
        <MinusIcon aria-hidden="true" data-slot="toolbar-toggle-chip-mixed" className="size-3.5 shrink-0" />
      )}
      {!swatch && !hideLabel && pressed === false && (
        <span
          aria-hidden="true"
          data-slot="toolbar-toggle-chip-indicator"
          className="size-2.5 shrink-0 rounded-full border border-current/70"
        />
      )}
      {swatch && (
        <span
          aria-hidden="true"
          data-slot="toolbar-toggle-chip-swatch"
          className="size-3 shrink-0 rounded-sm border border-border"
          style={{ backgroundColor: swatch }}
        />
      )}
      <span className={hideLabel ? "sr-only" : "min-w-0 truncate"}>{children}</span>
      {detail !== undefined && (
        <span data-slot="toolbar-toggle-chip-detail" className="text-xs text-muted-foreground">
          {" · "}
          {detail}
        </span>
      )}
      {shortcut && !hideLabel && (
        <Kbd aria-hidden="true" className="ms-1">
          {shortcut.toUpperCase()}
        </Kbd>
      )}
    </ToolbarPrimitive.Button>
  );
  return (
    <>
      {disabledReason && (
        <span id={reasonId} className="sr-only">
          {disabledReason}
        </span>
      )}
      <Tooltip disabled={!disabledReason && !hideLabel}>
        <TooltipTrigger render={button} closeOnClick={false} />
        {(disabledReason || hideLabel) && (
          <TooltipContent>
            {hideLabel ? children : null}
            {hideLabel && shortcut ? ` · ${shortcut.toUpperCase()}` : null}
            {hideLabel && disabledReason ? " · " : null}
            {disabledReason}
          </TooltipContent>
        )}
      </Tooltip>
    </>
  );
}
