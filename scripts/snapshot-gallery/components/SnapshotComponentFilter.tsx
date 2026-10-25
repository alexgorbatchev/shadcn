import { useId } from "react";
import type { ReactElement } from "react";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../../../src/components/Combobox";
import { Field, FieldLabel } from "../../../src/components/Field";

interface SnapshotComponentFilterProps {
  paths: string[];
  value: string | null;
  onValueChange: (value: string | null) => void;
}

export function SnapshotComponentFilter({ paths, value, onValueChange }: SnapshotComponentFilterProps): ReactElement {
  const id = useId();
  return (
    <div className="gallery-component-filter">
      <Field>
        <FieldLabel htmlFor={id}>Component</FieldLabel>
        <Combobox items={paths} value={value} onValueChange={onValueChange}>
          <ComboboxInput id={id} placeholder="All components" showClear clearLabel="Show all components" />
          <ComboboxContent>
            <ComboboxEmpty>No components found.</ComboboxEmpty>
            <ComboboxList>
              <ComboboxGroup>
                <ComboboxCollection>
                  {(path: string) => (
                    <ComboboxItem key={path} value={path}>
                      {path}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
    </div>
  );
}
