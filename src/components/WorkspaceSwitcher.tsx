import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types.js";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./Select.js";
import type { ILabelValue } from "../options/types.js";
type WorkspaceSwitcherProps = IDensityProps & {
  workspaces: readonly ILabelValue[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  label?: string;
};
function WorkspaceSwitcher({
  workspaces,
  value,
  defaultValue,
  onValueChange,
  disabled,
  label = "Workspace",
  density,
}: WorkspaceSwitcherProps): ReactElement {
  return (
    <Select
      items={workspaces}
      value={value}
      defaultValue={defaultValue ?? workspaces[0]?.value}
      onValueChange={(next) => {
        if (next !== null) onValueChange?.(next);
      }}
      disabled={disabled}
    >
      <SelectTrigger aria-label={label} density={density}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent density={density}>
        <SelectGroup>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.value} value={workspace.value}>
              {workspace.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
export { WorkspaceSwitcher };
export type { WorkspaceSwitcherProps };
