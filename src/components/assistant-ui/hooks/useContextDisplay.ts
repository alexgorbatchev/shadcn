import { useContext } from "react";
import { contextDisplayContext, type IContextDisplayContextValue } from "../utils/contextDisplayContext.js";

export function useContextDisplay(): IContextDisplayContextValue {
  const context = useContext(contextDisplayContext);
  if (!context) throw new Error("ContextDisplay components require ContextDisplayRoot");
  return context;
}
