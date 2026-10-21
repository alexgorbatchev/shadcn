import { useState, type ComponentProps, type JSX } from "react";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
import { cn } from "../../../utils/cn.js";
import { paper } from "./constants.js";
interface IImageGenerationProps extends Omit<ComponentProps<"div">, "children" | "className" | "style"> {
  prompt: string;
  generating: boolean;
  image?: string;
  imageAlt?: string;
  onRegenerate?: () => void;
}
interface IGeneratedImageDimensions {
  source: string;
  width: number;
  height: number;
}
export function ImageGeneration({
  prompt,
  generating,
  image,
  imageAlt = prompt,
  onRegenerate,
  ...props
}: IImageGenerationProps): JSX.Element {
  const [dimensions, setDimensions] = useState<IGeneratedImageDimensions | null>(null);
  const currentDimensions = dimensions?.source === image ? dimensions : null;
  return (
    <div data-testid="ImageGeneration" data-slot="image-generation" className="flex w-52 flex-col gap-2" {...props}>
      <div className={cn(paper, "relative flex aspect-square items-center justify-center overflow-hidden rounded-md")}>
        {generating ? (
          <ShimmerLabel role="status">Generating image</ShimmerLabel>
        ) : image ? (
          <img
            src={image}
            alt={imageAlt}
            className="size-full object-cover"
            onLoad={(event) =>
              setDimensions({
                source: image,
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })
            }
          />
        ) : (
          <span className="text-muted-foreground text-sm">No image available</span>
        )}
        {!generating && currentDimensions ? (
          <span className="absolute end-1.5 bottom-1.5 rounded-sm bg-background px-1 text-sm text-muted-foreground">
            {currentDimensions.width} × {currentDimensions.height}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{prompt}</p>
        {onRegenerate ? (
          <Button
            variant="ghost"
            aria-label="Regenerate image"
            disabled={generating}
            onClick={onRegenerate}
            size="icon"
          >
            <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
