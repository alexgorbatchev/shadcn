"use client";
import type { IAnalyticsProps } from "../analytics/types.js";
import { useAnalyticsCallback } from "../hooks/useAnalyticsCallback.js";
import type { IDensityProps } from "../density/types.js";
import { useId, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode, type RefObject } from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { CheckIcon } from "lucide-react";
import { cn } from "../utils/cn.js";
import { Badge } from "./Badge.js";
import { Button } from "./Button.js";

/**
 * How a group places its cards: `stack` (the default) puts one card per row; `row` puts cards side by side in equal
 * columns at least 14rem wide, as many as the group's width fits, so options with images can be compared at a glance.
 */
type OptionCardGroupLayout = "stack" | "row";

interface IOptionCardGroupLayoutProps {
  layout?: OptionCardGroupLayout;
}

type OptionCardGroupProps = IAnalyticsProps & RadioGroupPrimitive.Props & IDensityProps & IOptionCardGroupLayoutProps;

function getGroupClass(layout: OptionCardGroupLayout): string {
  return layout === "row"
    ? "flex w-full flex-wrap gap-2 [&>[data-slot=option-card-item]:not([data-span=full])]:min-w-[min(100%,14rem)] [&>[data-slot=option-card-item]:not([data-span=full])]:flex-1 [&>[data-slot=option-card-item][data-span=full]]:basis-full"
    : "grid w-full gap-2";
}

/**
 * A single-choice group of option cards. Each card is a radio: arrow keys move the selection between cards, Space
 * selects the focused card, and `name`, `required` and `form` take part in native form submission and validation.
 */
function OptionCardGroup({
  analytics,
  density,
  layout = "stack",
  className,
  ...props
}: OptionCardGroupProps): ReactElement {
  const trackedOnValueChange = useAnalyticsCallback(
    "OptionCardGroup",
    analytics,
    { name: "ui.change-request" },
    props.onValueChange,
  );

  return (
    <RadioGroupPrimitive
      data-density={density}
      data-slot="option-card-group"
      data-layout={layout}
      className={(state) => cn(getGroupClass(layout), typeof className === "function" ? className(state) : className)}
      {...props}
      onValueChange={trackedOnValueChange}
    />
  );
}

type OptionCheckboxGroupProps = IAnalyticsProps &
  CheckboxGroupPrimitive.Props &
  IDensityProps &
  IOptionCardGroupLayoutProps;

/**
 * A multiple-choice group of option cards, laid out like `OptionCardGroup`. Each card is a checkbox: Tab moves between
 * cards and Space toggles the focused one. `value` lists the checked cards' values.
 */
function OptionCheckboxGroup({
  analytics,
  density,
  layout = "stack",
  className,
  ...props
}: OptionCheckboxGroupProps): ReactElement {
  const trackedOnValueChange = useAnalyticsCallback(
    "OptionCheckboxGroup",
    analytics,
    { name: "ui.change-request" },
    props.onValueChange,
  );

  return (
    <CheckboxGroupPrimitive
      data-density={density}
      data-slot="option-checkbox-group"
      data-layout={layout}
      className={(state) => cn(getGroupClass(layout), typeof className === "function" ? className(state) : className)}
      {...props}
      onValueChange={trackedOnValueChange}
    />
  );
}

interface IOptionCardContentProps {
  /** The option's name, shown in bold and used as its accessible name. */
  label: ReactNode;
  /** A short explanation shown below the label, such as the option's trade-off. */
  description?: ReactNode;
  /**
   * Folds the description after this many lines, with a More button that shows the rest for good: once unfolded, the
   * description stays open and the button goes away. The button sits inside the card's border but outside the card's
   * control, so pressing it never changes the choice.
   */
  descriptionLines?: number;
  /** Marks the option the author recommends with a tag after its label and a tinted border. */
  recommended?: boolean;
  /** Text of the recommended tag. */
  recommendedLabel?: ReactNode;
  /** Why the author recommends this option, shown after its description under a "Why" label. */
  reason?: ReactNode;
  /** A picture of the option shown above its label, such as a screenshot of a design choice. */
  image?: ReactNode;
  /**
   * An optional short identifier beside the card's radio mark or checkbox. Cards carry no letter by default: the mark
   * leads the card, and readers took letters for numbering written by the author.
   */
  marker?: ReactNode;
}

interface IOptionCardSpanProps {
  /**
   * How many columns the card occupies in a `layout="row"` group: `auto` (the default) takes one column; `full`
   * spans the entire row, for a trailing text-only option such as "Something else" below image cards.
   */
  span?: "auto" | "full";
}

