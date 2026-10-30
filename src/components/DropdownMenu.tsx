"use client";
import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";

import type { ReactElement } from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

function DropdownMenu<Payload>({
  analytics,
  ...props
}: MenuPrimitive.Root.Props<Payload> & IAnalyticsProps): ReactElement {
  const trackedOnOpenChange = useAnalyticsCallback(
    "DropdownMenu",
    analytics,
    (open, _details) => ({ name: "ui.open-request", open }),
    props.onOpenChange,
  );

  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} onOpenChange={trackedOnOpenChange} />;
}

function DropdownMenuTrigger<Payload>({ ...props }: MenuPrimitive.Trigger.Props<Payload>): ReactElement {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

export {
  MenuGroup as DropdownMenuGroup,
  MenuLabel as DropdownMenuLabel,
  MenuItem as DropdownMenuItem,
  MenuCheckboxItem as DropdownMenuCheckboxItem,
  MenuRadioGroup as DropdownMenuRadioGroup,
  MenuRadioItem as DropdownMenuRadioItem,
  MenuSeparator as DropdownMenuSeparator,
  MenuShortcut as DropdownMenuShortcut,
  MenuSub as DropdownMenuSub,
  MenuSubTrigger as DropdownMenuSubTrigger,
  MenuSubContent as DropdownMenuSubContent,
} from "./MenuParts.js";

export { DropdownMenu, DropdownMenuTrigger };
export { MenuPortal as DropdownMenuPortal, MenuPopup as DropdownMenuContent } from "./MenuPopup.js";
