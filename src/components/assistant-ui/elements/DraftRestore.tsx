import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { PencilLineIcon, XIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export function DraftRestore({ draft, savedAt, onRestore, onDiscard, ...props }: IDraftRestoreProps): JSX.Element {
  return (
    <div
      data-testid="DraftRestore"
      data-slot="draft-restore"
      className={cn(
        paper,
        "fade-in slide-in-from-bottom-1 animate-in flex w-full max-w-sm items-center gap-2.5 rounded-md py-2 pr-2 pl-3.5 duration-300",
      )}
      {...props}
    >
      <PencilLineIcon aria-hidden="true" className={cn("size-4")} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground/70 truncate text-base">{draft}</span>
        <span className={cn(mono, "text-muted-foreground")}>unsent draft · {savedAt}</span>
      </div>
      <Button type="button" onClick={onRestore} disabled={!onRestore} variant="outline">
        Restore
      </Button>
      <Button
        type="button"
        aria-label="Discard the draft"
        onClick={onDiscard}
        disabled={!onDiscard}
        variant="ghost"
        size="icon"
      >
        <XIcon aria-hidden="true" data-icon="inline-start" />
      </Button>
    </div>
  );
}
interface IDraftRestoreProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "draft" | "savedAt" | "onRestore" | "onDiscard">,
  "className" | "style"
> {
  draft: string;
  savedAt: string;
  onRestore?: () => void;
  onDiscard?: () => void;
}
