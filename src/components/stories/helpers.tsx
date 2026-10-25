import { expect } from "storybook/test";
import type { CarouselApi, CarouselProps } from "../carousel/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../carousel/Carousel";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Card";
import { useEffect } from "react";
import { useId, useRef } from "react";
import { casual, strict } from "chrono-node/en";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../calendar/Calendar";
import { Field, FieldError, FieldGroup, FieldLabel } from "../Field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../InputGroup";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../Popover";
import { useState, type ComponentProps, type ReactElement } from "react";
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxValue,
  ComboboxChip,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxList,
  ComboboxItem,
} from "../Combobox";
import { useComboboxAnchor } from "../../hooks/useComboboxAnchor";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../AlertDialog";
import { Button } from "../Button";
import { cn } from "../../utils/cn";
import { fixture_avatarImage } from "./fixtures";
import { useDensity } from "../../hooks/useDensity";
import { useTheme } from "../../hooks/useTheme";
import type { IDensityProps } from "../../density/types";
import { useMediaQuery } from "usehooks-ts";
import { Input } from "../Input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../Dialog";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../Drawer";

import { fixture_technologies } from "./fixtures";

export function ResponsiveDrawerExample(): ReactElement {
  const id = useId();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isOpen, setIsOpen] = useState(false),
    [saved, setSaved] = useState("No changes saved");
  const form = (
    <form
      id={id + "-form"}
      className="p-panel"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved("Saved " + new FormData(event.currentTarget).get("name"));
        setIsOpen(false);
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={id}>Profile name</FieldLabel>
          <Input id={id} name="name" required />
        </Field>
      </FieldGroup>
    </form>
  );
  return (
    <div className="flex flex-col items-start gap-4">
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button variant="outline" />}>Edit responsive profile</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Responsive profile</DialogTitle>
              <DialogDescription>Edit your desktop profile.</DialogDescription>
            </DialogHeader>
            {form}
            <DialogFooter>
              <Button type="submit" form={id + "-form"}>
                Save profile
              </Button>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen} showSwipeHandle>
          <DrawerTrigger render={<Button variant="outline" />}>Edit responsive profile</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Responsive profile</DrawerTitle>
              <DrawerDescription>Edit your mobile profile.</DrawerDescription>
            </DrawerHeader>
            {form}
            <DrawerFooter>
              <Button type="submit" form={id + "-form"}>
                Save profile
              </Button>
              <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
      <output aria-label="Responsive saved profile">{saved}</output>
    </div>
  );
}

export function ThemeControlsExample(): ReactElement {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div className="flex flex-col gap-4">
      <p role="status">
        Preference: {theme}. Resolved palette: {resolvedTheme}.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setTheme("light")}>
          Light
        </Button>
        <Button variant="outline" onClick={() => setTheme("dark")}>
          Dark
        </Button>
        <Button variant="outline" onClick={() => setTheme("system")}>
          System
        </Button>
      </div>
    </div>
  );
}

type ComboboxMultipleExampleProps = ComponentProps<typeof Combobox<string, true>> & IDensityProps;

export function ComboboxMultipleExample({ density, ...props }: ComboboxMultipleExampleProps): ReactElement {
  const anchor = useComboboxAnchor();
  return (
    <Combobox items={fixture_technologies} multiple defaultValue={["Bun", "React"]} {...props}>
      <ComboboxChips ref={anchor} density={density}>
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map((value) => (
                <ComboboxChip key={value}>{value}</ComboboxChip>
              ))}
              <ComboboxChipsInput aria-label="Technologies" placeholder="Add technology" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No matches.</ComboboxEmpty>
        <ComboboxGroup>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
  );
}

export function DeleteConfirmationExample(props: ComponentProps<typeof AlertDialog>): ReactElement {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isOpen, setIsOpen] = useState(props.defaultOpen ?? false);
  return (
    <>
      <AlertDialog
        {...props}
        open={props.open ?? isOpen}
        onOpenChange={(open, details) => {
          props.onOpenChange?.(open, details);
          if (!details.isCanceled) setIsOpen(open);
        }}
      >
        <AlertDialogTrigger render={<Button variant="destructive" />}>Delete project</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>This demonstration only changes local story state.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsDeleted(true);
                setIsOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isDeleted && <p role="status">Project deleted.</p>}
    </>
  );
}

