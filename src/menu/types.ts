import type { Menu } from "@base-ui/react/menu";
import type { IDensityProps } from "../density/types.js";

interface IMenuInsetProps extends IDensityProps {
  inset?: boolean;
}

interface IMenuItemOptions extends IMenuInsetProps {
  variant?: "default" | "destructive";
  /**
   * Shows a short secondary line under the label, such as what the item changes, that the item references through
   * `aria-describedby` as its accessible description rather than as part of its name. With `disabledReason`, the
   * description comes first.
   */
  description?: string;
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
/** A viewport point in CSS pixels, such as the right-click event that asked for a menu. */
export type MenuPoint = Pick<MouseEvent, "clientX" | "clientY">;

export type MenuPopupProps = Menu.Popup.Props &
  Pick<Menu.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  IDensityProps & {
    width?: "content" | "anchor";
    /**
     * Opens the menu at this viewport point instead of at its trigger, as a context menu opens at the pointer. The
     * menu's top start corner sits on the point; where the menu does not fit, it flips to the side with room and then
     * shifts until it lies wholly inside the viewport. `side`, `align` and their offsets are ignored.
     */
    point?: MenuPoint;
  };
