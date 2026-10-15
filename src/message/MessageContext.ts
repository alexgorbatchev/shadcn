import { createContext } from "react";
import type { IMessageContextValue } from "./types.js";

export const MessageContext = createContext<IMessageContextValue | null>(null);
