import type { ComponentProps, JSX } from "react";
import {
  getMimeTypeIcon,
  getFileDataKind,
  getFileHref,
  getBase64Size,
  getDataUrlSize,
  getFileLabel,
  formatFileSize,
} from "../utils/fileUtils.js";
import { buttonVariants } from "../../Button.js";
import { cva, type VariantProps } from "class-variance-authority";
import { FileIcon, DownloadIcon } from "lucide-react";
import type { FileMessagePartComponent } from "@assistant-ui/react";
import { cn } from "../../../utils/cn.js";
import { AudioPlayer } from "./AudioPlayer.js";
import { VideoPlayer } from "./VideoPlayer.js";
const fileVariants = cva("inline-flex items-center gap-2 rounded-md text-foreground transition-colors", {
  variants: {
    variant: {
      outline: "border border-frame-edge bg-card text-card-foreground shadow-frame",
      ghost: "bg-transparent",
      muted: "bg-secondary",
    },
    size: {
      sm: "px-1.5 py-1 text-sm",
      default: "px-2 py-1.5 text-sm",
      lg: "p-2 text-base",
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "default",
  },
});
export type FileRootProps = Omit<React.ComponentProps<"div">, "className" | "style"> &
  VariantProps<typeof fileVariants>;
export function FileRoot({ variant, size, children, ...props }: FileRootProps): JSX.Element {
  return (
    <div
      data-testid="FileRoot"
      data-slot="file-root"
      data-variant={variant}
      data-size={size}
      className={cn(fileVariants({ variant, size }))}
      {...props}
    >
      {children}
    </div>
  );
}
interface IFileIconDisplayProps extends Omit<React.ComponentProps<"span">, "className" | "style"> {
  mimeType?: string;
}
export function FileIconDisplay({ mimeType, children, ...props }: IFileIconDisplayProps): JSX.Element {
  const IconComponent = mimeType ? getMimeTypeIcon(mimeType) : FileIcon;
  return (
    <span data-testid="FileIconDisplay" data-slot="file-icon" {...props}>
      {children ?? <IconComponent aria-hidden="true" className={cn("size-4", "text-muted-foreground")} />}
    </span>
  );
}
export function FileName({ children, ...props }: FileNameProps): JSX.Element {
  return (
    <span data-testid="FileName" data-slot="file-name" className={cn("min-w-0 flex-1 truncate font-medium")} {...props}>
      {children || "Unnamed file"}
    </span>
  );
}
interface IFileSizeProps extends Omit<React.ComponentProps<"span">, "className" | "style"> {
  bytes: number;
}
export function FileSize({ bytes, ...props }: IFileSizeProps): JSX.Element {
  return (
    <span data-testid="FileSize" data-slot="file-size" className={cn("text-muted-foreground shrink-0")} {...props}>
      {formatFileSize(bytes)}
    </span>
  );
}
interface IFileDownloadProps extends Omit<Omit<React.ComponentProps<"a">, "href">, "className" | "style"> {
  data: string;
  mimeType: string;
  filename?: string;
  sourceType?: "url" | "id";
}
export function FileDownload({
  data,
  mimeType,
  filename,
  sourceType,
  children,
  ...props
}: IFileDownloadProps): JSX.Element | null {
  if (typeof data !== "string") return null;
  const kind = getFileDataKind(data, sourceType);
  const href = getFileHref(data, mimeType, sourceType);
  if (!href) return null;
  return (
    <a
      data-testid="FileDownload"
      data-slot="file-download"
      href={href}
      download={filename || "download"}
      {...(kind === "url" && { target: "_blank", rel: "noopener noreferrer" })}
      className={buttonVariants({ variant: "ghost", size: children ? "default" : "icon" })}
      aria-label={!children ? `Download ${filename || "file"}` : undefined}
      {...props}
    >
      {!children ? <DownloadIcon aria-hidden="true" data-icon="inline-start" /> : null}
      {children}
    </a>
  );
}
export interface IFilePlayerProps extends Omit<Omit<React.ComponentProps<"div">, "children">, "className" | "style"> {
  data: string;
  mimeType: string;
  filename?: string | undefined;
  sourceType?: "url" | "id" | undefined;
}
export function FilePlayer({ data, mimeType, filename, sourceType, ...props }: IFilePlayerProps): JSX.Element | null {
  const src = getFileHref(data, mimeType, sourceType);
  const normalizedMimeType = mimeType.toLowerCase();
  if (!src || (!normalizedMimeType.startsWith("audio/") && !normalizedMimeType.startsWith("video/"))) {
    return null;
  }
  return (
    <div data-testid="FilePlayer" data-slot="file-player" {...props}>
      {normalizedMimeType.startsWith("audio/") ? (
        <AudioPlayer src={src} title={filename} />
      ) : (
        <VideoPlayer src={src} title={filename} />
      )}
    </div>
  );
}
export function File({ filename, data, mimeType, sourceType }: FilePartProps): JSX.Element {
  const kind = getFileDataKind(data, sourceType);
  const showSize = typeof data === "string" && (kind === "base64" || kind === "data-uri");
  const mediaSource = getFileHref(data, mimeType, sourceType);
  const isMedia = mimeType.toLowerCase().startsWith("audio/") || mimeType.toLowerCase().startsWith("video/");
  if (mediaSource && isMedia) {
    return (
      <div data-testid="File" className="flex w-full max-w-xl flex-col gap-2">
        <FilePlayer
          data={data}
          mimeType={mimeType}
          {...(filename !== undefined && { filename })}
          {...(sourceType !== undefined && { sourceType })}
        />
        <div className="flex min-w-0 items-center justify-end gap-2 px-1">
          {showSize && <FileSize bytes={kind === "data-uri" ? getDataUrlSize(data) : getBase64Size(data)} />}
          <FileDownload
            data={data}
            mimeType={mimeType}
            {...(filename !== undefined && { filename })}
            {...(sourceType !== undefined && { sourceType })}
          />
        </div>
      </div>
    );
  }
  return (
    <FileRoot data-testid="File">
      <FileIconDisplay mimeType={mimeType} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <FileName>{filename || getFileLabel(mimeType)}</FileName>
        {showSize && <FileSize bytes={kind === "data-uri" ? getDataUrlSize(data) : getBase64Size(data)} />}
      </div>
      <FileDownload
        data={data}
        mimeType={mimeType}
        {...(filename !== undefined && { filename })}
        {...(sourceType !== undefined && { sourceType })}
      />
    </FileRoot>
  );
}
type FilePartProps = ComponentProps<FileMessagePartComponent>;
type FileNameProps = Omit<React.ComponentProps<"span">, "className" | "style">;
