import { ChevronLeftIcon, ChevronRightIcon, Columns2Icon, Rows2Icon } from "lucide-react";
import { useId, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Button } from "../Button.js";
import { Switch } from "../Switch.js";
import { ToggleGroup, ToggleGroupItem } from "../ToggleGroup.js";
import { ImageZoomToggle } from "./ImageZoomToggle.js";
import type {
  IImageSize,
  ImageComparisonMode,
  ImageComparisonOrientation,
  ImageComparisonSide,
  ImageDifferenceState,
  ImageZoom,
} from "./types.js";

interface IImageComparisonToolbarProps extends IDensityProps {
  mode: ImageComparisonMode;
  onModeChange: (mode: ImageComparisonMode) => void;
  side: ImageComparisonSide;
  onSideChange: (side: ImageComparisonSide) => void;
  orientation: ImageComparisonOrientation;
  onOrientationChange: (orientation: ImageComparisonOrientation) => void;
  zoom: ImageZoom;
  onZoomChange: (zoom: ImageZoom) => void;
  showDifferences: boolean;
  onShowDifferencesChange: (showDifferences: boolean) => void;
  differences: ImageDifferenceState;
  activeRegionIndex: number;
  onStepChange: (delta: -1 | 1) => void;
  onCommentActiveDifference?: () => void;
  onPeekChange: (isPeeking: boolean) => void;
  beforeLabel: string;
  afterLabel: string;
  beforeSize?: IImageSize;
  afterSize?: IImageSize;
  toolbar?: ReactNode;
}

interface IToolbarSectionProps {
  title: string;
  titleId: string;
  children: ReactNode;
}

