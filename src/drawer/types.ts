import type { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

export interface IDrawerContext {
  hasSnapPoints: boolean;
  modal: DrawerPrimitive.Root.Props["modal"];
  showSwipeHandle: boolean;
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>;
}
