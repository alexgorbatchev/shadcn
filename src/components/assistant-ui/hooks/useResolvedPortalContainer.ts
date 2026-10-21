import { useLayoutEffect, useState } from "react";
import { usePortalContainer } from "../../../hooks/usePortalContainer.js";
interface IResolvedPortalContainer {
  container: HTMLElement | ShadowRoot | null | undefined;
  isReady: boolean;
}
export function useResolvedPortalContainer(): IResolvedPortalContainer {
  const provided = usePortalContainer();
  const [resolved, setResolved] = useState<IResolvedPortalContainer>({ container: undefined, isReady: false });
  useLayoutEffect(() => {
    const container = provided && "current" in provided ? provided.current : provided;
    const isReady = container !== null;
    setResolved((previous) =>
      previous.container === container && previous.isReady === isReady ? previous : { container, isReady },
    );
  });
  return resolved;
}
