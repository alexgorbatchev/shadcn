import { AnalyticsLink } from "../../analytics/AnalyticsLink.js";
import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  type MarkdownTextPrimitiveProps,
  memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo, type ComponentProps, type JSX } from "react";
import type { TextMessagePartProps } from "@assistant-ui/react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { TooltipIconButton } from "./TooltipIconButton.js";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard.js";
import { cn } from "../../../utils/cn.js";
interface IMarkdownTextProps extends Partial<TextMessagePartProps> {
  components?: Parameters<typeof memoizeMarkdownComponents>[0];
  componentsByLanguage?: MarkdownTextPrimitiveProps["componentsByLanguage"];
}
export function MarkdownText({ components, componentsByLanguage }: IMarkdownTextProps): JSX.Element {
  const markdownComponents = useMemo(() => {
    if (!components) return defaultComponents;
    return {
      ...defaultComponents,
      ...memoizeMarkdownComponents(components),
    };
  }, [components]);
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      containerComponent={MarkdownTextContainer}
      components={markdownComponents}
      componentsByLanguage={componentsByLanguage}
      defer
    />
  );
}
export function MarkdownTextContainer(props: MarkdownTextContainerProps): JSX.Element {
  return <div {...props} data-testid="MarkdownTextContainer" className="aui-md text-sm" />;
}
type MarkdownTextContainerProps = Omit<ComponentProps<"div">, "className" | "style">;
export function MarkdownTextCodeHeader({ language, code }: CodeHeaderProps): JSX.Element {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };
  return (
    <div
      data-testid="MarkdownTextCodeHeader"
      className="aui-code-header-root border-border/50 bg-muted/50 mt-3 flex items-center justify-between rounded-t-md border border-b-0 px-2 py-1.5 text-sm"
    >
      <span className="aui-code-header-language text-muted-foreground font-medium lowercase">{language}</span>
      <TooltipIconButton tooltip={isCopied ? "Copied" : "Copy"} onClick={onCopy}>
        {!isCopied && <CopyIcon aria-hidden="true" className={cn("size-4")} />}
        {isCopied && <CheckIcon aria-hidden="true" className={cn("size-4")} />}
      </TooltipIconButton>
    </div>
  );
}
const defaultComponents = memoizeMarkdownComponents({
  h1: ({ className, ...props }) => (
    <h1
      className={cn("aui-md-h1 mt-5 mb-2 scroll-m-20 text-base font-semibold first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("aui-md-h2 mt-5 mb-2 scroll-m-20 text-base font-semibold first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("aui-md-h3 mt-4 mb-1.5 scroll-m-20 text-base font-semibold first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn("aui-md-h4 mt-3.5 mb-1 scroll-m-20 text-base font-medium first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5 className={cn("aui-md-h5 mt-3 mb-1 text-sm font-semibold first:mt-0 last:mb-0", className)} {...props} />
  ),
  h6: ({ className, ...props }) => (
    <h6 className={cn("aui-md-h6 mt-3 mb-1 text-sm font-medium first:mt-0 last:mb-0", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("aui-md-p my-3 leading-relaxed first:mt-0 last:mb-0", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <AnalyticsLink
      component="MarkdownTextLink"
      className={cn("aui-md-a text-primary hover:text-primary/80 underline underline-offset-2", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "aui-md-blockquote border-muted-foreground/30 text-muted-foreground my-3 border-s-2 ps-4",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("aui-md-ul marker:text-muted-foreground my-3 ms-5 list-disc", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("aui-md-ol marker:text-muted-foreground my-3 ms-5 list-decimal", className)} {...props} />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("aui-md-hr border-muted-foreground/20 my-3", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <div className="aui-md-table-wrapper my-3 overflow-x-auto">
      <table className={cn("aui-md-table w-full border-separate border-spacing-0", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "aui-md-th bg-muted px-3 py-1.5 text-start font-medium first:rounded-ss-lg last:rounded-se-lg",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "aui-md-td border-muted-foreground/20 border-s border-b px-3 py-1.5 text-start last:border-e",
        className,
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr className={cn("aui-md-tr m-0 border-b p-0 first:border-t", className)} {...props} />
  ),
  li: ({ className, ...props }) => <li className={cn("aui-md-li leading-relaxed", className)} {...props} />,
  strong: ({ className, ...props }) => <strong className={cn("aui-md-strong font-semibold", className)} {...props} />,
  sup: ({ className, ...props }) => <sup className={cn("aui-md-sup text-sm", className)} {...props} />,
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "aui-md-pre border-border/50 bg-muted/30 overflow-x-auto rounded-t-none rounded-b-md border border-t-0 p-2 text-base leading-relaxed",
        className,
      )}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={cn(
          !isCodeBlock && "aui-md-inline-code bg-muted rounded-md px-1.5 py-0.5 font-mono text-sm",
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader: MarkdownTextCodeHeader,
});
