import { type ReactElement } from "react";
import { type ComponentProps } from "react";
import { memo } from "react";
import { type QuoteMessagePartComponent } from "@assistant-ui/react";

import { QuoteIcon } from "lucide-react";

type QuoteBlockRootProps = Omit<ComponentProps<"blockquote">, "className" | "style">;
type QuoteBlockTextProps = Omit<ComponentProps<"p">, "className" | "style">;
export function QuoteBlockRoot(props: QuoteBlockRootProps): ReactElement {
  return (
    <blockquote
      data-testid="QuoteBlockRoot"
      data-slot="quote-block"
      className="mb-1 flex items-start gap-1"
      {...props}
    />
  );
}
export function QuoteBlockIcon(): ReactElement {
  return <QuoteIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />;
}
export function QuoteBlockText(props: QuoteBlockTextProps): ReactElement {
  return (
    <p
      data-testid="QuoteBlockText"
      data-slot="quote-block-text"
      className="text-muted-foreground line-clamp-2 min-w-0 text-sm italic"
      {...props}
    />
  );
}
export const QuoteBlock = Object.assign(
  memo(function QuoteBlock({ text }: ComponentProps<QuoteMessagePartComponent>): ReactElement {
    return (
      <QuoteBlockRoot>
        <QuoteBlockIcon />
        <QuoteBlockText>{text}</QuoteBlockText>
      </QuoteBlockRoot>
    );
  }),
  { Root: QuoteBlockRoot, Icon: QuoteBlockIcon, Text: QuoteBlockText },
);
