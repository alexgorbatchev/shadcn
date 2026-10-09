import type { ComponentProps, ReactElement } from "react";
import type { IDensityProps } from "../density/types";
import { Command as CommandPrimitive } from "cmdk";
import { CheckIcon, SearchIcon } from "lucide-react";
import { cn } from "../utils/cn";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./Dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./InputGroup";

type CommandProps = ComponentProps<typeof CommandPrimitive> & IDensityProps;

function Command({ density, className, ...props }: CommandProps): ReactElement {
  return (
    <CommandPrimitive
      data-density={density}
      data-slot="command"
      className={cn("flex size-full flex-col overflow-hidden bg-popover p-1 text-popover-foreground", className)}
      {...props}
    />
  );
}

type CommandDialogProps<Payload> = ComponentProps<typeof Dialog<Payload>> &
  IDensityProps & {
    title?: string;
    description?: string;
    className?: string;
    showCloseButton?: boolean;
  };

function CommandDialog<Payload>({
  title = "Command Palette",
  description = "Search for a command to run.",
  children,
  density,
  className,
  showCloseButton = false,
  ...props
}: CommandDialogProps<Payload>): ReactElement {
  return (
    <Dialog<Payload> {...props}>
      {(state) => (
        <DialogContent
          density={density}
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

function CommandItem({ className, children, ...props }: ComponentProps<typeof CommandPrimitive.Item>): ReactElement {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex min-h-control cursor-default items-center gap-control-gap px-control-x text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-muted data-[selected=true]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <CheckIcon
        aria-hidden="true"
        className="ms-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
      />
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
