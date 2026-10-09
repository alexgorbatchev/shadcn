import type { CSSProperties, Dispatch, SetStateAction } from "react";
import type { IDensityProps } from "../density/types";

export type SidebarPartState = IDensityProps & { slot: string; sidebar: string };
export type SidebarMenuButtonState = SidebarPartState & { active: boolean; size: "default" | "sm" | "lg" | null };
export type SidebarMenuSubButtonState = SidebarPartState & { active: boolean; size: "sm" | "md" };

export type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  openMobile: boolean;
  setOpenMobile: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
  toggleSidebar: () => void;
  mobileWidth: string;
};

export interface SidebarStyle extends CSSProperties {
  "--sidebar-width"?: string;
  "--sidebar-width-mobile"?: string;
  "--sidebar-width-icon"?: string;
}

export interface SidebarSkeletonStyle extends CSSProperties {
  "--skeleton-width": string;
}
