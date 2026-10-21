import type { ComponentProps } from "react";
import { Popover } from "@base-ui/react/popover";

export type PortalContainer = ComponentProps<typeof Popover.Portal>["container"];
