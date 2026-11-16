import { Columns2Icon, Rows2Icon } from "lucide-react";
import { useId, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Button } from "../Button.js";
import { Field, FieldContent, FieldDescription, FieldLabel } from "../Field.js";
import { Switch } from "../Switch.js";
import { ToggleGroup, ToggleGroupItem } from "../ToggleGroup.js";
import { ImageZoomToggle } from "./ImageZoomToggle.js";
import type {
  IImageSize,
  ImageComparisonMode,
  ImageComparisonOrientation,
  ImageDifferenceState,
  ImageZoom,
} from "./types.js";

interface IImageComparisonToolbarProps extends IDensityProps {
  mode: ImageComparisonMode;
  onModeChange: (mode: ImageComparisonMode) => void;
  orientation: ImageComparisonOrientation;
  onOrientationChange: (orientation: ImageComparisonOrientation) => void;
  zoom: ImageZoom;
  onZoomChange: (zoom: ImageZoom) => void;
  showDifferences: boolean;
  onShowDifferencesChange: (showDifferences: boolean) => void;
  differences: ImageDifferenceState;
  onPeekChange: (isPeeking: boolean) => void;
  beforeLabel: string;
  afterLabel: string;
  beforeSize?: IImageSize;
  afterSize?: IImageSize;
}

interface IToolbarSectionProps {
  title: string;
  titleId: string;
  children: ReactNode;
}

function ToolbarSection({ title, titleId, children }: IToolbarSectionProps): ReactElement {
  return (
    <div data-slot="image-comparison-toolbar-section" className="flex min-w-0 flex-col gap-1.5">
      {/* The options name themselves; a narrow bar drops the visible titles to save height. */}
      <span id={titleId} className="sr-only text-xs font-medium text-muted-foreground @3xl:not-sr-only">
        {title}
      </span>
      {children}
    </div>
  );
}

function toMode(value: string | undefined): ImageComparisonMode {
  return value === "swipe" || value === "side-by-side" ? value : "toggle";
}

function isPeekKey(event: KeyboardEvent<HTMLButtonElement>): boolean {
  return event.key === " " || event.key === "Enter";
}

function describeDifferences(differences: ImageDifferenceState, showDifferences: boolean): string {
  if (differences.status === "unavailable") return differences.reason;
  if (!showDifferences) return "";
  if (differences.status !== "ready") return "Comparing pixels…";
  const count = differences.diff.regions.length;
  if (count === 0) return "No visible differences";
  return `${count} changed ${count === 1 ? "region" : "regions"}`;
}

function formatSize(size: IImageSize): string {
  return `${size.width} × ${size.height}`;
}

/** Comparison controls: a side panel when the comparison is wide and a wrapping bar below it when narrow. */
export function ImageComparisonToolbar({
  mode,
  onModeChange,
  orientation,
  onOrientationChange,
  zoom,
  onZoomChange,
  showDifferences,
  onShowDifferencesChange,
  differences,
  onPeekChange,
  beforeLabel,
  afterLabel,
  beforeSize,
  afterSize,
  density,
}: IImageComparisonToolbarProps): ReactElement {
  const id = useId();
  const isUnavailable = differences.status === "unavailable";
  const sizeMismatch =
    beforeSize && afterSize && (beforeSize.width !== afterSize.width || beforeSize.height !== afterSize.height)
      ? `Sizes differ: ${beforeLabel} ${formatSize(beforeSize)}, ${afterLabel} ${formatSize(afterSize)}. ` +
        `${beforeLabel} is fitted inside the ${afterLabel} image box.`
      : undefined;

  return (
    <div
      role="group"
      aria-label="Comparison controls"
      data-slot="image-comparison-toolbar"
      data-density={density}
      className="flex shrink-0 flex-wrap items-end gap-x-panel gap-y-3 border-t border-border p-panel-sm @3xl:w-72 @3xl:flex-col @3xl:flex-nowrap @3xl:items-stretch @3xl:overflow-y-auto @3xl:border-t-0 @3xl:border-s"
    >
      <ToolbarSection title="Mode" titleId={`${id}-mode`}>
        <ToggleGroup
          aria-labelledby={`${id}-mode`}
          required
          value={[mode]}
          onValueChange={(value) => onModeChange(toMode(value[0]))}
          variant="outline"
          size="sm"
          spacing={0}
          layout="fill"
        >
          <ToggleGroupItem value="toggle">Toggle</ToggleGroupItem>
          <ToggleGroupItem value="swipe">Swipe</ToggleGroupItem>
          <ToggleGroupItem value="side-by-side">Side by side</ToggleGroupItem>
        </ToggleGroup>
      </ToolbarSection>
      <ToolbarSection title="Orientation" titleId={`${id}-orientation`}>
        <ToggleGroup
          aria-labelledby={`${id}-orientation`}
          required
          value={[orientation]}
          onValueChange={(value) => onOrientationChange(value[0] === "vertical" ? "vertical" : "horizontal")}
          variant="outline"
          size="sm"
          spacing={0}
          layout="fill"
          disabled={mode !== "side-by-side"}
        >
          <ToggleGroupItem value="horizontal">
            <Columns2Icon data-icon="inline-start" />
            Horizontal
          </ToggleGroupItem>
          <ToggleGroupItem value="vertical">
            <Rows2Icon data-icon="inline-start" />
            Vertical
          </ToggleGroupItem>
        </ToggleGroup>
      </ToolbarSection>
      <ToolbarSection title="Zoom" titleId={`${id}-zoom`}>
        <ImageZoomToggle zoom={zoom} onZoomChange={onZoomChange} layout="fill" />
      </ToolbarSection>
      <Button
        variant="outline"
        size="sm"
        disabled={mode !== "toggle"}
        className="touch-none"
        onPointerDown={(event) => {
          if (event.button === 0) onPeekChange(true);
        }}
        onPointerUp={() => onPeekChange(false)}
        onPointerLeave={() => onPeekChange(false)}
        onPointerCancel={() => onPeekChange(false)}
        onKeyDown={(event) => {
          if (isPeekKey(event)) onPeekChange(true);
        }}
        onKeyUp={(event) => {
          if (isPeekKey(event)) onPeekChange(false);
        }}
        onBlur={() => onPeekChange(false)}
        onContextMenu={(event) => event.preventDefault()}
      >
        Hold to show before
      </Button>
      <Field orientation="horizontal">
        <Switch
          id={`${id}-differences`}
          aria-describedby={`${id}-differences-status`}
          checked={showDifferences && !isUnavailable}
          disabled={isUnavailable}
          onCheckedChange={onShowDifferencesChange}
        />
        <FieldContent>
          <FieldLabel htmlFor={`${id}-differences`}>Highlight differences</FieldLabel>
          {showDifferences && differences.status === "ready" && (
            <FieldDescription data-slot="image-comparison-legend" className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-3 shrink-0 rounded-xs border-2 border-warning bg-warning/15" />
              Changed region
            </FieldDescription>
          )}
        </FieldContent>
      </Field>
      <div data-slot="image-comparison-status" className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
        <p id={`${id}-differences-status`} role="status">
          {describeDifferences(differences, showDifferences)}
        </p>
        {sizeMismatch && <p data-slot="image-comparison-size-mismatch">{sizeMismatch}</p>}
      </div>
    </div>
  );
}
