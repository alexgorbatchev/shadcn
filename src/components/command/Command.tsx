import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalyticsCallback } from "../../hooks/useAnalyticsCallback.js";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import type { IDensityProps } from "../../density/types.js";
import { Command as CommandPrimitive } from "cmdk";
import { CheckIcon, SearchIcon } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../InputGroup.js";

type CommandProps = ComponentProps<typeof CommandPrimitive> & IDensityProps;

/** Dispatched on a highlighted item that explains why it is disabled when Enter selects it. */
const DISABLED_SELECT = "command-item-disabled-select";
const ITEM = '[cmdk-item=""]';
const STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

function hasModifier(event: KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

/**
 * cmdk skips disabled items while navigating. Items with a disabled reason must stay reachable, so while any is
 * listed the arrow, Home and End keys move through every enabled item and every item with a reason.
 */
function moveThroughReasons(
  event: KeyboardEvent<HTMLDivElement>,
  loop: boolean,
  select: (value: string) => void,
): void {
  if (hasModifier(event) || event.nativeEvent.isComposing) return;
  const items = [...event.currentTarget.querySelectorAll<HTMLElement>(ITEM)].filter(
    (item) => item.getAttribute("aria-disabled") !== "true" || item.hasAttribute("data-disabled-reason"),
  );
  if (!items.some((item) => item.hasAttribute("data-disabled-reason"))) return;
  const current = items.findIndex((item) => item.getAttribute("aria-selected") === "true");
  if (event.key === "Enter") {
    const item = items[current];
    if (!item?.hasAttribute("data-disabled-reason")) return;
    event.preventDefault();
    item.dispatchEvent(new Event(DISABLED_SELECT));
    return;
  }
  const step = STEPS[event.key];
  const last = items.length - 1;
  let next: number;
  if (event.key === "Home") next = 0;
  else if (event.key === "End") next = last;
  else if (step === undefined) return;
  else if (current < 0) next = step > 0 ? 0 : last;
  else if (loop) next = (current + step + items.length) % items.length;
  else next = Math.min(Math.max(current + step, 0), last);
  const target = items[next];
  if (!target) return;
  event.preventDefault();
  select(target.getAttribute("data-value") ?? "");
}

/** Brings the highlighted item, and its group heading when it leads the group, into view as cmdk does. */
function revealSelected(root: HTMLElement | null, value: string): void {
  const item = value ? root?.querySelector<HTMLElement>(`${ITEM}[data-value="${CSS.escape(value)}"]`) : null;
  if (!item) return;
  if (item.parentElement?.firstChild === item)
    item.closest('[cmdk-group=""]')?.querySelector('[cmdk-group-heading=""]')?.scrollIntoView({ block: "nearest" });
  item.scrollIntoView({ block: "nearest" });
}

function Command({
  density,
  className,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onKeyDown,
  loop = false,
  ref,
  ...props
}: CommandProps): ReactElement {
  // The highlight is controlled here so items with disabled reasons can receive it from the keyboard.
  const [ownValue, setOwnValue] = useState(defaultValue);
  const value = valueProp ?? ownValue;
  const root = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(ref, root);
  // cmdk scrolls before a controlled highlight applies, so the newly highlighted item is revealed here instead.
  useLayoutEffect(() => revealSelected(root.current, value), [value]);
  const select = (next: string): void => {
    if (valueProp === undefined) setOwnValue(next);
    onValueChange?.(next);
  };
  return (
    <CommandPrimitive
      ref={mergedRef}
      data-density={density}
      data-slot="command"
      className={cn("flex size-full flex-col overflow-hidden bg-popover p-1 text-popover-foreground", className)}
      {...props}
      loop={loop}
      value={value}
      onValueChange={select}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) moveThroughReasons(event, loop, select);
      }}
    />
  );
}

type CommandDialogProps<Payload> = ComponentProps<typeof Dialog<Payload>> &
  IDensityProps & {
    title?: string;
    description?: string;
    className?: string;
    showCloseButton?: boolean;
    size?: ComponentProps<typeof DialogContent>["size"];
  };

