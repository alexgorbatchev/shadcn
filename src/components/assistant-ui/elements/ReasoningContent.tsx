import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import type { JSX } from "react";
import { useContext } from "react";
import { CollapsibleContent } from "../../Collapsible.js";
import { reasoningPreviewContext } from "../utils/reasoningPreviewContext.js";
import { ReasoningFade } from "./ReasoningFade.js";
import { collapsePanel } from "./constants.js";
export function ReasoningContent({
  children,
  className,
  ...props
}: ComponentProps<typeof CollapsibleContent>): JSX.Element {
  const isPreview = useContext(reasoningPreviewContext);
  return (
    <CollapsibleContent
      data-testid="ReasoningContent"
      data-slot="reasoning-content"
      {...props}
      className={(state) =>
        cn(
          collapsePanel,
          "aui-reasoning-content text-muted-foreground relative text-sm outline-none data-closed:pointer-events-none",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <ReasoningFade side="top" />
      {children}
      {isPreview ? <ReasoningFade /> : null}
    </CollapsibleContent>
  );
}
