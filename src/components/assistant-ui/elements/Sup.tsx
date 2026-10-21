import type { JSX, PropsWithChildren } from "react";
export function Sup({ children }: PropsWithChildren): JSX.Element {
  return (
    <sup data-testid="Sup" className="text-[0.65em] not-italic">
      {children}
    </sup>
  );
}
