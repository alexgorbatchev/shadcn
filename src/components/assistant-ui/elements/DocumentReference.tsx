import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { FileTextIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export interface IDocumentAnchor {
  page: number;
  quote: string;
}
export function DocumentReference({
  title,
  pages,
  anchors,
  activePage,
  onJump,
  ...props
}: IDocumentReferenceProps): JSX.Element {
  // several anchors can cite one page, and only one of them is the current item
  const currentIndex = anchors.findIndex((anchor) => anchor.page === activePage);
  return (
    <div
      data-testid="DocumentReference"
      data-slot="document-reference"
      className={cn(paper, "flex w-full max-w-sm flex-col gap-3 rounded-md p-3.5")}
      {...props}
    >
      <div className="flex items-center gap-2.5">
        <FileTextIcon
          aria-hidden="true"
          className={cn("size-4", "text-muted-foreground", "rounded-sm bg-secondary p-1")}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-medium">{title}</span>
          <span className={cn(mono, "text-muted-foreground")}>
            {pages} pages · {anchors.length} cited
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {anchors.map((anchor, i) => {
          const className = cn(
            "flex flex-col gap-1 rounded-md px-2.5 py-2 text-start transition-colors",
            anchor.page === activePage ? field : onJump ? "hover:bg-foreground/[0.035]" : undefined,
          );
          const content = (
            <span className="flex flex-col gap-1">
              <span className={cn(mono, "text-muted-foreground")}>p. {anchor.page}</span>
              <q className="text-muted-foreground border-border border-s-2 ps-2 text-sm leading-relaxed break-words">
                {anchor.quote}
              </q>
            </span>
          );
          return onJump ? (
            <Button
              key={`${anchor.page}-${i}`}
              type="button"
              aria-current={i === currentIndex || undefined}
              onClick={() => onJump(anchor.page)}
              variant="ghost"
              align="start"
            >
              {content}
            </Button>
          ) : (
            <div key={`${anchor.page}-${i}`} aria-current={i === currentIndex || undefined} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
interface IDocumentReferenceProps extends Omit<
  ComponentProps<"div">,
  "children" | "title" | "pages" | "anchors" | "activePage" | "onJump" | "className" | "style"
> {
  title: string;
  pages: number;
  anchors: readonly IDocumentAnchor[];
  activePage: number;
  onJump?: (page: number) => void;
}
