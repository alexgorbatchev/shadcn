import type { JSX, ReactNode } from "react";
interface IFracProps {
  over: ReactNode;
  under: ReactNode;
}
export function Frac({ over, under }: IFracProps): JSX.Element {
  return (
    <math data-testid="Frac" data-slot="frac">
      <mfrac>
        <mtext>{over}</mtext>
        <mtext>{under}</mtext>
      </mfrac>
    </math>
  );
}
