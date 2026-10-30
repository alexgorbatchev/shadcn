"use client";

import { createContext, use, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { EllipsisIcon } from "lucide-react";
import { Button } from "./Button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./DropdownMenu.js";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "./ContextMenu.js";

interface IActionsMenuProps {
  label: string;
  items: ReactNode;
  children?: ReactNode;
  size?: "icon-xs" | "icon-sm" | "sm";
  variant?: ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
  trigger?: ComponentProps<typeof DropdownMenuTrigger>["render"];
  contextTarget?: ComponentProps<typeof ContextMenuTrigger>["render"];
}

const ActionsMenuContext = createContext<IActionsMenuProps | null>(null);

function useActionsMenu(): IActionsMenuProps {
  const context = use(ActionsMenuContext);
  if (!context) throw new Error("ActionsMenu parts require ActionsMenu.");
  return context;
}

function ActionsMenu({ children, contextTarget, ...props }: IActionsMenuProps): ReactElement {
  const content = children ?? <ActionsMenuTrigger />;
  return (
    <ActionsMenuContext value={props}>
      <ContextMenu disabled={props.disabled}>
        {contextTarget ? (
          <ActionsMenuContextTarget render={contextTarget}>{content}</ActionsMenuContextTarget>
        ) : (
          content
        )}
        {contextTarget && <ActionsMenuContextContent />}
      </ContextMenu>
    </ActionsMenuContext>
  );
}

type ActionsMenuTriggerProps = Omit<ComponentProps<typeof DropdownMenuTrigger>, "handle">;

function ActionsMenuTrigger({ children, render, ...props }: ActionsMenuTriggerProps): ReactElement {
  const menu = useActionsMenu();
  return (
    <DropdownMenu disabled={menu.disabled}>
      <DropdownMenuTrigger
        aria-label={menu.label}
        disabled={menu.disabled}
        {...props}
        render={render ?? menu.trigger ?? <Button variant={menu.variant ?? "ghost"} size={menu.size ?? "icon-xs"} />}
      >
        {children ?? (menu.size === "sm" ? menu.label : <EllipsisIcon />)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{menu.items}</DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActionsMenuContextTarget(props: ComponentProps<typeof ContextMenuTrigger>): ReactElement {
  return <ContextMenuTrigger {...props} />;
}

function ActionsMenuContextContent(): ReactElement {
  const menu = useActionsMenu();
  return <ContextMenuContent>{menu.items}</ContextMenuContent>;
}

export { ActionsMenu, ActionsMenuTrigger, ActionsMenuContextTarget, ActionsMenuContextContent };
export type { IActionsMenuProps, ActionsMenuTriggerProps };
