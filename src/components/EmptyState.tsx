import type { ReactElement, ReactNode } from "react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "./Empty.js";

interface IEmptyStateProps {
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
}

export function EmptyState({ title, description, children }: IEmptyStateProps): ReactElement {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  );
}
