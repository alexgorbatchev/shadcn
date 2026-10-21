import type { ReactElement } from "react";
import { type PropsWithChildren, useState, type FC, isValidElement } from "react";
import { XIcon, PlusIcon, FileText, Loader2Icon, AlertCircleIcon } from "lucide-react";
import { AttachmentPrimitive, ComposerPrimitive, MessagePrimitive, useAuiState, useAui } from "@assistant-ui/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../Tooltip.js";
import { Dialog, DialogTitle, DialogContent, DialogTrigger } from "../../Dialog.js";
import { Avatar, AvatarImage, AvatarFallback } from "../../Avatar.js";
import { TooltipIconButton } from "../elements/TooltipIconButton.js";
import { useAttachmentSrc } from "../hooks/useAttachmentSrc.js";
import { cn } from "../../../utils/cn.js";

type AttachmentThumbContract = {
  src: string | undefined;
};

type AttachmentRemoveContract = {
  name: string;
};

type AttachmentPreviewProps = {
  src: string;
  name: string;
};
const AttachmentPreview: FC<AttachmentPreviewProps> = ({ src, name }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={`Preview of ${name}`}
      className={cn(
        "block h-auto max-h-[80vh] w-auto max-w-full rounded-sm object-contain transition-opacity duration-300 motion-reduce:transition-none",
        isLoaded ? "aui-attachment-preview-image-loaded opacity-100" : "aui-attachment-preview-image-loading opacity-0",
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );
};
type AttachmentPreviewDialogProps = PropsWithChildren<{
  src: string | undefined;
  name: string;
}>;
const AttachmentPreviewDialog: FC<AttachmentPreviewDialogProps> = ({ children, src, name }) => {
  if (!src) return children;
  return (
    <Dialog>
      <DialogTrigger render={isValidElement(children) ? children : <button type="button" />}>
        {isValidElement(children) ? undefined : children}
      </DialogTrigger>
      <DialogContent size="wide">
        <DialogTitle className="sr-only">Preview {name}</DialogTitle>
        <div className="aui-attachment-preview bg-background relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden rounded-sm">
          <AttachmentPreview src={src} name={name} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
const AttachmentThumb: FC<AttachmentThumbContract> = ({ src }) => {
  return (
    <Avatar size="lg">
      <AvatarImage src={src} alt="" />
      <AvatarFallback>
        <FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
};
const AttachmentUI: FC = () => {
  const aui = useAui();
  const isComposer = aui.attachment.source !== "message";
  const src = useAttachmentSrc();
  const name = useAuiState((s) => s.attachment.name);
  const typeLabel = useAuiState((s) => {
    const type = s.attachment.type;
    switch (type) {
      case "image":
        return "Image";
      case "document":
        return "Document";
      case "file":
        return "File";
      default:
        return type;
    }
  });
  // An attachment on a submission is still being prepared, whether or not the
  // adapter reports progress while it uploads.
  const uploadState = useAuiState((s) =>
    s.attachment.status.type === "incomplete" && s.attachment.status.reason === "error"
      ? "error"
      : s.attachment.status.type === "running" ||
          (s.optional.message?.submission !== undefined && s.attachment.status.type !== "complete")
        ? "uploading"
        : undefined,
  );
  const isUploading = uploadState === "uploading";
  const isError = uploadState === "error";
  const errorMessage = useAuiState((s) =>
    s.attachment.status.type === "incomplete" && s.attachment.status.reason === "error"
      ? (s.attachment.status.message ?? "Upload failed")
      : undefined,
  );
  return (
    <TooltipProvider>
      <Tooltip>
        <AttachmentPrimitive.Root render={<div className="aui-attachment-root relative" />}>
          <AttachmentPreviewDialog src={src} name={name}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label={src ? `Preview ${name}` : `${typeLabel} attachment ${name}`}
                  className="relative flex size-14 items-center justify-center overflow-hidden rounded-sm border border-border bg-secondary hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                />
              }
            >
              <AttachmentThumb src={src} />
              {isUploading && (
                <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader2Icon className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" />
                </span>
              )}
              {isError && (
                <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <AlertCircleIcon className="size-4 text-destructive" />
                </span>
              )}
            </TooltipTrigger>
          </AttachmentPreviewDialog>
          {isComposer && <AttachmentRemove name={name} />}
          {isError && (
            <p role="alert" className="max-w-56 py-1 text-sm text-destructive">
              {errorMessage}
            </p>
          )}
        </AttachmentPrimitive.Root>
        <TooltipContent side="top">
          <AttachmentPrimitive.Name />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
const AttachmentRemove: FC<AttachmentRemoveContract> = ({ name }) => {
  return (
    <AttachmentPrimitive.Remove asChild>
      <TooltipIconButton tooltip={`Remove ${name}`} side="top">
        <XIcon aria-hidden="true" className="size-3.5 shrink-0" />
      </TooltipIconButton>
    </AttachmentPrimitive.Remove>
  );
};
export function UserMessageAttachments(): ReactElement {
  return (
    <div className="aui-user-message-attachments-end col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2 empty:hidden">
      <MessagePrimitive.Attachments>{() => <AttachmentUI />}</MessagePrimitive.Attachments>
    </div>
  );
}
export function ComposerAttachments(): ReactElement {
  return (
    <div className="aui-composer-attachments flex w-full flex-row items-center gap-2 overflow-x-auto empty:hidden">
      <ComposerPrimitive.Attachments>{() => <AttachmentUI />}</ComposerPrimitive.Attachments>
    </div>
  );
}
export function ComposerAddAttachment(): ReactElement {
  return (
    <ComposerPrimitive.AddAttachment asChild>
      <TooltipIconButton tooltip="Add Attachment" side="bottom" variant="ghost" aria-label="Add Attachment">
        <PlusIcon aria-hidden="true" className="size-4 shrink-0" />
      </TooltipIconButton>
    </ComposerPrimitive.AddAttachment>
  );
}
