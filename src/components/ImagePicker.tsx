import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalytics } from "../hooks/useAnalytics.js";
import { useRef, type ReactElement } from "react";
import { ImageIcon, UploadIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar.js";
import { Button } from "./Button.js";
import { useObjectURL } from "../hooks/useObjectURL.js";

interface IImagePickerProps extends IAnalyticsProps {
  src?: string;
  file?: File | null;
  label: string;
  disabled?: boolean;
  onFileChange: (file: File) => void;
  onClear: () => void;
}

export function ImagePicker({
  analytics,
  src,
  file,
  label,
  disabled,
  onFileChange,
  onClear,
}: IImagePickerProps): ReactElement {
  const track = useAnalytics("ImagePicker", analytics);
  const input = useRef<HTMLInputElement>(null);
  const preview = useObjectURL(file);
  const image = file === null ? undefined : (preview ?? src);
  return (
    <figure className="flex min-w-0 flex-col items-center gap-3" aria-label={label}>
      <Avatar size="preview" shape="square">
        <AvatarImage src={image} alt={label} />
        <AvatarFallback>
          <ImageIcon className="size-12" aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      <input
        ref={input}
        hidden
        type="file"
        accept="image/png,image/jpeg,image/gif"
        aria-label="Choose image file"
        disabled={disabled}
        onChange={(event) => {
          const selected = event.currentTarget.files?.[0];
          if (selected) {
            onFileChange(selected);
            track({ name: "ui.commit" }, event.nativeEvent);
          }
          event.currentTarget.value = "";
        }}
      />
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" disabled={disabled} onClick={() => input.current?.click()}>
          <UploadIcon data-icon="inline-start" />
          Upload image
        </Button>
        <Button type="button" variant="outline" disabled={disabled || !image} onClick={onClear}>
          Unset image
        </Button>
      </div>
    </figure>
  );
}