function ToolbarSection({ title, titleId, children }: IToolbarSectionProps): ReactElement {
  return (
    <div data-slot="image-comparison-toolbar-section" className="flex shrink-0 items-center">
      {/* The options name themselves; keeping group titles screen-reader-only lets the bar fit in one row. */}
      <span id={titleId} className="sr-only">
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

/** Comparison controls in a single horizontal wrapping toolbar row above the stage so images get the full width. */
export function ImageComparisonToolbar({
  mode,
  onModeChange,
  side,
  onSideChange,
  orientation,
  onOrientationChange,
  zoom,
  onZoomChange,
  showDifferences,
  onShowDifferencesChange,
  differences,
  activeRegionIndex,
  onStepChange,
  onCommentActiveDifference,
  onPeekChange,
  beforeLabel,
  afterLabel,
  beforeSize,
  afterSize,
  toolbar,
  density,
}: IImageComparisonToolbarProps): ReactElement {
  const id = useId();
  const isUnavailable = differences.status === "unavailable";
  const regionCount = showDifferences && differences.status === "ready" ? differences.diff.regions.length : 0;
  const hasStepper = regionCount > 0;
  const releasePeek = (): void => onPeekChange(false);
  const statusText = describeDifferences(differences, showDifferences);
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
      className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-2 border-b border-border py-2"
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
          density={density}
        >
          <ToggleGroupItem value="toggle">Toggle</ToggleGroupItem>
          <ToggleGroupItem value="swipe">Swipe</ToggleGroupItem>
          <ToggleGroupItem value="side-by-side">Side by side</ToggleGroupItem>
        </ToggleGroup>
      </ToolbarSection>
      {mode === "toggle" && (
        <ToolbarSection title="Shown image" titleId={`${id}-side`}>
          <ToggleGroup
            aria-labelledby={`${id}-side`}
            aria-keyshortcuts="B A"
            required
            value={[side]}
            onValueChange={(value) => onSideChange(value[0] === "before" ? "before" : "after")}
            variant="outline"
            size="sm"
            spacing={0}
            density={density}
          >
            <ToggleGroupItem value="before">{beforeLabel}</ToggleGroupItem>
            <ToggleGroupItem value="after">{afterLabel}</ToggleGroupItem>
          </ToggleGroup>
        </ToolbarSection>
      )}
      {mode === "side-by-side" && (
        <ToolbarSection title="Orientation" titleId={`${id}-orientation`}>
          <ToggleGroup
            aria-labelledby={`${id}-orientation`}
            required
            value={[orientation]}
            onValueChange={(value) => onOrientationChange(value[0] === "vertical" ? "vertical" : "horizontal")}
            variant="outline"
            size="sm"
            spacing={0}
            density={density}
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
      )}
      <ToolbarSection title="Zoom" titleId={`${id}-zoom`}>
        <ImageZoomToggle zoom={zoom} onZoomChange={onZoomChange} density={density} />
      </ToolbarSection>
      {mode === "toggle" && (
        <Button
          variant="outline"
          size="sm"
          density={density}
          className="shrink-0 touch-none"
          onPointerDown={(event) => {
            if (event.button === 0) onPeekChange(true);
          }}
          onPointerUp={releasePeek}
          onPointerLeave={releasePeek}
          onPointerCancel={releasePeek}
          onKeyDown={(event) => {
            if (isPeekKey(event)) onPeekChange(true);
          }}
          onKeyUp={(event) => {
            if (isPeekKey(event)) releasePeek();
          }}
          onBlur={releasePeek}
          onContextMenu={(event) => event.preventDefault()}
        >
          {`Hold to show ${side === "before" ? "after" : "before"}`}
        </Button>
      )}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Switch
            id={`${id}-differences`}
            aria-describedby={`${id}-differences-status`}
            checked={showDifferences && !isUnavailable}
            disabled={isUnavailable}
            onCheckedChange={onShowDifferencesChange}
          />
          <label
            htmlFor={`${id}-differences`}
            className="cursor-pointer text-sm leading-none font-medium whitespace-nowrap select-none"
          >
            Highlight differences
          </label>
        </div>
        {showDifferences && differences.status === "ready" && (
          <span
            data-slot="image-comparison-legend"
            className="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="mx-[3px] size-2.5 shrink-0 rounded-xs bg-warning/10 ring-1 ring-background outline-2 outline-offset-1 outline-warning"
            />
            Changed region
          </span>
        )}
        {hasStepper && (
          <div
            role="group"
            aria-label="Changed regions"
            data-slot="image-comparison-stepper"
            className="flex flex-wrap items-center gap-1.5"
          >
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <span
              data-slot="image-comparison-change-count"
              className="text-xs whitespace-nowrap text-muted-foreground tabular-nums"
            >
              Change {activeRegionIndex + 1} of {regionCount}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              density={density}
              aria-label="Previous change"
              aria-keyshortcuts="Shift+N"
              onClick={() => onStepChange(-1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              density={density}
              aria-label="Next change"
              aria-keyshortcuts="N"
              onClick={() => onStepChange(1)}
            >
              <ChevronRightIcon />
            </Button>
            {onCommentActiveDifference && (
              <Button
                variant="outline"
                size="sm"
                density={density}
                aria-label={`Comment on change ${activeRegionIndex + 1} of ${regionCount}`}
                onClick={onCommentActiveDifference}
              >
                Comment on change
              </Button>
            )}
          </div>
        )}
        <p
          id={`${id}-differences-status`}
          role="status"
          className={hasStepper || !statusText ? "sr-only" : "text-xs text-muted-foreground"}
        >
          {statusText}
        </p>
      </div>
      {toolbar && (
        <div
          data-slot="image-comparison-toolbar-extra"
          className="flex min-w-0 flex-wrap items-center gap-2 @2xl:border-s @2xl:border-border @2xl:ps-2"
        >
          {toolbar}
        </div>
      )}
      {sizeMismatch && (
        <p data-slot="image-comparison-size-mismatch" className="w-full text-xs text-muted-foreground">
          {sizeMismatch}
        </p>
      )}
    </div>
  );
}
