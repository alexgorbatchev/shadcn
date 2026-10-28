import { AnalyticsLink } from "../../analytics/AnalyticsLink.js";
import { type ComponentProps, type ReactElement } from "react";
import { MessagesSquare } from "lucide-react";
import { GitHubIcon } from "../elements/GitHubIcon.js";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../../Sidebar.js";
import { ThreadList } from "./ThreadList.js";
export function ThreadListSidebar({ ...props }: ComponentProps<typeof Sidebar>): ReactElement {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-y border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <AnalyticsLink
                  component="ThreadListSidebar"
                  href="https://assistant-ui.com"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessagesSquare aria-hidden="true" className="size-4 shrink-0" />
              <div className="aui-sidebar-header-heading me-6 flex flex-col gap-0.5 leading-none">
                <span className="aui-sidebar-header-title font-semibold">assistant-ui</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-panel">
        <ThreadList />
      </SidebarContent>
      {props.collapsible !== "none" && <SidebarRail />}
      <SidebarFooter className="border-y border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <AnalyticsLink
                  component="ThreadListSidebar"
                  href="https://github.com/assistant-ui/assistant-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <GitHubIcon variant="tile" />
              <div className="aui-sidebar-footer-heading flex flex-col gap-0.5 leading-none">
                <span className="aui-sidebar-footer-title font-semibold">GitHub</span>
                <span>View Source</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
