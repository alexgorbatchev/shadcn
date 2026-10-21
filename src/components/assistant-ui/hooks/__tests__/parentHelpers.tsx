import { useState, type JSX } from "react";
import { render, renderHook, type RenderResult, type RenderHookResult } from "@testing-library/react";

import { ApprovalCard } from "../../elements/ApprovalCard.js";
import { useContextDisplay } from "../useContextDisplay.js";
import { ContextDisplayRoot } from "../../elements/ContextDisplayRoot.js";
import type { TokenUsage } from "../../utils/contextUsage.js";
import { ModelSelectorRoot } from "../../elements/ModelSelectorRoot.js";
import type { ModelOption, ModelSelectorContextValue } from "../../utils/modelSelection.js";
import { useModelSelectorContext } from "../useModelSelectorContext.js";
import { useModelSelectorEfforts } from "../useModelSelectorEfforts.js";

interface IModelSelectorHookResult {
  context: ModelSelectorContextValue;
  efforts: ReturnType<typeof useModelSelectorEfforts>;
}
export function renderModelSelectorHook(
  models: readonly ModelOption[],
  defaultEffort?: string,
): RenderHookResult<IModelSelectorHookResult, unknown> {
  return renderHook(() => ({ context: useModelSelectorContext(), efforts: useModelSelectorEfforts() }), {
    wrapper: ({ children }) => (
      <ModelSelectorRoot models={models} defaultEffort={defaultEffort}>
        {children}
      </ModelSelectorRoot>
    ),
  });
}

interface IContextUsageHarness {
  hook: RenderHookResult<ReturnType<typeof useContextDisplay>, unknown>;
  update: (usage: TokenUsage, resetKey?: string) => void;
}

export function renderContextUsageHook(initialUsage: TokenUsage, modelContextWindow: number): IContextUsageHarness {
  let usage = initialUsage;
  let resetKey = "first";
  const hook = renderHook(useContextDisplay, {
    wrapper: ({ children }) => (
      <ContextDisplayRoot modelContextWindow={modelContextWindow} usage={usage} resetKey={resetKey}>
        {children}
      </ContextDisplayRoot>
    ),
  });
  return {
    hook,
    update: (nextUsage, nextKey = resetKey) => {
      usage = nextUsage;
      resetKey = nextKey;
      hook.rerender();
    },
  };
}

function ReceiptFocusHarness(): JSX.Element {
  const [isConfirmed, setIsConfirmed] = useState(false);
  return (
    <ApprovalCard
      state={isConfirmed ? "done" : "request"}
      title="Apply change"
      subtitle="Codex"
      allowOnceLabel="Approve"
      onAllowOnce={() => setIsConfirmed(true)}
    />
  );
}

export function renderReceiptFocusHarness(container?: HTMLElement): RenderResult {
  return render(<ReceiptFocusHarness />, { container });
}
