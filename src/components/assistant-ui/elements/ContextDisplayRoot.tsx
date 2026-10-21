import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { Popover } from "../../Popover.js";
import { contextDisplayContext } from "../utils/contextDisplayContext.js";
import { getUsagePercent, type TokenUsage } from "../utils/contextUsage.js";

export interface IPresetProps {
  modelContextWindow: number;
  side?: "top" | "bottom" | "left" | "right";
  usage?: TokenUsage | undefined;
  resetKey?: string | undefined;
}
export interface IContextDisplayRootProps {
  modelContextWindow: number;
  children: ReactNode;
  usage?: TokenUsage | undefined;
  resetKey?: string | undefined;
}

export function ContextDisplayRoot({
  modelContextWindow,
  children,
  usage,
  resetKey,
}: IContextDisplayRootProps): ReactElement | null {
  const rawTokens = usage?.totalTokens ?? 0;
  const [tokenState, setTokenState] = useState({
    resetKey,
    totalTokens: rawTokens > 0 ? rawTokens : 0,
    usage,
  });
  if (
    tokenState.resetKey !== resetKey ||
    (rawTokens > 0 && rawTokens !== tokenState.totalTokens) ||
    usage !== tokenState.usage
  ) {
    setTokenState({
      resetKey,
      totalTokens:
        tokenState.resetKey !== resetKey ? Math.max(0, rawTokens) : rawTokens > 0 ? rawTokens : tokenState.totalTokens,
      usage,
    });
  }
  const totalTokens = tokenState.totalTokens;
  const percent = getUsagePercent(totalTokens, modelContextWindow);
  const value = useMemo(
    () => ({ usage: tokenState.usage, totalTokens, percent, modelContextWindow }),
    [tokenState.usage, totalTokens, percent, modelContextWindow],
  );
  if (tokenState.usage === undefined && totalTokens === 0) return null;
  return (
    <contextDisplayContext.Provider value={value}>
      <Popover>{children}</Popover>
    </contextDisplayContext.Provider>
  );
}
