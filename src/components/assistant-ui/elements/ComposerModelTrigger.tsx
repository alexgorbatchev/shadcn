import { Button } from "../../Button.js";
import type { JSX } from "react";
import { type ComponentProps } from "react";
import { ChevronDownIcon } from "lucide-react";
export function ComposerModelTrigger({ model, open, ...props }: IComposerModelTriggerProps): JSX.Element {
  return (
    <Button
      data-testid="ComposerModelTrigger"
      type="button"
      aria-expanded={open}
      data-slot="composer-model-trigger"
      variant="outline"
      {...props}
    >
      {model}
      <ChevronDownIcon aria-hidden="true" data-icon="inline-start" />
    </Button>
  );
}
interface IComposerModelTriggerProps extends Omit<Omit<ComponentProps<"button">, "children">, "className" | "style"> {
  model: string;
  open: boolean;
}
