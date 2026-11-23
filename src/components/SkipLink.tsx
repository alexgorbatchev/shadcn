import type { ComponentProps, ReactElement } from "react";
import { ButtonLink } from "./ButtonLink.js";
import { cn } from "../utils/cn.js";

type SkipLinkProps = Omit<ComponentProps<typeof ButtonLink>, "variant" | "size" | "href"> & {
  /** The id of the element to skip to. Pass `onClick` as well when the app moves focus itself. */
  targetId: string;
};

/**
 * The first stop for keyboard users: a link to the main content, hidden until it receives keyboard focus, then shown
 * as an outline button pinned to the top start corner. It jumps to `targetId`; an `onClick` that calls
 * `preventDefault` lets the app move focus itself, such as to the page's heading.
 */
function SkipLink({ targetId, className, children = "Skip to content", ...props }: SkipLinkProps): ReactElement {
  return (
    <ButtonLink
      data-slot="skip-link"
      variant="outline"
      size="sm"
      href={`#${targetId}`}
      // Pinned to the top start corner and moved above the viewport until it has keyboard focus. Screen readers still
      // reach it; button padding would defeat a 1px visually-hidden box.
      className={cn(
        "fixed start-2 top-2 z-50 not-focus-visible:-translate-y-[calc(100%+1rem)] motion-safe:transition-transform",
        className,
      )}
      {...props}
    >
      {children}
    </ButtonLink>
  );
}

export { SkipLink };
export type { SkipLinkProps };
