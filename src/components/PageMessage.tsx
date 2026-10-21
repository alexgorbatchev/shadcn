import { useId, type ReactElement, type ReactNode } from "react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "./Empty.js";

interface IPageMessageProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

/** A full-page message for unavailable, empty, or disconnected application screens. */
export function PageMessage({ title, description, children }: IPageMessageProps): ReactElement {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <main
      aria-labelledby={titleId}
      aria-describedby={description == null ? undefined : descriptionId}
      className="grid min-h-dvh w-full place-items-center bg-background text-foreground"
    >
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            <h1 id={titleId}>{title}</h1>
          </EmptyTitle>
          {description != null && <EmptyDescription id={descriptionId}>{description}</EmptyDescription>}
        </EmptyHeader>
        {children != null && <EmptyContent>{children}</EmptyContent>}
      </Empty>
    </main>
  );
}