export function DensityValueExample({ density, label = "Density" }: IDensityProps & { label?: string }): ReactElement {
  return (
    <output role="status" aria-label={label}>
      {useDensity(density)}
    </output>
  );
}

export function TypesetDocumentExample(): ReactElement {
  return (
    <article className="typeset" aria-label="Rendered document">
      <h1>Readable responses</h1>
      <p>Semantic HTML follows the surrounding text size and palette.</p>
      <h2>Findings</h2>
      <p>
        Review the <a href="#typeset-notes">implementation notes</a> before continuing.
      </p>
      <h3>Details</h3>
      <p>
        <strong>Keep native semantics.</strong> Use <em>emphasis</em>, <mark>highlights</mark>,{" "}
        <del>superseded text</del>, <abbr title="Hypertext Markup Language">HTML</abbr>, H<sub>2</sub>O, and x
        <sup>2</sup>.
      </p>
      <h4>Checklist</h4>
      <ul>
        <li>
          Inspect the source
          <ul>
            <li>
              Check the contract
              <ul>
                <li>Verify the rendered result</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
      <ol type="a">
        <li>Read</li>
        <li>Validate</li>
      </ol>
      <ul className="contains-task-list">
        <li className="task-list-item">
          <input type="checkbox" aria-label="Review complete" defaultChecked />
          Review complete
        </li>
      </ul>
      <h5>Definitions</h5>
      <dl>
        <dt>Flow</dt>
        <dd>The space between rendered blocks.</dd>
      </dl>
      <h6>Supporting evidence</h6>
      <blockquote>
        <p>New content should preserve the earlier layout.</p>
      </blockquote>
      <p>
        Run <code>bun run build</code>, then press <kbd>Enter</kbd>.
      </p>
      <pre aria-label="Code sample">
        <code>{'const result = "verified";\nconsole.log(result);'}</code>
      </pre>
      <details>
        <summary>Show implementation notes</summary>
        <p id="typeset-notes">The document retains native disclosure and link behavior.</p>
      </details>
      <figure>
        <img src={fixture_avatarImage} alt="Illustrated reviewer" width="64" height="64" />
        <figcaption>Local image with a caption.</figcaption>
      </figure>
      <table aria-label="Review findings">
        <caption>Completed checks</caption>
        <thead>
          <tr>
            <th scope="col">Check</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Source</th>
            <td>Verified</td>
          </tr>
        </tbody>
      </table>
      <section data-footnotes aria-label="Footnotes">
        <p>Notes remain part of the document.</p>
      </section>
    </article>
  );
}

export function TypesetRhythmExample(): ReactElement {
  const [isRoomy, setIsRoomy] = useState(false);
  return (
    <div>
      <Button onClick={() => setIsRoomy(true)}>Roomy rhythm</Button>
      <article
        aria-label="Reading rhythm"
        className={cn("typeset", isRoomy && "[--typeset-size:1.5em] [--typeset-leading:2] [--typeset-flow:2em]")}
      >
        <h2>Reader preferences</h2>
        <p>The reader controls text size, line spacing, and block spacing.</p>
        <p>A second paragraph follows the same rhythm.</p>
        <p className="text-lg">An explicit utility overrides the prose default.</p>
      </article>
    </div>
  );
}

export function TypesetStreamingExample(): ReactElement {
  const [isAppended, setIsAppended] = useState(false);
  return (
    <div>
      <Button onClick={() => setIsAppended(true)}>Append response</Button>
      <article className="typeset" aria-label="Streaming response">
        <p>First completed block.</p>
        <p>Second completed block.</p>
        {isAppended && <p>Appended block.</p>}
        <table aria-label="Streaming findings">
          <thead>
            <tr>
              <th scope="col">Check</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Initial finding</td>
              <td>Verified</td>
            </tr>
            {isAppended && (
              <tr>
                <td>Appended finding</td>
                <td>Verified</td>
              </tr>
            )}
          </tbody>
        </table>
      </article>
    </div>
  );
}

function formatInputDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}
type DateInputPickerExampleProps = Omit<
  ComponentProps<typeof Calendar>,
  "mode" | "required" | "selected" | "onSelect"
