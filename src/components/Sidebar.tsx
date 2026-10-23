import type { ComponentProps, KeyboardEvent, ReactElement, ReactNode, SetStateAction } from "react";
import type { IDensityProps } from "../density/types.js";
import type {
  SidebarContextProps,
  SidebarStyle,
  SidebarSkeletonStyle,
  SidebarPartState,
  SidebarMenuButtonState,
  SidebarMenuSubButtonState,
} from "../sidebar/types.js";
import { useCallback, useMemo, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";
import { cn } from "../utils/cn.js";
import { useSidebar } from "../hooks/useSidebar.js";
import { useDensity } from "../hooks/useDensity.js";
import { SidebarContext } from "../sidebar/SidebarContext.js";
import { DensityContext } from "../density/DensityContext.js";
import { Button } from "./Button.js";
import { Input } from "./Input.js";
import { Separator } from "./Separator.js";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./Sheet.js";
import { Skeleton } from "./Skeleton.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip.js";
import { useDirection } from "./DirectionProvider.js";

type SidebarProviderProps = Omit<ComponentProps<"div">, "style"> &
  IDensityProps & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    style?: SidebarStyle;
  };

function SidebarProvider({
  density,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  onKeyDown,
  ...props
}: SidebarProviderProps): ReactElement {
  const isMobile = useMediaQuery("(max-width: 767px)", { initializeWithValue: false });
  const [openMobile, setOpenMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const open = openProp ?? isOpen;
  const setOpen = useCallback(
    (value: SetStateAction<boolean>) => {
      const next = typeof value === "function" ? value(open) : value;
      if (openProp === undefined) setIsOpen(next);
      onOpenChange?.(next);
    },
    [open, openProp, onOpenChange],
  );
  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((current) => !current);
    else setOpen((current) => !current);
  }, [isMobile, setOpen]);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      onKeyDown?.(event);
      if (!event.defaultPrevented && !event.repeat && event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    },
    [onKeyDown, toggleSidebar],
  );
  const state = open ? "expanded" : "collapsed";
  const mobileWidth = style?.["--sidebar-width-mobile"] ?? "18rem";
  const contextValue = useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, mobileWidth }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar, mobileWidth],
  );
  const sidebarStyle: SidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-mobile": "18rem",
    "--sidebar-width-icon": "3rem",
    ...style,
  };
  const resolvedDensity = useDensity(density);
  return (
    <SidebarContext.Provider value={contextValue}>
      <DensityContext.Provider value={resolvedDensity}>
        <div
          onKeyDown={handleKeyDown}
          data-density={resolvedDensity}
          data-slot="sidebar-wrapper"
          style={sidebarStyle}
          className={cn(
            "group/sidebar-wrapper isolate flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </DensityContext.Provider>
    </SidebarContext.Provider>
  );
}

type SidebarProps = Omit<ComponentProps<"aside">, "style"> &
  IDensityProps & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
    position?: "viewport" | "container";
    style?: SidebarStyle;
  };

