import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { ModelSelectorRoot } from "../../../../assistant-ui/elements/ModelSelectorRoot.js";
import { ModelSelectorTrigger } from "../../../../assistant-ui/elements/ModelSelectorTrigger.js";
import { ModelSelectorContent } from "../../../../assistant-ui/elements/ModelSelectorContent.js";
import { ModelSelectorSearch } from "../../../../assistant-ui/elements/ModelSelectorSearch.js";
import { PortalProvider } from "../../../../PortalProvider.js";

interface IModelSelectorFixtureProps {
  children: ReactNode;
  placement?: "trigger" | "content";
  defaultValue?: string;
  hasSearch?: boolean;
}

export function ModelSelectorFixture({
  children,
  placement = "content",
  defaultValue = "fast",
  hasSearch = true,
}: IModelSelectorFixtureProps): ReactElement {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer}>
      {container && (
        <PortalProvider container={container}>
          <ModelSelectorRoot
            models={[
              { id: "fast", name: "Fast", description: "Quick responses" },
              { id: "reasoning", name: "Reasoning", efforts: true },
              { id: "blocked", name: "Blocked", disabled: true },
            ]}
            defaultValue={defaultValue}
            defaultEffort="low"
          >
            {placement === "trigger" ? (
              <>
                {children}
                <ModelSelectorContent searchable />
              </>
            ) : (
              <>
                <ModelSelectorTrigger aria-label="Choose model" />
                <ModelSelectorContent searchable>
                  {hasSearch && <ModelSelectorSearch />}
                  {children}
                </ModelSelectorContent>
              </>
            )}
          </ModelSelectorRoot>
        </PortalProvider>
      )}
    </div>
  );
}
