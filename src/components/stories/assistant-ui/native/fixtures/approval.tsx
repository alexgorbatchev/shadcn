import { useState, type ComponentProps, type ReactElement } from "react";
import { ToolFallbackApproval } from "../../../../assistant-ui/native/ToolFallbackRoot.js";
import { NativeRuntimeFixture } from "../helpers.js";
import { ReadonlyThreadProvider } from "@assistant-ui/react";
import { Button } from "../../../../Button.js";

type Approval = NonNullable<ComponentProps<typeof ToolFallbackApproval>["approval"]>;
interface IApprovalFixtureProps {
  approval: Approval;
  shouldRejectFirst?: boolean;
}

export function ApprovalFixture({
  approval: initialApproval,
  shouldRejectFirst = false,
}: IApprovalFixtureProps): ReactElement {
  const [approval, setApproval] = useState(initialApproval);
  const [hasRejected, setHasRejected] = useState(false);
  return (
    <NativeRuntimeFixture>
      <ToolFallbackApproval
        approval={approval}
        status={{ type: "requires-action", reason: "tool-calls" }}
        respondToApproval={async (response) => {
          if (shouldRejectFirst && !hasRejected) {
            setHasRejected(true);
            throw new Error("Permission service unavailable");
          }
          const optionId = "optionId" in response ? response.optionId : undefined;
          const option = approval.options?.find((candidate) => candidate.id === optionId);
          setApproval({
            ...approval,
            ...response,
            approved: "approved" in response ? response.approved : !option?.kind.startsWith("reject"),
          });
        }}
      />
    </NativeRuntimeFixture>
  );
}

export function ApprovalSurfaceFixture(props: ComponentProps<typeof ToolFallbackApproval>): ReactElement {
  return (
    <NativeRuntimeFixture>
      <ToolFallbackApproval {...props} />
    </NativeRuntimeFixture>
  );
}
export function ReadonlyApprovalFixture(props: ComponentProps<typeof ToolFallbackApproval>): ReactElement {
  return (
    <NativeRuntimeFixture>
      <ReadonlyThreadProvider messages={[]}>
        <ToolFallbackApproval {...props} />
      </ReadonlyThreadProvider>
    </NativeRuntimeFixture>
  );
}
export function ApprovalLifecycleFixture(): ReactElement {
  const [status, setStatus] = useState<ComponentProps<typeof ToolFallbackApproval>["status"]>({ type: "complete" });
  return (
    <NativeRuntimeFixture>
      <Button onClick={() => setStatus({ type: "requires-action", reason: "tool-calls" })}>Request input</Button>
      <Button onClick={() => setStatus({ type: "complete" })}>Complete request</Button>
      <ToolFallbackApproval
        approval={{ id: "request", display: "text", prompt: "Release note" }}
        status={status}
        respondToApproval={async () => setStatus({ type: "running" })}
      />
    </NativeRuntimeFixture>
  );
}
