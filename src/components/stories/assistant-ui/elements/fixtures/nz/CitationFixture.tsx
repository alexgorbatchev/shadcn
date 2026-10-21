import { useState, type JSX, type PropsWithChildren } from "react";
import { PortalProvider } from "../../../../../PortalProvider.js";
export function CitationFixture({ children }: PropsWithChildren): JSX.Element {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} data-testid="CitationFixture">
      {container && <PortalProvider container={container}>{children}</PortalProvider>}
    </div>
  );
}
