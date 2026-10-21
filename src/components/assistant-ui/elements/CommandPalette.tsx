import type { JSX, ComponentProps } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "../../command/Command.js";
import { Kbd } from "../../Kbd.js";

export interface IPaletteCommand {
  id: string;
  label: string;
  group: string;
  keys: readonly string[];
}

export function CommandPalette({
  commands,
  query,
  activeId,
  onQueryChange,
  onActiveChange,
  onRun,
  ...props
}: ICommandPaletteProps): JSX.Element {
  const matches = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));
  const groups = [...new Set(matches.map((command) => command.group))];
  return (
    <div
      data-testid="CommandPalette"
      className="w-full max-w-sm overflow-hidden rounded-sm border border-frame-edge shadow-frame"
      {...props}
    >
      <Command label="Type a command" shouldFilter={false} loop value={activeId} onValueChange={onActiveChange}>
        <CommandInput
          value={query}
          onValueChange={onQueryChange}
          readOnly={!onQueryChange}
          placeholder="Type a command"
          aria-label="Type a command"
        />
        <CommandList label="Commands">
          <CommandEmpty>No command matches “{query}”</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group} heading={group}>
              {matches
                .filter((command) => command.group === group)
                .map((command) => (
                  <CommandItem
                    key={command.id}
                    value={command.id}
                    disabled={!onRun}
                    onSelect={() => onRun?.(command.id)}
                  >
                    {command.label}
                    {command.keys.length > 0 && (
                      <CommandShortcut>
                        {command.keys.map((key) => (
                          <Kbd key={key}>{key}</Kbd>
                        ))}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}

interface ICommandPaletteProps extends Omit<ComponentProps<"div">, "children" | "className" | "style"> {
  commands: readonly IPaletteCommand[];
  query: string;
  activeId: string;
  onQueryChange?: (query: string) => void;
  onActiveChange?: (id: string) => void;
  onRun?: (id: string) => void;
}
