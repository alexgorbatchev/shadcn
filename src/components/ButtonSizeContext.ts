import { createContext } from "react";
import type { ButtonSize } from "./buttonSize.js";

/**
 * The size every Button inside takes when it names none, so siblings in one group share one height: text, outline,
 * filled and icon buttons alike.
 */
export const ButtonSizeContext = createContext<ButtonSize | undefined>(undefined);