function CommandDialog<Payload>({
  title = "Command Palette",
  description = "Search for a command to run.",
  children,
  density,
  className,
  showCloseButton = false,
  size,
  ...props
}: CommandDialogProps<Payload>): ReactElement {
  return (
    <Dialog<Payload> {...props}>
      {(state) => (
        <DialogContent
          density={density}
          size={size}
          className={cn(
            "overflow-hidden p-0",
            showCloseButton && "[&_[data-slot=command-input-wrapper]]:pe-10",
            className,
          )}
          showCloseButton={showCloseButton}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {typeof children === "function" ? children(state) : children}
        </DialogContent>
      )}
    </Dialog>
  );
}

function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>): ReactElement {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup>
        <CommandPrimitive.Input asChild data-slot="input-group-control" className={className} {...props}>
          <InputGroupInput />
        </CommandPrimitive.Input>
        <InputGroupAddon>
          <SearchIcon aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>): ReactElement {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: ComponentProps<typeof CommandPrimitive.Empty>): ReactElement {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("p-panel text-center text-sm", className)}
      {...props}
    />
  );
}

function CommandGroup({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>): ReactElement {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 [&_[cmdk-group-heading]]:px-control-x [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: ComponentProps<typeof CommandPrimitive.Separator>): ReactElement {
  return (
    <CommandPrimitive.Separator data-slot="command-separator" className={cn("h-px bg-border", className)} {...props} />
  );
}

type CommandItemProps = ComponentProps<typeof CommandPrimitive.Item> &
  IAnalyticsProps & {
    /**
     * Disables the item while keeping it reachable with the arrow keys, and shows why as visible secondary text that
     * the item references through `aria-describedby`.
     */
    disabledReason?: string;
    /** Runs instead of `onSelect` when Enter or a click selects an item with a disabled reason, to announce it. */
    onDisabledSelect?: () => void;
    /** Gives the item a minimum height of 44px when the primary pointer is coarse. */
    touchTarget?: boolean;
  };

function CommandItem({
  analytics,
  className,
  children,
  disabledReason,
  onDisabledSelect,
  ref,
  touchTarget,
  ...props
}: CommandItemProps): ReactElement {
  const trackedOnSelect = useAnalyticsCallback("CommandItem", analytics, { name: "ui.activate" }, props.onSelect);
  const reasonId = useId();
  const item = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(ref, item);
  const disabledSelect = useRef(onDisabledSelect);
  useEffect(() => {
    disabledSelect.current = onDisabledSelect;
  });
  useEffect(() => {
    const element = item.current;
    if (!element || !disabledReason) return;
    const select = (): void => disabledSelect.current?.();
    element.addEventListener(DISABLED_SELECT, select);
    return () => element.removeEventListener(DISABLED_SELECT, select);
  }, [disabledReason]);

  return (
    <CommandPrimitive.Item
      ref={mergedRef}
      data-slot="command-item"
      data-disabled-reason={disabledReason ? "" : undefined}
      className={cn(
        "group/command-item relative flex min-h-control cursor-default items-center gap-control-gap px-control-x text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-muted data-[selected=true]:text-foreground data-disabled-reason:flex-wrap data-disabled-reason:py-1 data-disabled-reason:data-[disabled=true]:pointer-events-auto data-disabled-reason:data-[disabled=true]:opacity-100 data-disabled-reason:data-[disabled=true]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
        touchTarget && "pointer-coarse:min-h-11",
        className,
      )}
      {...props}
      disabled={Boolean(disabledReason) || props.disabled}
      aria-describedby={
        [props["aria-describedby"], disabledReason ? reasonId : undefined].filter(Boolean).join(" ") || undefined
      }
      // cmdk ignores clicks on disabled items, so the capture phase announces why instead.
      onClickCapture={disabledReason ? () => onDisabledSelect?.() : props.onClickCapture}
      onSelect={trackedOnSelect}
    >
      {children}
      <CheckIcon
        aria-hidden="true"
        className="ms-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
      />
      {disabledReason && (
        <span id={reasonId} data-slot="command-item-reason" className="basis-full text-xs text-muted-foreground">
          {disabledReason}
        </span>
      )}
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({ className, ...props }: ComponentProps<"span">): ReactElement {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ms-auto text-xs text-muted-foreground group-data-[selected=true]/command-item:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
};
