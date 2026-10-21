import type { JSX } from "react";
import type { ComponentProps } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard.js";
import { cn } from "../../../utils/cn.js";
import { DiffViewerFileBadge } from "./DiffViewerFileBadge.js";
import { DiffViewerStats } from "./DiffViewerStats.js";
interface IDiffViewerHeaderProps extends ComponentProps<"div"> {
  oldName?: string | undefined;
  newName?: string | undefined;
  additions?: number | undefined;
  deletions?: number | undefined;
  showIcon?: boolean | undefined;
  showStats?: boolean | undefined;
  copyText?: string | undefined;
  copyable?: boolean | undefined;
}
export function DiffViewerHeader({
  oldName,
  newName,
  additions = 0,
  deletions = 0,
  showIcon = false,
  showStats = true,
  copyText,
  copyable = true,
  className,
  ...props
}: IDiffViewerHeaderProps): JSX.Element | null {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    copiedDuration: 1500,
  });
  if (!oldName && !newName) return null;
  const displayName = newName || oldName;
  return (
    <div
      data-testid="DiffViewerHeader"
      data-slot="diff-viewer-header"
      className={cn(
        "border-frame-edge text-muted-foreground flex min-h-control-lg items-center gap-control-gap border-b px-control-x text-xs font-medium tracking-wide",
        className,
      )}
      {...props}
    >
      {showIcon && <DiffViewerFileBadge filename={displayName} />}
      <span className="min-w-0 flex-1 truncate">
        {oldName && newName && oldName !== newName ? (
          <>
            <span className="text-muted-foreground">{oldName}</span>
            <span className="text-muted-foreground">{" → "}</span>
            <span className="text-foreground">{newName}</span>
          </>
        ) : (
          displayName
        )}
      </span>
      {showStats && (additions > 0 || deletions > 0) && <DiffViewerStats additions={additions} deletions={deletions} />}
      {copyable && copyText && (
        <Button
          type="button"
          aria-label={`Copy diff of ${displayName}`}
          onClick={() => copyToClipboard(copyText)}
          variant="ghost"
          size="icon-sm"
        >
          {isCopied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
        </Button>
      )}
    </div>
  );
}
