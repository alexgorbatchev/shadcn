import type { ReactElement, ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  Spinner,
  Stack,
} from "@alexgorbatchev/shadcn";
import type { Scenario } from "../types";

type ScenarioContentProps = { scenario: Scenario; children: ReactNode };

export function ScenarioContent({ scenario, children }: ScenarioContentProps): ReactElement {
  if (scenario === "loading")
    return (
      <Stack role="status" direction="horizontal" align="center" gap="control">
        <Spinner />
        Loading sample data…
      </Stack>
    );
  if (scenario === "error")
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load data</AlertTitle>
        <AlertDescription>This is the error scenario. Choose Populated to recover.</AlertDescription>
      </Alert>
    );
  if (scenario === "empty")
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No data yet</EmptyTitle>
          <EmptyDescription>This is the empty scenario. Choose Populated to explore the recipe.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  return <>{children}</>;
}
