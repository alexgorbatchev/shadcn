import type { JSX } from "react";
import { type ComponentProps } from "react";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { Button } from "../../Button.js";
export function ComposerSend({ streaming, idle, ...props }: IComposerSendProps): JSX.Element {
  return (
    <Button
      data-testid="ComposerSend"
      type="button"
      aria-label={streaming ? "Stop generating" : "Send message"}
      data-slot="composer-send"
      variant="default"
      {...props}
      disabled={props.disabled || (idle && !streaming)}
      size="icon"
    >
      {streaming ? (
        <SquareIcon aria-hidden="true" data-icon="inline-start" />
      ) : (
        <ArrowUpIcon aria-hidden="true" data-icon="inline-start" />
      )}
    </Button>
  );
}
interface IComposerSendProps extends Omit<Omit<ComponentProps<"button">, "children">, "className" | "style"> {
  streaming: boolean;
  idle: boolean;
}
