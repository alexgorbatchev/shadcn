import { useContext } from "react";
import { SidebarContext } from "../sidebar/SidebarContext";
import type { SidebarContextProps } from "../sidebar/types";

export function useSidebar(): SidebarContextProps {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
}
