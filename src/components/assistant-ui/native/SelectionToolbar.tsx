import { type ReactElement } from "react";
import { type ComponentProps } from "react";
import { memo } from "react";

import { SelectionToolbarPrimitive } from "@assistant-ui/react";
import { QuoteIcon } from "lucide-react";

type SelectionToolbarRootProps = Omit<ComponentProps<typeof SelectionToolbarPrimitive.Root>, "className" | "style">;
type SelectionToolbarQuoteProps = Omit<ComponentProps<typeof SelectionToolbarPrimitive.Quote>, "className" | "style">;
/**
 * Uses assistant-ui's native thread-scoped text selection and quote handling.
 * The upstream primitive portals into document.body; it does not support
 * PortalProvider or a styled ShadowRoot. Mount this surface in light DOM.
 */
export function SelectionToolbarRoot(props: SelectionToolbarRootProps): ReactElement {
  return (
    <SelectionToolbarPrimitive.Root
      data-slot="selection-toolbar"
      {...props}
      render={
        <div
          data-testid="SelectionToolbarRoot"
          className="bg-popover flex items-center gap-1 rounded-sm border border-border p-1"
        />
      }
    />
  );
}
export function SelectionToolbarQuote({ children, ...props }: SelectionToolbarQuoteProps): ReactElement {
  return (
    <SelectionToolbarPrimitive.Quote
      data-slot="selection-toolbar-quote"
      {...props}
      render={
        <button
          data-testid="SelectionToolbarQuote"
          type="button"
          className="text-popover-foreground hover:bg-accent flex items-center gap-1 rounded-sm px-2 py-1 text-sm transition-colors"
        />
      }
    >
      {children ?? (
        <>
          <QuoteIcon aria-hidden="true" className="size-3.5 shrink-0" />
          Quote
        </>
      )}
    </SelectionToolbarPrimitive.Quote>
  );
}
export const SelectionToolbar = Object.assign(
  memo(function SelectionToolbar(props: SelectionToolbarRootProps): ReactElement {
    return (
      <SelectionToolbarRoot {...props}>
        <SelectionToolbarQuote />
      </SelectionToolbarRoot>
    );
  }),
  { Root: SelectionToolbarRoot, Quote: SelectionToolbarQuote },
);
