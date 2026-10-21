import { type ReactElement } from "react";
import { type ComponentProps } from "react";
import { forwardRef, memo, useCallback, useState } from "react";
import { FileTextIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { type SourceMessagePartComponent } from "@assistant-ui/react";
import { cn } from "../../../utils/cn.js";
import { Badge } from "../../Badge.js";
import { hostOf, safeHref } from "../utils/href.js";

type SourceIconContract = ComponentProps<"span"> & {
  url: string;
  faviconUrl?: ((domain: string) => string) | undefined;
};

export const sourceVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium transition-colors motion-reduce:transition-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        outline:
          "border-input text-muted-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground border bg-transparent",
        secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        muted: "bg-muted text-muted-foreground [a&]:hover:bg-muted/80 [a&]:hover:text-foreground",
        ghost: "text-muted-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground bg-transparent",
        info: "bg-primary text-primary-foreground [a&]:hover:bg-primary/80",
        warning: "bg-warning text-warning-foreground [a&]:hover:bg-warning/80",
        success: "bg-success text-success-foreground [a&]:hover:bg-success/80",
        destructive: "bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/80",
      },
      size: {
        sm: "px-1.5 py-0.5",
        default: "px-2 py-1",
        lg: "px-2.5 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);
const defaultFaviconUrl = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;
export const SourceIcon = forwardRef<HTMLSpanElement, SourceIconContract>(function SourceIcon(
  { url, className, faviconUrl = defaultFaviconUrl, ...props },
  ref,
) {
  const domain = hostOf(url);
  const src = domain === undefined ? undefined : faviconUrl(domain);
  const [errorSrc, setErrorSrc] = useState<string | undefined>(undefined);
  const hasError = src === undefined || errorSrc === src;
  const imageRef = useCallback(
    (element: HTMLImageElement | null): void => {
      if (element?.complete && element.naturalWidth === 0) setErrorSrc(src);
    },
    [src],
  );
  return (
    <span
      ref={ref}
      data-slot={hasError ? "source-icon-fallback" : "source-icon"}
      className={cn("inline-flex size-3 shrink-0 items-center justify-center rounded-sm bg-muted text-xs", className)}
      {...props}
    >
      {hasError ? (
        domain?.charAt(0).toUpperCase() || "?"
      ) : (
        <img src={src} alt="" className="size-full rounded-sm" onError={() => setErrorSrc(src)} ref={imageRef} />
      )}
    </span>
  );
});
export function SourceTitle({ className, ...props }: ComponentProps<"span">): ReactElement {
  return <span data-slot="source-title" className={cn("max-w-37.5 truncate", className)} {...props} />;
}
function DocumentSourceIcon({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="source-document-icon"
      className={cn("text-muted-foreground flex size-3 shrink-0 items-center justify-center", className)}
      {...props}
    >
      <FileTextIcon aria-hidden="true" className="size-3.5 shrink-0" />
    </span>
  );
}
export type SourceProps = ComponentProps<"a"> & VariantProps<typeof sourceVariants>;
export function Source({
  className,
  variant,
  size,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: SourceProps): ReactElement {
  return (
    <a
      data-slot="source"
      className={cn(
        sourceVariants({ variant, size }),
        "focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer outline-none focus-visible:ring-1",
        className,
      )}
      target={target}
      rel={rel}
      {...props}
    />
  );
}
export const Sources = Object.assign(
  memo(function Sources(part: ComponentProps<SourceMessagePartComponent>): ReactElement | null {
    if (part.sourceType === "url" && part.url) {
      const href = safeHref(part.url);
      const domain = hostOf(part.url);
      const displayTitle = part.title || domain || part.url;
      const content = (
        <>
          <SourceIcon url={part.url} />
          <SourceTitle>{displayTitle}</SourceTitle>
        </>
      );
      return href ? (
        <Source href={href}>{content}</Source>
      ) : (
        <span data-slot="source" className={cn(sourceVariants(), "cursor-default")}>
          {content}
        </span>
      );
    }
    if (part.sourceType === "document") {
      return (
        <Badge
          variant="default"
          className="focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-1"
        >
          <span data-slot="source" className="inline-flex items-center gap-1.5">
            <DocumentSourceIcon />
            <SourceTitle>{part.title}</SourceTitle>
          </span>
        </Badge>
      );
    }
    return null;
  }),
  { Root: Source, Icon: SourceIcon, Title: SourceTitle },
);
