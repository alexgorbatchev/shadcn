import type { JSX } from "react";
import { type ComponentProps } from "react";
import { InputGroupInput } from "../../InputGroup.js";
export function ComposerInput({ onSubmit, onKeyDown, ...props }: IComposerInputProps): JSX.Element {
  return (
    <InputGroupInput
      data-testid="ComposerInput"
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key !== "Enter" || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
        onSubmit?.();
      }}
      {...props}
    />
  );
}
interface IComposerInputProps extends Omit<Omit<ComponentProps<"input">, "onSubmit">, "className" | "style"> {
  onSubmit?: () => void;
}
