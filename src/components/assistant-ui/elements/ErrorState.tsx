import { cn } from "../../../utils/cn.js";
import type { JSX } from "react";
import { useId, type ComponentProps } from "react";
import { Button } from "../../Button.js";
import { CircleAlertIcon, RefreshCwIcon } from "lucide-react";
import { ShimmerLabel } from "./ShimmerLabel.js";
export interface IErrorStateProps extends Omit<ComponentProps<"div">, "children" | "role" | "className" | "style"> {
  title: string;
  detail: string;
  retrying: boolean;
  onRetry: () => void;
}
export function ErrorState({ title, detail, retrying, onRetry, ...props }: IErrorStateProps): JSX.Element {
  const titleId = useId();
  const detailId = useId();
  if (retrying) {
    return (
      <div
        data-testid="ErrorState"
        data-slot="error-state"
        key="retrying"
        role="status"
        className="flex w-full max-w-sm items-center gap-2 text-sm"
        {...props}
      >
        <RefreshCwIcon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
        <ShimmerLabel>Retrying</ShimmerLabel>
      </div>
    );
  }
  return (
    <div
      data-testid="ErrorState"
      data-slot="error-state"
      key="error"
      role="alert"
      aria-labelledby={titleId}
      aria-describedby={detailId}
      className="flex w-full max-w-sm items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm"
      {...props}
    >
      <CircleAlertIcon aria-hidden="true" className={cn("size-4", "text-destructive")} />
      <div>
        <p id={titleId} className="font-medium text-destructive">
          {title}
        </p>
        <p id={detailId} className="mt-1 text-sm leading-snug text-muted-foreground">
          {detail}
        </p>
      </div>
      <Button variant="destructive" onClick={onRetry}>
        <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
        Retry
      </Button>
    </div>
  );
}
