import { createContext } from "react";
import type { TokenUsage } from "./contextUsage.js";

export interface IContextDisplayContextValue {
  usage: TokenUsage | undefined;
  totalTokens: number;
  percent: number;
  modelContextWindow: number;
}

export const contextDisplayContext = createContext<IContextDisplayContextValue | null>(null);
