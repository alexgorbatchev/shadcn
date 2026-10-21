import { Button } from "../../Button.js";
import type { JSX } from "react";
type PermissionGrantProps = Omit<
  ComponentProps<"div">,
  "children" | "capability" | "requester" | "reach" | "scope" | "onGrant"
> & {
  capability: string;
  requester: string;
  reach: readonly string[];
  scope: GrantScope | "pending";
  onGrant?: (scope: GrantScope) => void;
};
import type { ComponentProps } from "react";
import { KeyRoundIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field, mono, paper } from "./constants.js";
import { useReceiptFocus } from "../hooks/useReceiptFocus.js";
export type GrantScope = "session" | "always" | "denied";
export function PermissionGrant({
  capability,
  requester,
  reach,
  scope,
  onGrant,
  className,
  ...props
}: PermissionGrantProps): JSX.Element {
  const { receiptRef, focusHandlers } = useReceiptFocus(props);
  return (
    <div
      data-testid="PermissionGrant"
      data-slot="permission-grant"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-3.5 rounded-md p-4"), className)}
      {...props}
      {...focusHandlers}
    >
      <div className="flex items-center gap-2.5">
        <KeyRoundIcon aria-hidden="true" className={cn("size-4")} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-medium">{capability}</span>
          <span className="text-muted-foreground truncate text-sm">requested by {requester}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className={cn(mono, "text-muted-foreground")}>this grants</span>
        {reach.map((item) => (
          <span key={item} className="text-muted-foreground flex items-baseline gap-2 text-sm">
            <span aria-hidden className="bg-foreground/20 size-1 rounded-full" />
            {item}
          </span>
        ))}
      </div>

      <div className="flex h-8 items-center justify-end gap-2">
        {scope === "pending" ? (
          onGrant ? (
            <>
              <Button type="button" onClick={() => onGrant("denied")} variant="ghost">
                Deny
              </Button>
              <Button type="button" onClick={() => onGrant("session")} variant="ghost">
                This session
              </Button>
              <Button type="button" onClick={() => onGrant("always")} variant="default">
                Always
              </Button>
            </>
          ) : (
            <span
              key={scope}
              className={cn(
                field,
                mono,
                "fade-in animate-in text-muted-foreground rounded-full px-2.5 py-1.5 duration-300",
              )}
            >
              pending
            </span>
          )
        ) : (
          <span
            key={scope}
            ref={receiptRef}
            tabIndex={-1}
            className={cn(
              field,
              mono,
              "fade-in animate-in text-muted-foreground rounded-full px-2.5 py-1.5 duration-300",
            )}
          >
            {scope === "denied" ? "denied" : `granted · ${scope}`}
          </span>
        )}
      </div>
    </div>
  );
}
