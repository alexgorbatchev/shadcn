import { createContext } from "react";
import type { IMessageContextValue } from "./types";

export const MessageContext = createContext<IMessageContextValue | null>(null);
