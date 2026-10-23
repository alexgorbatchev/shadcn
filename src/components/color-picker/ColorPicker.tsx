import { useState, type ReactElement } from "react";
import { HexAlphaColorPicker, HexColorInput, HexColorPicker } from "react-colorful";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";

type ColorPickerProps = IDensityProps & {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (color: string) => void;
  alpha?: boolean;
  disabled?: boolean;
  name?: string;
};
function ColorPicker(props: ColorPickerProps): ReactElement {
  const { label, defaultValue = "#000000", onValueChange, alpha = false, disabled, name, density } = props;
  const [local, setLocal] = useState(defaultValue);
  const color = props.value ?? local;
  const change = (next: string): void => {
    if (!Object.hasOwn(props, "value")) setLocal(next);
    onValueChange?.(next);
  };
  const Picker = alpha ? HexAlphaColorPicker : HexColorPicker;
  return (
    <fieldset
      data-density={density}
      disabled={disabled}
      className={cn("grid w-56 gap-3", disabled && "pointer-events-none opacity-50")}
    >
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div inert={disabled}>
        <Picker
          color={color}
          onChange={change}
          aria-label={label}
          className="!h-48 !w-full [&_.react-colorful__saturation]:!rounded-t-sm [&_.react-colorful__last-control]:!rounded-b-sm"
        />
      </div>
      <HexColorInput
        color={color}
        onChange={change}
        alpha={alpha}
        prefixed
        aria-label={`${label} hex`}
        name={name}
        disabled={disabled}
        className="h-control w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </fieldset>
  );
}
export { ColorPicker };
export type { ColorPickerProps };
