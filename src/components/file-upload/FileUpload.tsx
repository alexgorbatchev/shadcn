import type { IAnalyticsProps } from "../../analytics/types.js";
import { useAnalyticsCallback } from "../../hooks/useAnalyticsCallback.js";
import { useId, type ReactElement, type ReactNode } from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { UploadIcon } from "lucide-react";
import type { IDensityProps } from "../../density/types.js";
import { cn } from "../../utils/cn.js";
import { Button } from "../Button.js";

type FileUploadProps = IAnalyticsProps &
  IDensityProps &
  Pick<
    DropzoneOptions,
    | "accept"
    | "maxSize"
    | "minSize"
    | "maxFiles"
    | "multiple"
    | "disabled"
    | "validator"
    | "onDrop"
    | "onDropRejected"
    | "onError"
  > & {
    label: string;
    description?: ReactNode;
    children?: ReactNode;
    name?: string;
  };
/** Native file selection and validation. Consumers own storage and upload requests. */
function FileUpload({
  analytics,
  label,
  description,
  children,
  name,
  density,
  ...options
}: FileUploadProps): ReactElement {
  const onDrop = useAnalyticsCallback("FileUpload", analytics, { name: "ui.commit" }, options.onDrop);
  const descriptionId = useId();
  const { getRootProps, getInputProps, open, isDragActive, isDragReject, isProcessing, fileRejections } = useDropzone({
    ...options,
    onDrop,
    noClick: true,
    noKeyboard: true,
  });
  return (
    <div data-density={density} className="grid gap-3">
      <div
        {...getRootProps({
          role: "group",
          "aria-label": label,
          "aria-describedby": description ? descriptionId : undefined,
          "aria-busy": isProcessing,
          "data-scroll": "none",
          className: cn(
            "grid justify-items-center gap-3 rounded-sm border border-dashed border-input bg-card p-6 text-center",
            isDragActive && "border-primary bg-accent",
            isDragReject && "border-destructive",
            options.disabled && "opacity-50",
          ),
        })}
      >
        <input {...getInputProps({ name, "aria-label": label })} />
        <UploadIcon aria-hidden="true" className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        <Button type="button" variant="outline" onClick={open} disabled={options.disabled || isProcessing}>
          Choose files
        </Button>
        {isDragActive && <p role="status">{isDragReject ? "Some files cannot be accepted." : "Drop files here."}</p>}
      </div>
      {fileRejections.length > 0 && (
        <ul role="alert" className="space-y-1 text-sm text-destructive">
          {fileRejections.map(({ file, errors }, index) => (
            <li key={`${file.name}-${index}`}>
              {file.name}: {errors.map((error) => error.message).join(" ")}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}
export { FileUpload };
export type { FileUploadProps };
export type { FileRejection, FileError, DropEvent, Accept } from "react-dropzone";
