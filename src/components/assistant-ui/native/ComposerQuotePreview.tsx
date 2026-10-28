import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import { type ReactElement } from "react";
import { type ComponentProps } from "react";
import { memo } from "react";

import { ComposerPrimitive } from "@assistant-ui/react";
import { QuoteIcon, XIcon } from "lucide-react";

type ComposerQuotePreviewRootProps = Omit<ComponentProps<typeof ComposerPrimitive.Quote>, "className" | "style">;
type ComposerQuotePreviewTextProps = Omit<ComponentProps<typeof ComposerPrimitive.QuoteText>, "className" | "style">;
type ComposerQuotePreviewDismissProps = Omit<
  ComponentProps<typeof ComposerPrimitive.QuoteDismiss>,
  "className" | "style"
>;
export function ComposerQuotePreviewRoot(props: ComposerQuotePreviewRootProps): ReactElement {
  return (
    <ComposerPrimitive.Quote
      data-slot="composer-quote"
      {...props}
      render={
        <div
          data-testid="ComposerQuotePreviewRoot"
          className="bg-secondary mx-1 mt-1 flex items-start gap-1 rounded-sm px-2 py-1"
        />
      }
    />
  );
}
export function ComposerQuotePreviewIcon(): ReactElement {
  return <QuoteIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />;
}
export function ComposerQuotePreviewText(props: ComposerQuotePreviewTextProps): ReactElement {
  return (
    <ComposerPrimitive.QuoteText
      data-slot="composer-quote-text"
      {...props}
      render={
        <span
          data-testid="ComposerQuotePreviewText"
          className="text-muted-foreground line-clamp-2 min-w-0 flex-1 text-sm"
        />
      }
    />
  );
}
export function ComposerQuotePreviewDismiss({ children, ...props }: ComposerQuotePreviewDismissProps): ReactElement {
  return (
    <ComposerPrimitive.QuoteDismiss
      data-slot="composer-quote-dismiss"
      {...props}
      render={
        <AnalyticsButton
          component="ComposerQuotePreviewDismiss"
          type="button"
          aria-label="Dismiss quote"
          data-testid="ComposerQuotePreviewDismiss"
          className="shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        />
      }
    >
      {children ?? <XIcon aria-hidden="true" className="size-3.5 shrink-0" />}
    </ComposerPrimitive.QuoteDismiss>
  );
}
export const ComposerQuotePreview = Object.assign(
  memo(function ComposerQuotePreview(props: ComposerQuotePreviewRootProps): ReactElement {
    return (
      <ComposerQuotePreviewRoot {...props}>
        <ComposerQuotePreviewIcon />
        <ComposerQuotePreviewText />
        <ComposerQuotePreviewDismiss />
      </ComposerQuotePreviewRoot>
    );
  }),
  {
    Root: ComposerQuotePreviewRoot,
    Icon: ComposerQuotePreviewIcon,
    Text: ComposerQuotePreviewText,
    Dismiss: ComposerQuotePreviewDismiss,
  },
);
