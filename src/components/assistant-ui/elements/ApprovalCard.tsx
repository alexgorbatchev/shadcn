import { useId, type ComponentProps, type JSX, type ReactNode } from "react";
import { CheckIcon, Loader2Icon, TerminalIcon, XIcon } from "lucide-react";

import { Button } from "../../Button.js";
import { useReceiptFocus } from "../hooks/useReceiptFocus.js";
import type { ILabelValue } from "./types.js";

export type ApprovalState = "request" | "running" | "done" | "denied";

export interface IApprovalCardProps extends Omit<ComponentProps<"div">, "children" | "title" | "className" | "style"> {
  state: ApprovalState;
  title: string;
  subtitle: string;
  command?: string;
  description?: string;
  details?: readonly ILabelValue[];
  variant?: "default" | "destructive";
  icon?: ReactNode;
  onAllowOnce?: () => void;
  onAlwaysAllow?: () => void;
  onDeny?: () => void;
  allowOnceLabel?: string;
  alwaysAllowLabel?: string;
  denyLabel?: string;
  statusLabel?: string;
}

const receiptText: Record<Exclude<ApprovalState, "request">, string> = {
  running: "Approved, running",
  done: "Finished",
  denied: "Denied",
};

export function ApprovalCard({
  state,
  title,
  subtitle,
  command,
  description,
  details,
  variant = "default",
  icon,
  onAllowOnce,
  onAlwaysAllow,
  onDeny,
  allowOnceLabel = "Allow once",
  alwaysAllowLabel = "Always allow",
  denyLabel = "Deny",
  statusLabel,
  ...props
}: IApprovalCardProps): JSX.Element {
  const titleId = useId();
  const descriptionId = useId();
  const { receiptRef, focusHandlers } = useReceiptFocus<HTMLDivElement>(props);

  return (
    <div
      {...props}
      {...focusHandlers}
      role="group"
      data-testid="ApprovalCard"
      data-slot="approval-card"
      data-variant={variant}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="flex w-full max-w-sm flex-col gap-2 rounded-md border border-frame-edge bg-card p-2 text-card-foreground shadow-frame"
    >
      <div className="flex items-center gap-2">
        {icon ?? (
          <TerminalIcon
            aria-hidden="true"
            className={variant === "destructive" ? "size-4 text-destructive" : "size-4"}
          />
        )}
        <div className="flex min-w-0 flex-col">
          <p id={titleId} className="text-lg font-medium">
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {description ? (
        <p id={descriptionId} className="text-base">
          {description}
        </p>
      ) : null}
      {command ? (
        <pre className="rounded-sm border border-border bg-secondary p-2 text-base whitespace-pre-wrap break-words">
          {command}
        </pre>
      ) : null}
      {details?.length ? (
        <dl className="flex flex-col gap-1 rounded-sm border border-border bg-secondary p-2">
          {details.map((detail, index) => (
            <div
              key={`${detail.label}-${index}`}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 text-base"
            >
              <dt className="text-muted-foreground">{detail.label}</dt>
              <dd className="break-words">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <div className="flex min-h-5 flex-wrap items-center justify-end gap-1">
        {state === "request" ? (
          <>
            {onDeny ? (
              <Button variant="ghost" onClick={onDeny}>
                {denyLabel}
              </Button>
            ) : null}
            {onAlwaysAllow ? (
              <Button variant="outline" onClick={onAlwaysAllow}>
                {alwaysAllowLabel}
              </Button>
            ) : null}
            {onAllowOnce ? (
              <Button variant={variant === "destructive" ? "destructive" : "default"} onClick={onAllowOnce}>
                {allowOnceLabel}
              </Button>
            ) : null}
          </>
        ) : (
          <div
            key={state}
            ref={receiptRef}
            tabIndex={-1}
            role="status"
            className="flex items-center gap-1 text-base text-muted-foreground"
          >
            {state === "running" ? (
              <Loader2Icon aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
            ) : null}
            {state === "denied" ? <XIcon aria-hidden="true" className="size-4" /> : null}
            {state === "done" ? <CheckIcon aria-hidden="true" className="size-4 text-success" /> : null}
            {statusLabel ?? receiptText[state]}
          </div>
        )}
      </div>
    </div>
  );
}
