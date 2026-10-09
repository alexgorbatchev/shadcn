import { useContext } from "react";
import { DrawerContext } from "../drawer/DrawerContext";
import type { IDrawerContext } from "../drawer/types";

export function useDrawer(): IDrawerContext {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a Drawer.");
  }
  return context;
}
