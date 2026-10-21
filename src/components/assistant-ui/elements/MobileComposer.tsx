import type { JSX, ComponentProps } from "react";
import { ArrowUpIcon, MicIcon, PlusIcon, SquareIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../InputGroup.js";

export function MobileComposer({
  value,
  keyboardOpen,
  running,
  actions,
  onAction,
  onAttach,
  onValueChange,
  onSend,
  onStop,
  onFocus,
  ...props
}: IMobileComposerProps): JSX.Element {
  return (
    <div
      data-testid="MobileComposer"
      className="flex w-full max-w-sm flex-col gap-control-gap border-t border-border bg-background p-panel"
      {...props}
    >
      {!keyboardOpen && (
        <div className="flex gap-control-gap overflow-x-auto">
          {actions.map((action) => (
            <Button key={action} variant="outline" size="sm" disabled={!onAction} onClick={() => onAction?.(action)}>
              {action}
            </Button>
          ))}
        </div>
      )}
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Button variant="ghost" size="icon-sm" aria-label="Add an attachment" disabled={!onAttach} onClick={onAttach}>
            <PlusIcon aria-hidden="true" />
          </Button>
        </InputGroupAddon>
        <InputGroupInput
          value={value}
          readOnly={!onValueChange}
          onChange={(event) => onValueChange?.(event.target.value)}
          onFocus={onFocus}
          onKeyDown={(event) => {
            if (
              event.defaultPrevented ||
              event.key !== "Enter" ||
              event.shiftKey ||
              event.nativeEvent.isComposing ||
              event.nativeEvent.keyCode === 229
            )
              return;
            event.preventDefault();
            if (!running && value !== "") onSend?.();
          }}
          placeholder="Message"
          aria-label="Message"
        />
        <InputGroupAddon align="inline-end">
          {value === "" && <MicIcon aria-hidden="true" />}
          {(onSend || onStop) && (
            <Button
              size="icon-sm"
              aria-label={running ? "Stop" : "Send"}
              onClick={running ? onStop : onSend}
              disabled={running ? !onStop : !onSend || value === ""}
            >
              {running ? <SquareIcon aria-hidden="true" /> : <ArrowUpIcon aria-hidden="true" />}
            </Button>
          )}
        </InputGroupAddon>
      </InputGroup>
      {keyboardOpen && <span className="text-center text-sm text-muted-foreground">return to send</span>}
    </div>
  );
}

interface IMobileComposerProps extends Omit<ComponentProps<"div">, "children" | "className" | "style" | "onFocus"> {
  value: string;
  keyboardOpen: boolean;
  running: boolean;
  actions: readonly string[];
  onAction?: (action: string) => void;
  onAttach?: () => void;
  onValueChange?: (value: string) => void;
  onSend?: () => void;
  onStop?: () => void;
  onFocus?: () => void;
}
