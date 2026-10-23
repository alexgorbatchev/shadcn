import type { ComponentProps, ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import {
  Combobox,
  ComboboxValue,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxGroup,
  ComboboxCollection,
  ComboboxItem,
} from "./Combobox.js";
import { useComboboxAnchor } from "../hooks/useComboboxAnchor.js";
type TagInputProps = IDensityProps & {
  label: string;
  options: readonly string[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: ComponentProps<typeof Combobox<string, true>>["onValueChange"];
  disabled?: boolean;
  name?: string;
  placeholder?: string;
};
function TagInput({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  placeholder = "Add tags",
  density,
}: TagInputProps): ReactElement {
  const anchor = useComboboxAnchor();
  return (
    <Combobox<string, true>
      items={options}
      multiple
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
    >
      <ComboboxChips ref={anchor} density={density}>
        <ComboboxValue>
          {(values: string[]) =>
            values.map((item) => (
              <ComboboxChip key={item} removeLabel={`Remove ${item}`}>
                {item}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput aria-label={label} placeholder={placeholder} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor} density={density}>
        <ComboboxEmpty>No matching tags.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxCollection>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
export { TagInput };
export type { TagInputProps };
