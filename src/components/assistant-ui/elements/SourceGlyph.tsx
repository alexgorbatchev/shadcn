import type { JSX } from "react";
type SourceGlyphProps = {
  domain: string;
};
export function SourceGlyph({ domain }: SourceGlyphProps): JSX.Element {
  return (
    <span
      data-testid="SourceGlyph"
      aria-hidden
      className="bg-foreground/[0.06] text-muted-foreground flex size-4 shrink-0 items-center justify-center rounded text-[9px] font-medium"
    >
      {domain.charAt(0).toUpperCase()}
    </span>
  );
}
