import { Button } from "../../Button.js";
import type { JSX } from "react";
import { type ComponentProps } from "react";
import {
  CheckIcon,
  FileArchiveIcon,
  FileImageIcon,
  FileTextIcon,
  Loader2Icon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { Progress } from "../../Progress.js";
import type { IComposerAttachment } from "./composer/types.js";
export function ComposerAttachmentChip({ attachment, onRemove, ...props }: IComposerAttachmentChipProps): JSX.Element {
  const AttachmentGlyph = ATTACHMENT_ICONS[attachment.kind ?? "text"];
  return (
    <div
      data-testid="ComposerAttachmentChip"
      data-slot="composer-attachment"
      data-state={attachment.state}
      role={attachment.state === "error" ? "alert" : undefined}
      className={cn(field, "relative flex items-center gap-2.5 overflow-hidden rounded-sm py-1.5 ps-1.5 pe-2.5")}
      {...props}
    >
      <AttachmentGlyph aria-hidden="true" className={cn("size-4", "rounded-sm bg-secondary p-1")} />
      <span className="flex flex-col">
        <span className="max-w-36 truncate text-sm font-medium">{attachment.name}</span>
        <span className={cn("text-xs", attachment.state === "error" ? "text-destructive" : "text-muted-foreground")}>
          {attachment.meta}
        </span>
      </span>
      <>
        {attachment.state === "uploading" ? (
          <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
        ) : attachment.state === "done" && onRemove ? (
          <Button
            type="button"
            aria-label={`Remove ${attachment.name}`}
            onClick={() => onRemove(attachment.name)}
            variant="ghost"
            size="icon"
          >
            <XIcon aria-hidden="true" data-icon="inline-start" />
          </Button>
        ) : attachment.state === "done" ? (
          <CheckIcon aria-hidden="true" className={cn("size-4", "text-success")} />
        ) : null}
      </>
      {attachment.state === "uploading" && (
        <Progress
          aria-label={`Uploading ${attachment.name}`}
          value={attachment.progress ?? 0}
          className="absolute inset-x-0 bottom-0"
        />
      )}
    </div>
  );
}
interface IComposerAttachmentChipProps extends Omit<Omit<ComponentProps<"div">, "children">, "className" | "style"> {
  attachment: IComposerAttachment;
  onRemove?: (name: string) => void;
}
const ATTACHMENT_ICONS: Record<NonNullable<IComposerAttachment["kind"]>, LucideIcon> = {
  image: FileImageIcon,
  text: FileTextIcon,
  archive: FileArchiveIcon,
};
