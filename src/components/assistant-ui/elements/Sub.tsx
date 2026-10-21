import type { JSX, PropsWithChildren } from "react";
export function Sub({ children }: PropsWithChildren): JSX.Element {
  return (
    <sub data-testid="Sub" className="text-[0.65em] not-italic">
      {children}
    </sub>
  );
}
