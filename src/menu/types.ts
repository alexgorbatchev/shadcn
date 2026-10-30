import type { Menu } from "@base-ui/react/menu";
import type { IDensityProps } from "../density/types.js";

interface IMenuInsetProps extends IDensityProps {
  inset?: boolean;
}

interface IMenuItemOptions extends IMenuInsetProps {
  variant?: "default" | "destructive";
}

export type MenuLabelProps = Menu.GroupLabel.Props & IMenuInsetProps;
export type MenuItemProps = Menu.Item.Props & IMenuItemOptions;
export type MenuSubTriggerProps = Menu.SubmenuTrigger.Props & IMenuInsetProps;
export type MenuCheckboxItemProps = Menu.CheckboxItem.Props & IMenuInsetProps;
export type MenuRadioItemProps = Menu.RadioItem.Props & IMenuInsetProps;
export type MenuPopupProps = Menu.Popup.Props &
  Pick<Menu.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps & { width?: "content" | "anchor" };
