import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { RotateCcwIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export interface ICheckpoint {
  id: string;
  label: string;
  at: string;
  files: number;
}
export function CheckpointHistory({
  checkpoints,
  currentId,
  onRestore,
  ...props
}: ICheckpointHistoryProps): JSX.Element {
  const currentIndex = checkpoints.findIndex((checkpoint) => checkpoint.id === currentId);
  return (
    <div
      data-testid="CheckpointHistory"
      data-slot="checkpoint-history"
      className={cn(paper, "flex w-full max-w-sm flex-col gap-1 rounded-md p-3")}
      {...props}
    >
      <span className="px-1.5 pb-1 text-base font-medium">Checkpoints</span>

      {checkpoints.map((checkpoint, i) => {
        const ahead = currentIndex >= 0 && i > currentIndex;
        const current = checkpoint.id === currentId;
        return (
          <div
            key={checkpoint.id}
            className={cn(
              "group flex items-center gap-2.5 rounded-md px-1.5 py-1.5 transition-colors",
              current ? "bg-foreground/[0.05]" : "hover:bg-foreground/[0.03]",
              ahead && "opacity-40",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                current ? "bg-primary bg-primary" : ahead ? "border-foreground/25 border" : "bg-foreground/25",
              )}
            />

            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-base">{checkpoint.label}</span>
              <span className={cn(mono, "text-muted-foreground")}>
                {checkpoint.at} · {checkpoint.files} files
              </span>
            </span>

            {current ? (
              <span className={cn(mono, "text-muted-foreground shrink-0")}>current</span>
            ) : onRestore ? (
              <Button
                type="button"
                variant="ghost"
                aria-label={`Restore to ${checkpoint.label}`}
                onClick={() => onRestore(checkpoint.id)}
              >
                <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
                Restore
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
interface ICheckpointHistoryProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "checkpoints" | "currentId" | "onRestore">,
  "className" | "style"
> {
  checkpoints: readonly ICheckpoint[];
  currentId: string;
  onRestore?: (id: string) => void;
}
