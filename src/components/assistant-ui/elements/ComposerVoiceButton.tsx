import { Button } from "../../Button.js";
import type { JSX } from "react";
import { type ComponentProps } from "react";
import { MicIcon, SquareIcon } from "lucide-react";
export function ComposerVoiceButton({ active, ...props }: IComposerVoiceButtonProps): JSX.Element {
  return (
    <Button
      data-testid="ComposerVoiceButton"
      type="button"
      aria-label={active ? "Stop recording" : "Start voice input"}
      data-slot="composer-voice-button"
      variant={active ? "default" : "ghost"}
      {...props}
      size="icon"
    >
      {active ? (
        <SquareIcon aria-hidden="true" data-icon="inline-start" />
      ) : (
        <MicIcon aria-hidden="true" data-icon="inline-start" />
      )}
    </Button>
  );
}
interface IComposerVoiceButtonProps extends Omit<Omit<ComponentProps<"button">, "children">, "className" | "style"> {
  active: boolean;
}
