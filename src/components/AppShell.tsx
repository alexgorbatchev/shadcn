import { AnalyticsLink } from "./analytics/AnalyticsLink.js";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./Sidebar.js";
import { ScrollArea } from "./ScrollArea.js";
import { Separator } from "./Separator.js";
type AppShellNavigationItem = {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
};
type AppShellProps = IDensityProps & {
  navigation: readonly AppShellNavigationItem[];
  brand: ReactNode;
  children: ReactNode;
  header?: ReactNode;
  sidebarFooter?: ReactNode;
  footer?: ReactNode;
  height?: CSSProperties["height"];
  defaultSidebarOpen?: boolean;
  label?: string;
};
function AppShell({
  navigation,
  brand,
  children,
  header,
  sidebarFooter,
  footer,
  height = "100dvh",
  defaultSidebarOpen = true,
  label = "Application",
  density,
}: AppShellProps): ReactElement {
  return (
    <SidebarProvider
      density={density}
      defaultOpen={defaultSidebarOpen}
      className="relative min-h-0"
      style={{ height }}
      data-scroll="none"
    >
      <Sidebar collapsible="icon" position="container">
        <SidebarHeader>{brand}</SidebarHeader>
        <SidebarContent>
          <nav aria-label="Primary navigation">
            <SidebarGroup>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      render={
                        <AnalyticsLink
                          component="AppShell"
                          href={item.href}
                          aria-current={item.active ? "page" : undefined}
                        />
                      }
                      isActive={item.active}
                      tooltip={item.label}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </nav>
        </SidebarContent>
        {sidebarFooter && <SidebarFooter>{sidebarFooter}</SidebarFooter>}
      </Sidebar>
      <SidebarInset aria-label={label} className="min-h-0 min-w-0" data-scroll="none">
        <header
          data-scroll="none"
          className="flex shrink-0 items-center gap-control-gap border-b border-border p-panel"
        >
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-control" />
          {header}
        </header>
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex min-w-0 flex-col gap-panel p-panel">{children}</div>
        </ScrollArea>
        {footer && (
          <footer className="shrink-0 border-t border-border p-panel" data-scroll="none">
            {footer}
          </footer>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
export { AppShell };
export type { AppShellNavigationItem, AppShellProps };
