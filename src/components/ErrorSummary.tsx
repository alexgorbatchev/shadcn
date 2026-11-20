import { useId, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { Button } from "./Button.js";
import { cn } from "../utils/cn.js";

interface IErrorSummaryProps extends Omit<ComponentProps<"section">, "title"> {
  /** Names what is missing, such as "3 answers needed". */
  title: ReactNode;
  /** The heading level of the title within the page. */
  headingLevel?: 2 | 3 | 4;
}

/**
 * The list of problems that stop a form from completing, at the top of the form: a heading, then one link per problem
 * that takes the person to its field.
 */
function ErrorSummary({ title, headingLevel = 2, className, children, ...props }: IErrorSummaryProps): ReactElement {
  const titleId = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      aria-labelledby={titleId}
      data-slot="error-summary"
      data-scroll="none"
      className={cn(
        "flex flex-col gap-2 rounded-md border border-destructive p-panel text-sm forced-colors:border-[CanvasText]",
        className,
      )}
      {...props}
    >
      <Heading id={titleId} className="font-medium text-destructive">
        {title}
      </Heading>
      <ul className="flex flex-col gap-1">{children}</ul>
    </section>
  );
}

interface IErrorSummaryItemProps {
  /** Moves to the problem's field: opens whatever hides it, then focuses it. */
  onSelect: () => void;
  children: ReactNode;
}

/** One problem in an `ErrorSummary`: a link-styled button that goes to its field. */
function ErrorSummaryItem({ onSelect, children }: IErrorSummaryItemProps): ReactElement {
  return (
    <li data-slot="error-summary-item">
      <Button type="button" variant="link" size="inline" className="text-start whitespace-normal" onClick={onSelect}>
        {children}
      </Button>
    </li>
  );
}

export { ErrorSummary, ErrorSummaryItem };
export type { IErrorSummaryProps, IErrorSummaryItemProps };
