import { createContext } from "react";

/**
 * The ID of the one visible item that holds the tree's Tab stop. Rows outside a `Tree` keep Headless Tree's own
 * `tabIndex`.
 */
export const TreeTabStopContext = createContext<string | undefined>(undefined);
