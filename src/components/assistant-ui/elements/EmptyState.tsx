import type { ComponentProps, JSX } from "react";
import { Empty } from "../../Empty.js";
type EmptyStateProps = ComponentProps<typeof Empty>;
export function EmptyState(props: EmptyStateProps): JSX.Element {
  return <Empty data-testid="EmptyState" {...props} />;
}
