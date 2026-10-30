import type { ReactElement, ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
import { Card } from "./Card.js";

type PageIntroHighlight = {
  title: string;
  description: ReactNode;
  icon?: ReactNode;
};

type PageIntroProps = IDensityProps & {
  title: string;
  /** One inviting sentence on what this page is for. */
  description: ReactNode;
  /** Context above the page title without introducing another heading. */
  eyebrow?: ReactNode;
  /** Decorative mark for the page; hidden from assistive technology. */
  icon?: ReactNode;
  actions?: ReactNode;
  /** Short items naming what people can do here, laid out in as many columns as the intro's width allows. */
  highlights?: readonly PageIntroHighlight[];
};

function PageIntro({ title, description, eyebrow, icon, actions, highlights, density }: PageIntroProps): ReactElement {
  return (
    <header data-density={density} data-slot="page-intro" data-scroll="none" className="@container/page-intro min-w-0">
      <Card variant="hero" className="gap-0 py-0">
        <div
          aria-hidden="true"
          data-slot="page-intro-wash"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_140%_at_100%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_65%)]"
        />
        <div className="flex min-w-0 flex-col gap-panel p-(--card-spacing) @2xl/page-intro:flex-row @2xl/page-intro:items-start @2xl/page-intro:justify-between">
          <div className="flex min-w-0 gap-panel">
            {icon != null && (
              <div
                aria-hidden="true"
                data-slot="page-intro-icon"
                className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary [&_svg]:size-6"
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {eyebrow != null && (
                <div className="mb-1 text-xs font-medium tracking-widest text-muted-foreground">{eyebrow}</div>
              )}
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              <div className="mt-2 max-w-prose text-base text-pretty text-muted-foreground">{description}</div>
            </div>
          </div>
          {actions != null && (
            <div className="flex min-w-0 max-w-full shrink-0 flex-wrap items-center gap-control-gap wrap-anywhere">
              {actions}
            </div>
          )}
        </div>
        {highlights != null && highlights.length > 0 && (
          <ul
            aria-label={`What you can do in ${title}`}
            data-slot="page-intro-highlights"
            className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-panel border-t border-border p-(--card-spacing)"
          >
            {highlights.map((highlight) => (
              <li key={highlight.title} data-slot="page-intro-highlight" className="flex min-w-0 gap-2">
                {highlight.icon != null && (
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-primary [&_svg]:size-4">
                    {highlight.icon}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{highlight.title}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{highlight.description}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </header>
  );
}

export { PageIntro };
export type { PageIntroHighlight, PageIntroProps };