> & { isNaturalLanguage?: boolean };
export function DateInputPickerExample({
  isNaturalLanguage = false,
  ...args
}: DateInputPickerExampleProps): ReactElement {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState<Date>();
  const [month, setMonth] = useState(args.defaultMonth);
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const isInvalid = value.trim().length > 0 && !date;
  return (
    <FieldGroup>
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={id}>{isNaturalLanguage ? "Schedule date" : "Subscription date"}</FieldLabel>
        <InputGroup density={args.density}>
          <InputGroupInput
            ref={inputRef}
            id={id}
            density={args.density}
            value={value}
            aria-invalid={isInvalid}
            aria-describedby={id + "-selected" + (isInvalid ? " " + id + "-error" : "")}
            placeholder={isNaturalLanguage ? "Tomorrow or next week" : "October 9, 2026"}
            onChange={(event) => {
              const text = event.target.value;
              const parsed =
                (isNaturalLanguage ? casual : strict).parseDate(text, args.today, { forwardDate: true }) ?? undefined;
              setValue(text);
              setDate(parsed);
              if (parsed) setMonth(parsed);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIsOpen(true);
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger
                id={id + "-picker"}
                render={
                  <InputGroupButton
                    aria-label={isNaturalLanguage ? "Select schedule date" : "Select subscription date"}
                    size="icon-xs"
                  />
                }
              >
                <CalendarIcon aria-hidden />
              </PopoverTrigger>
              <PopoverContent density={args.density} className="w-auto p-0" align="end" finalFocus={inputRef}>
                <PopoverTitle className="sr-only">Choose an appointment date</PopoverTitle>
                <Calendar
                  {...args}
                  mode="single"
                  selected={date}
                  month={month}
                  onMonthChange={setMonth}
                  autoFocus
                  onSelect={(selected) => {
                    setDate(selected);
                    setValue(selected ? formatInputDate(selected) : "");
                    if (selected) setMonth(selected);
                    setIsOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>
        {isInvalid && <FieldError id={id + "-error"}>Enter a valid date.</FieldError>}
      </Field>
      <output id={id + "-selected"} aria-label="Selected appointment">
        {date ? formatInputDate(date) : "No date"}
      </output>
    </FieldGroup>
  );
}

type CarouselGalleryExampleProps = CarouselProps & {
  hasWideSpacing?: boolean;
  isNavigationCancelled?: boolean;
  hasResponsiveSizes?: boolean;
};
export function CarouselGalleryExample({
  hasWideSpacing = false,
  isNavigationCancelled = false,
  hasResponsiveSizes = false,
  ...args
}: CarouselGalleryExampleProps): ReactElement {
  const [api, setApi] = useState<CarouselApi>();
  const [snap, setSnap] = useState(1);
  useEffect(() => {
    if (!api) return;
    const update = (): void => setSnap(api.selectedScrollSnap() + 1);
    update();
    api.on("select", update);
    return () => {
      api.off("select", update);
    };
  }, [api]);
  return (
    <div className="flex flex-col gap-panel p-12">
      <Carousel
        {...args}
        setApi={setApi}
        className={cn("w-64", hasResponsiveSizes && "lg:w-96")}
        aria-label="Gallery projects"
      >
        <CarouselContent className={hasWideSpacing ? "-ms-8" : undefined}>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselItem
              key={index}
              aria-label={`${index + 1} of 5`}
              className={cn("basis-1/2", hasWideSpacing && "ps-8", hasResponsiveSizes && "lg:basis-1/3")}
            >
              <Card aria-label={`Project ${index + 1}`}>
                <CardHeader>
                  <CardTitle>Project {index + 1}</CardTitle>
                  <CardDescription>Preview</CardDescription>
                </CardHeader>
                <CardContent>
                  <span>{index + 1}</span>
                </CardContent>
                <CardFooter>Available</CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext
          onClick={(event) => {
            if (isNavigationCancelled) event.preventDefault();
          }}
        />
      </Carousel>
      <output aria-label="Gallery snap">{snap}</output>
    </div>
  );
}

/** Records window error messages until the returned function is called, which stops recording and returns them. */
export function recordWindowErrors(): () => string[] {
  const messages: string[] = [];
  const record = (event: ErrorEvent): void => {
    messages.push(event.message);
  };
  window.addEventListener("error", record);
  return () => {
    window.removeEventListener("error", record);
    return messages;
  };
}

/** Waits two frames for deferred observer callbacks, then expects that no window errors were recorded. */
export async function expectNoWindowErrors(stop: () => string[]): Promise<void> {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await expect(stop()).toEqual([]);
}
