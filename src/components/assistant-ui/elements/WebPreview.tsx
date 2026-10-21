import type { ReactNode } from "react";
import { Button } from "../../Button.js";
import type { JSX } from "react";
type WebPreviewProps = Omit<
  ComponentProps<"div">,
  "origin" | "loading" | "children" | "onReload" | "onOpenExternal"
> & {
  origin: string;
  loading: boolean;
  children: ReactNode;
  onReload?: () => void;
  onOpenExternal?: () => void;
};
import type { ComponentProps } from "react";
import { ExternalLinkIcon, RotateCwIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, mono, paper } from "./constants.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
/**
 * Chrome around a preview: a URL bar, reload, and open-in-new. It renders
 * `children` as given and enforces no isolation of its own, so the caller is
 * responsible for passing an already-sandboxed frame.
 */
export function WebPreview({
  origin,
  loading,
  children,
  onReload,
  onOpenExternal,
  className,
  ...props
}: WebPreviewProps): JSX.Element {
  return (
    <div
      data-testid="WebPreview"
      data-slot="web-preview"
      className={cn(cn(paper, "flex w-full max-w-md flex-col overflow-hidden rounded-md"), className)}
      {...props}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-2">
        <Button type="button" aria-label="Reload the preview" onClick={onReload} variant="ghost" size="icon">
          <RotateCwIcon
            aria-hidden="true"
            data-icon="inline-start"
            className={cn("animate-spin motion-reduce:animate-none")}
          />
        </Button>

        <span className={cn(field, "flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2.5 py-1")}>
          <span className={cn(mono, "text-muted-foreground min-w-0 truncate")}>{origin}</span>
        </span>

        <Button
          type="button"
          aria-label="Open the preview in a new tab"
          onClick={onOpenExternal}
          variant="ghost"
          size="icon"
        >
          <ExternalLinkIcon aria-hidden="true" data-icon="inline-start" />
        </Button>
      </div>

      <div className="border-foreground/[0.07] relative min-h-[144px] border-t">
        <div
          aria-hidden={loading}
          className={cn(
            "transition-opacity duration-300 motion-reduce:transition-none",
            loading && "invisible opacity-0",
          )}
        >
          {children}
        </div>
        {loading && <ShimmerLabel>Loading preview</ShimmerLabel>}
      </div>
    </div>
  );
}