function Sidebar({
  density,
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  position = "viewport",
  className,
  children,
  dir,
  style,
  ref,
  ...props
}: SidebarProps): ReactElement {
  const { isMobile, state, openMobile, setOpenMobile, mobileWidth } = useSidebar();
  const resolvedDensity = useDensity(density);
  const contextDirection = useDirection();
  const direction = dir ?? contextDirection;
  let content: ReactElement;
  if (collapsible === "none") {
    content = (
      <aside
        ref={ref}
        data-density={resolvedDensity}
        data-slot="sidebar"
        data-layout-boundary=""
        dir={direction}
        style={style}
        className={cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className)}
        {...props}
      >
        {children}
      </aside>
    );
  } else if (isMobile) {
    const mobileStyle: SidebarStyle = { "--sidebar-width-mobile": mobileWidth, ...style };
    content = (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          render={<aside ref={ref} />}
          density={resolvedDensity}
          dir={direction}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          data-layout-boundary=""
          style={mobileStyle}
          side={side}
          className={cn(
            "data-[side=left]:w-[min(var(--sidebar-width-mobile),calc(100vw-2rem))] data-[side=right]:w-[min(var(--sidebar-width-mobile),calc(100vw-2rem))] gap-0 bg-sidebar p-0 text-sidebar-foreground [&>[data-slot=sheet-close]]:static [&>[data-slot=sheet-close]]:order-first [&>[data-slot=sheet-close]]:self-end [&>[data-slot=sheet-close]]:m-2",
            className,
          )}
          {...props}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  } else {
    const isOffcanvas = state === "collapsed" && collapsible === "offcanvas";
    content = (
      <div
        className="group peer hidden text-sidebar-foreground md:block"
        data-density={resolvedDensity}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        data-slot="sidebar"
        style={style}
      >
        <div
          data-slot="sidebar-gap"
          className={cn(
            "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0 motion-reduce:transition-none",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          )}
        />
        <aside
          ref={ref}
          data-slot="sidebar-container"
          data-side={side}
          dir={direction}
          inert={isOffcanvas}
          aria-hidden={isOffcanvas || undefined}
          className={cn(
            "inset-y-0 z-10 hidden w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex motion-reduce:transition-none",
            position === "container" ? "absolute h-full" : "fixed h-svh",
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className,
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
            data-layout-boundary=""
            className="flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-sm group-data-[variant=floating]:shadow-frame group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-frame-edge"
          >
            {children}
          </div>
        </aside>
      </div>
    );
  }
  return <DensityContext.Provider value={resolvedDensity}>{content}</DensityContext.Provider>;
}

function SidebarTrigger({
  density,
  className,
  onClick,
  ...props
}: ComponentProps<typeof Button> & IDensityProps): ReactElement {
  const { toggleSidebar, open, isMobile, openMobile } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-density={density}
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      density={density}
      aria-expanded={isMobile ? openMobile : open}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon aria-hidden="true" className="rtl:rotate-180" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({
  density,
  className,
  onClick,
  type = "button",
  ...props
}: ComponentProps<"button"> & IDensityProps): ReactElement {
  const { toggleSidebar, open, isMobile, openMobile } = useSidebar();
  return (
    <button
      data-density={density}
      data-sidebar="rail"
      data-slot="sidebar-rail"
      data-layout-exclude="Resize rail intentionally straddles the sidebar edge"
      aria-label="Toggle Sidebar"
      aria-expanded={isMobile ? openMobile : open}
      tabIndex={-1}
      type={type}
      title="Toggle Sidebar"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      }}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-colors group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-px hover:after:bg-sidebar-border sm:flex motion-reduce:transition-none",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize [[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar [[data-side=left][data-collapsible=offcanvas]_&]:-right-2 [[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ density, className, ...props }: ComponentProps<"main"> & IDensityProps): ReactElement {
  return (
    <main
      data-density={density}
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-sm md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({ density, className, ...props }: ComponentProps<typeof Input> & IDensityProps): ReactElement {
  return (
    <Input
      density={density}
      data-slot="sidebar-input"
      data-sidebar="input"
      className={(state) =>
        cn(
          "h-control w-full bg-background shadow-none group-data-[collapsible=icon]:hidden",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function SidebarHeader({ density, className, ...props }: ComponentProps<"div"> & IDensityProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-control-gap p-panel group-data-[collapsible=icon]:px-[calc((var(--sidebar-width-icon)-var(--ag-control-h)-1px)/2)]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarFooter({ density, className, ...props }: ComponentProps<"div"> & IDensityProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn(
        "flex flex-col gap-control-gap p-panel group-data-[collapsible=icon]:px-[calc((var(--sidebar-width-icon)-var(--ag-control-h)-1px)/2)]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarSeparator({
  density,
  className,
  ...props
}: ComponentProps<typeof Separator> & IDensityProps): ReactElement {
  return (
    <Separator
      data-density={density}
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={(state) =>
        cn(
          "mx-2 data-[orientation=horizontal]:w-auto bg-sidebar-border",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function SidebarContent({ density, className, ...props }: ComponentProps<"div"> & IDensityProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ density, className, ...props }: ComponentProps<"div"> & IDensityProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(
        "relative flex w-full min-w-0 flex-col p-panel group-data-[collapsible=icon]:px-[calc((var(--sidebar-width-icon)-var(--ag-control-h)-1px)/2)]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  density,
  className,
  render,
  ...props
}: useRender.ComponentProps<"div", SidebarPartState> & ComponentProps<"div"> & IDensityProps): ReactElement {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-control shrink-0 items-center rounded-sm px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-control group-data-[collapsible=icon]:opacity-0 focus-visible:ring-1 [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      density,
      slot: "sidebar-group-label",
      sidebar: "group-label",
    },
  });
}

function SidebarGroupAction({
  density,
  className,
  render,
  type,
  ...props
}: useRender.ComponentProps<"button", SidebarPartState> & ComponentProps<"button"> & IDensityProps): ReactElement {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: type ?? (render ? undefined : "button"),
        className: cn(
          "absolute top-panel end-panel flex aspect-square w-control-xs items-center justify-center rounded-sm p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-colors motion-reduce:transition-none group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      density,
      slot: "sidebar-group-action",
      sidebar: "group-action",
    },
  });
}

function SidebarGroupContent({ density, className, ...props }: ComponentProps<"div"> & IDensityProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ density, className, ...props }: ComponentProps<"ul"> & IDensityProps): ReactElement {
  return (
    <ul
      data-density={density}
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-0", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ density, className, ...props }: ComponentProps<"li"> & IDensityProps): ReactElement {
  return (
    <li
      data-density={density}
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button flex w-full items-center gap-control-gap overflow-hidden rounded-sm px-control-x py-1 text-start text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] motion-reduce:transition-none group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-control! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:sr-only hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border,var(--border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent,var(--accent))]",
      },
      size: {
        default: "h-control text-sm",
        sm: "h-control-sm text-xs",
        lg: "h-control-lg text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  type,
  density,
  className,
  children,
  trailing,
  ...props
}: useRender.ComponentProps<"button", SidebarMenuButtonState> &
  ComponentProps<"button"> & {
    trailing?: ReactNode;
    isActive?: boolean;
    tooltip?: string | ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants> &
  IDensityProps): ReactElement {
  const { isMobile, state } = useSidebar();
  const comp = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        children:
          trailing === undefined ? (
            children
          ) : (
            <>
              <span className="flex min-w-0 flex-1 items-center gap-control-gap [&>span]:truncate">{children}</span>
              <span data-slot="sidebar-menu-button-trailing" className="shrink-0 text-xs tabular-nums">
                {trailing}
              </span>
            </>
          ),
        type: type ?? (render ? undefined : "button"),
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      },
      props,
    ),
    render,
    state: {
      density,
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive,
    },
  });

  if (!tooltip) {
    return comp;
  }

  const tooltipProps = typeof tooltip === "string" ? { children: tooltip } : tooltip;
  return (
    <Tooltip disabled={state !== "collapsed" || isMobile}>
      <TooltipTrigger render={comp} />
      <TooltipContent side="right" align="center" {...tooltipProps} />
    </Tooltip>
  );
}

function SidebarMenuAction({
  density,
  className,
  render,
  type,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<"button", SidebarPartState> &
  ComponentProps<"button"> & {
    showOnHover?: boolean;
  } & IDensityProps): ReactElement {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: type ?? (render ? undefined : "button"),
        className: cn(
          "absolute top-0.5 end-1 flex aspect-square w-control-xs items-center justify-center rounded-sm p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-colors motion-reduce:transition-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground top-0.5 peer-data-[size=lg]/menu-button:top-1.5 peer-data-[size=sm]/menu-button:top-0 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      density,
      slot: "sidebar-menu-action",
      sidebar: "menu-action",
    },
  });
}

function SidebarMenuBadge({ density, className, ...props }: ComponentProps<"div"> & IDensityProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute end-1 flex h-5 min-w-control-xs items-center justify-center rounded-sm px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground top-0.5 peer-data-[size=lg]/menu-button:top-1.5 peer-data-[size=sm]/menu-button:top-0 peer-data-active/menu-button:text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  density,
  className,
  showIcon = false,
  ...props
}: ComponentProps<"div"> & {
  showIcon?: boolean;
} & IDensityProps): ReactElement {
  // Random width between 50 to 90%.
  const [width] = useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  });

  const skeletonStyle: SidebarSkeletonStyle = { "--skeleton-width": width };
  return (
    <div
      data-density={density}
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-control items-center gap-control-gap rounded-sm px-2", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-sm" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={skeletonStyle}
      />
    </div>
  );
}

function SidebarMenuSub({ density, className, ...props }: ComponentProps<"ul"> & IDensityProps): ReactElement {
  return (
    <ul
      data-density={density}
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 flex-col gap-1 border-s border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ density, className, ...props }: ComponentProps<"li"> & IDensityProps): ReactElement {
  return (
    <li
      data-density={density}
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  density,
  className,
  ...props
}: useRender.ComponentProps<"a", SidebarMenuSubButtonState> &
  ComponentProps<"a"> & {
    size?: "sm" | "md";
    isActive?: boolean;
  } & IDensityProps): ReactElement {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "flex h-control-sm min-w-0 items-center gap-control-gap overflow-hidden rounded-sm px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      density,
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size,
      active: isActive,
    },
  });
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
};
