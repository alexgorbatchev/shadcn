import { useId, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn.js";

/** A list of a document's parts, each a button that goes to its part, grouped into titled sections. */
function Outline({ className, ...props }: ComponentProps<"div">): ReactElement {
  return <div data-slot="outline" className={cn("flex min-w-0 flex-col gap-3 text-sm", className)} {...props} />;
}

interface IOutlineSectionProps {
  title: ReactNode;
  /** A short summary beside the title, such as "3 of 4 answered". */
  meta?: ReactNode;
  children: ReactNode;
}

/** A titled group of `OutlineItem`s, named by its title. */
function OutlineSection({ title, meta, children }: IOutlineSectionProps): ReactElement {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} data-slot="outline-section" className="flex min-w-0 flex-col gap-1">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        {/* A long title wraps like the items under it, so nothing is cut off in a narrow popover. */}
        <p id={titleId} className="min-w-0 font-medium break-words">
          {title}
        </p>
        {meta != null && <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>}
      </div>
      <ul className="flex flex-col">{children}</ul>
    </section>
  );
}

interface IOutlineItemProps {
  label: ReactNode;
  /** The part's state, such as "Not answered". */
  state?: ReactNode;
  onSelect: () => void;
}

/** One part in an `OutlineSection`: a button with the part's name and state that goes to it. */
function OutlineItem({ label, state, onSelect }: IOutlineItemProps): ReactElement {
  return (
    <li data-slot="outline-item">
      <button
        type="button"
        className="flex w-full min-w-0 items-baseline justify-between gap-2 rounded-sm px-1.5 py-1 text-start outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring"
        onClick={onSelect}
      >
        <span className="min-w-0">{label}</span>
        {state != null && <span className="shrink-0 text-xs text-muted-foreground">{state}</span>}
      </button>
    </li>
  );
}

export { Outline, OutlineSection, OutlineItem };
