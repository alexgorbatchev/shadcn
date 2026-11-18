import type { Menu } from "@base-ui/react/menu";
import type { IDensityProps } from "../density/types.js";

interface IMenuInsetProps extends IDensityProps {
  inset?: boolean;
}

interface IMenuItemOptions extends IMenuInsetProps {
  variant?: "default" | "destructive";
  /**
   * Disables the item while keeping it reachable with the arrow keys, and shows why as visible secondary text that
   * the item references through `aria-describedby`.
   */
  disabledReason?: string;
  /**
   * Runs once for each Enter, Space or click on an item disabled by `disabledReason`, so the consumer can announce the
   * reason. The item still does nothing and the menu stays open; held keys do not repeat it.
   */
  onDisabledSelect?: () => void;
}

export type MenuLabelProps = Menu.GroupLabel.Props & IMenuInsetProps;
export type MenuItemProps = Menu.Item.Props & IMenuItemOptions;
export type MenuSubTriggerProps = Menu.SubmenuTrigger.Props & IMenuInsetProps;
export type MenuCheckboxItemProps = Menu.CheckboxItem.Props & IMenuInsetProps;
export type MenuRadioItemProps = Menu.RadioItem.Props & IMenuInsetProps;
export type MenuPopupProps = Menu.Popup.Props &
  Pick<Menu.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps & { width?: "content" | "anchor" };