// A recommended card keeps the plain frame: only the checked card has a coloured frame, so a recommendation never
// reads as the selection. Its Recommended tag says it.
const CARD_CLASS =
  "group/option-card grid h-full w-full cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] content-start items-start gap-x-2 rounded-md border border-input bg-card p-panel-sm text-start text-sm text-card-foreground transition-colors outline-none hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid data-checked:border-primary data-checked:ring-1 data-checked:ring-primary forced-colors:data-checked:border-[color:Highlight] aria-invalid:not-data-checked:border-destructive data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-card data-readonly:cursor-default data-folding:pb-10";

const CARD_CONTROL_SELECTOR = '[data-slot="option-card"], [data-slot="option-checkbox-card"]';

interface IFold {
  ref: RefObject<HTMLSpanElement | null>;
  /** The folded height in pixels: whole lines of the description's own text. */
  height?: number;
  /** The description is folded and taller than its fold, so the More button shows. */
  isFoldable: boolean;
  isOpen: boolean;
  open: VoidFunction;
}

/** Measures whether a folded description hides text, and holds whether the person opened it; it never folds again. */
function useFold(lines: number | undefined): IFold {
  const ref = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState<number>();
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || lines === undefined || isOpen) return;
    const measure = () => {
      setHeight(lines * getLineHeight(element));
      setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [lines, isOpen]);
  return {
    ref,
    height,
    isFoldable: lines !== undefined && isOverflowing && !isOpen,
    isOpen,
    open: () => setIsOpen(true),
  };
}

/**
 * The line height of the first line of text inside `element`. Prose nested in a description, such as rendered
 * Markdown, can set its own size and leading, so folding by the card's line height would cut through a line.
 */
function getLineHeight(element: HTMLElement): number {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT, (node) =>
    node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
  );
  const text = walker.nextNode()?.parentElement ?? element;
  const style = getComputedStyle(text);
  const lineHeight = Number.parseFloat(style.lineHeight);
  return Number.isFinite(lineHeight) ? lineHeight : Number.parseFloat(style.fontSize) * 1.2;
}

interface IOptionCardIds {
  label: string;
  tag: string;
  description: string;
}

function getDescribedBy(ids: IOptionCardIds, props: IOptionCardContentProps): string | undefined {
  return props.description === undefined && props.reason === undefined ? undefined : ids.description;
}

interface IOptionCardContentRenderProps extends IOptionCardContentProps {
  ids: IOptionCardIds;
  fold: IFold;
}

function OptionCardContent({
  ids,
  fold,
  marker,
  label,
  description,
  descriptionLines,
  recommended = false,
  recommendedLabel = "Recommended",
  reason,
  image,
}: IOptionCardContentRenderProps): ReactElement {
  const isFolded = descriptionLines !== undefined && !fold.isOpen;
  return (
    <>
      {image !== undefined && (
        <span
          data-slot="option-card-image"
          className="col-span-full mb-2 block overflow-hidden rounded-sm border border-border"
        >
          {image}
        </span>
      )}
      <span
        data-slot="option-card-marker"
        aria-hidden="true"
        className="font-mono leading-5 text-muted-foreground group-data-checked/option-card:text-primary forced-colors:group-data-checked/option-card:text-[color:Highlight]"
      >
        {marker}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span id={ids.label} data-slot="option-card-label" className="leading-5 font-semibold wrap-break-word">
            {label}
          </span>
          {recommended && (
            <Badge id={ids.tag} data-slot="option-card-recommended" variant="success" className="uppercase">
              {recommendedLabel}
            </Badge>
          )}
        </span>
        {(description !== undefined || reason !== undefined) && (
          <span
            id={ids.description}
            ref={fold.ref}
            data-slot="option-card-description"
            data-folded={isFolded || undefined}
            className="flex flex-col gap-1 text-muted-foreground wrap-break-word data-folded:overflow-hidden"
            style={
              isFolded
                ? { maxHeight: fold.height === undefined ? `calc(${descriptionLines} * 1lh)` : fold.height }
                : undefined
            }
          >
            {description !== undefined && <span className="block">{description}</span>}
            {reason !== undefined && (
              <span data-slot="option-card-reason" className="flow-root">
                <span className="float-start me-1 font-semibold">Why:</span>
                {reason}
              </span>
            )}
          </span>
        )}
      </span>
    </>
  );
}

/**
 * The More button of a folded description, placed inside the card's border but outside its control. Pressing it
 * unfolds the description for good and removes the button, so focus moves to the card's own control.
 */
interface IFoldToggleProps {
  fold: IFold;
  descriptionId: string;
}

function FoldToggle({ fold, descriptionId }: IFoldToggleProps): ReactElement | null {
  if (!fold.isFoldable) return null;
  return (
    // A bordered control, so More reads as one rather than as a word of the text it unfolds.
    <Button
      type="button"
      variant="outline"
      size="xs"
      data-slot="option-card-fold"
      aria-expanded={false}
      aria-controls={descriptionId}
      className="absolute end-3 bottom-1.5"
      onClick={() => {
        fold.ref.current?.closest<HTMLElement>(CARD_CONTROL_SELECTOR)?.focus();
        fold.open();
      }}
    >
      More
    </Button>
  );
}

