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

type OptionCardGroupProps = IAnalyticsProps & RadioGroupPrimitive.Props & IDensityProps;

const GROUP_CLASS = "grid w-full gap-2 [counter-reset:option-card]";

/**
 * A single-choice group of option cards. Each card is a radio: arrow keys move the selection between cards, Space
 * selects the focused card, and `name`, `required` and `form` take part in native form submission and validation.
 */
function OptionCardGroup({ analytics, density, className, ...props }: OptionCardGroupProps): ReactElement {
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
      className={(state) => cn(GROUP_CLASS, typeof className === "function" ? className(state) : className)}
      {...props}
      onValueChange={trackedOnValueChange}
    />
  );
}

type OptionCheckboxGroupProps = IAnalyticsProps & CheckboxGroupPrimitive.Props & IDensityProps;

/**
 * A multiple-choice group of option cards, laid out like `OptionCardGroup`. Each card is a checkbox: Tab moves between
 * cards and Space toggles the focused one. `value` lists the checked cards' values.
 */
function OptionCheckboxGroup({ analytics, density, className, ...props }: OptionCheckboxGroupProps): ReactElement {
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
      className={(state) => cn(GROUP_CLASS, typeof className === "function" ? className(state) : className)}
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
   * Folds the description after this many lines, with a More button that shows the rest. The button sits inside the
   * card's border but outside the card's control, so pressing it never changes the choice.
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
  /** Short identifier in the leading column; defaults to the card's letter in its group: a, b, c. */
  marker?: ReactNode;
}

const CARD_CLASS =
  "group/option-card grid w-full cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-2 rounded-md border border-input bg-card p-panel-sm text-start text-sm text-card-foreground transition-colors outline-none [counter-increment:option-card] hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid data-checked:border-primary data-checked:ring-1 data-checked:ring-primary forced-colors:data-checked:border-[color:Highlight] aria-invalid:not-data-checked:border-destructive data-recommended:not-data-checked:not-aria-invalid:border-success data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-card data-readonly:cursor-default data-folding:pb-10";

interface IFold {
  ref: RefObject<HTMLSpanElement | null>;
  /** The folded height in pixels: whole lines of the description's own text. */
  height?: number;
  /** The description is taller than its fold, or open, so the More or Less button shows. */
  isFoldable: boolean;
  isOpen: boolean;
  toggle: VoidFunction;
}

/** Measures whether a folded description hides text, and holds whether the person opened it. */
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
    isFoldable: lines !== undefined && (isOverflowing || isOpen),
    isOpen,
    toggle: () => setIsOpen((open) => !open),
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
      <span
        data-slot="option-card-marker"
        aria-hidden="true"
        className="font-mono leading-5 text-muted-foreground group-data-checked/option-card:text-primary forced-colors:group-data-checked/option-card:text-[color:Highlight]"
      >
        {marker ?? <span className="before:content-[counter(option-card,lower-alpha)]" />}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        {image !== undefined && (
          <span data-slot="option-card-image" className="mb-1 block overflow-hidden rounded-sm border border-border">
            {image}
          </span>
        )}
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
              <span data-slot="option-card-reason" className="flow-root text-card-foreground">
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

/** The More or Less button of a folded description, placed inside the card's border but outside its control. */
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
      aria-expanded={fold.isOpen}
      aria-controls={descriptionId}
      className="absolute end-3 bottom-1.5"
      onClick={fold.toggle}
    >
      {fold.isOpen ? "Less" : "More"}
    </Button>
  );
}

function useOptionCardIds(): IOptionCardIds {
  const id = useId();
  return { label: `${id}-label`, tag: `${id}-recommended`, description: `${id}-description` };
}

type OptionCardProps = Omit<RadioPrimitive.Root.Props, "children"> & IDensityProps & IOptionCardContentProps;

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
      {marker ?? <span className="before:content-[counter(option-card,lower-alpha)]" />}
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
    <div data-slot="option-card-item" className="relative min-w-0">
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
            "grid-cols-[minmax(2rem,max-content)_minmax(0,1fr)]",
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

type OptionCheckboxCardProps = Omit<CheckboxPrimitive.Root.Props, "children"> & IDensityProps & IOptionCardContentProps;

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
    <div data-slot="option-card-item" className="relative min-w-0">
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
