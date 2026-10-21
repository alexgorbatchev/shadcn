import type { AriaAttributes, DOMAttributes, ReactNode } from "react";

interface IMathMLElementProps extends AriaAttributes, DOMAttributes<MathMLElement> {
  children?: ReactNode;
  "data-testid"?: string;
  "data-slot"?: string;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      math: IMathMLElementProps;
      mfrac: IMathMLElementProps;
      mtext: IMathMLElementProps;
    }
  }
}