function useOptionCardIds(): IOptionCardIds {
  const id = useId();
  return { label: `${id}-label`, tag: `${id}-recommended`, description: `${id}-description` };
}

type OptionCardProps = Omit<RadioPrimitive.Root.Props, "children"> &
  IDensityProps &
  IOptionCardContentProps &
  IOptionCardSpanProps;

/**
 * One option of an `OptionCardGroup`: a bordered card with a leading radio mark and letter, a bold label and a muted
 * description. The radio mark shows the choice by shape as well as colour, and sets single choice apart from an
 * `OptionCheckboxCard`'s checkbox.
 */
function OptionCard({
  label,
  description,
  descriptionLines,
  recommended = false,
  recommendedLabel,
  reason,
  image,
  marker,
  span = "auto",
  density,
  className,
  ...props
}: OptionCardProps): ReactElement {
  const ids = useOptionCardIds();
  const fold = useFold(descriptionLines);
  const radioMarker = (
    <span className="flex items-start gap-1.5">
      <span
        data-slot="option-card-radio"
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-input group-data-checked/option-card:border-primary"
      >
        <span className="hidden size-2 rounded-full bg-primary group-data-checked/option-card:block forced-colors:bg-[Highlight]" />
      </span>
      {marker}
    </span>
  );
  const content = {
    label,
    description,
    descriptionLines,
    recommended,
    recommendedLabel,
    reason,
    image,
    marker: radioMarker,
  };
  return (
    <div
      data-slot="option-card-item"
      data-span={span === "full" ? "full" : undefined}
      className={cn("relative min-w-0", span === "full" && "col-span-full")}
    >
      <RadioPrimitive.Root
        data-density={density}
        data-slot="option-card"
        data-recommended={recommended || undefined}
        data-folding={fold.isFoldable || undefined}
        aria-labelledby={recommended ? `${ids.label} ${ids.tag}` : ids.label}
        aria-describedby={getDescribedBy(ids, content)}
        className={(state) =>
          cn(
            CARD_CLASS,
            "grid-cols-[max-content_minmax(0,1fr)]",
            typeof className === "function" ? className(state) : className,
          )
        }
        {...props}
      >
        <OptionCardContent ids={ids} fold={fold} {...content} />
      </RadioPrimitive.Root>
      <FoldToggle fold={fold} descriptionId={ids.description} />
    </div>
  );
}

type OptionCheckboxCardProps = Omit<CheckboxPrimitive.Root.Props, "children"> &
  IDensityProps &
  IOptionCardContentProps &
  IOptionCardSpanProps;

/**
 * One option of an `OptionCheckboxGroup`: the same card as `OptionCard`, with a checkbox in the leading column so the
 * group reads as "choose any".
 */
function OptionCheckboxCard({
  label,
  description,
  descriptionLines,
  recommended = false,
  recommendedLabel,
  reason,
  image,
  span = "auto",
  density,
  className,
  ...props
}: OptionCheckboxCardProps): ReactElement {
  const ids = useOptionCardIds();
  const fold = useFold(descriptionLines);
  const marker = (
    <span
      data-slot="option-checkbox-indicator"
      className="mt-0.5 flex size-4 items-center justify-center rounded-sm border border-input group-data-checked/option-card:border-primary group-data-checked/option-card:bg-primary group-data-checked/option-card:text-primary-foreground [&>svg]:size-3.5"
    >
      <CheckIcon className="hidden group-data-checked/option-card:block" />
    </span>
  );
  const content = { label, description, descriptionLines, recommended, recommendedLabel, reason, image, marker };
  return (
    <div
      data-slot="option-card-item"
      data-span={span === "full" ? "full" : undefined}
      className={cn("relative min-w-0", span === "full" && "col-span-full")}
    >
      <CheckboxPrimitive.Root
        data-density={density}
        data-slot="option-checkbox-card"
        data-recommended={recommended || undefined}
        data-folding={fold.isFoldable || undefined}
        aria-labelledby={recommended ? `${ids.label} ${ids.tag}` : ids.label}
        aria-describedby={getDescribedBy(ids, content)}
        className={(state) => cn(CARD_CLASS, typeof className === "function" ? className(state) : className)}
        {...props}
      >
        <OptionCardContent ids={ids} fold={fold} {...content} />
      </CheckboxPrimitive.Root>
      <FoldToggle fold={fold} descriptionId={ids.description} />
    </div>
  );
}

export { OptionCardGroup, OptionCard, OptionCheckboxGroup, OptionCheckboxCard };
export type { OptionCardGroupProps, OptionCardProps, OptionCheckboxGroupProps, OptionCheckboxCardProps };
