import { createContext, use, useCallback, useId, useMemo, type ReactElement, type ReactNode } from "react";
import { Badge } from "../../index.js";
import { Label } from "../../index.js";
import { cn } from "../../utils/cn.js";

/**
 * How bound answer controls render:
 * - `edit`: ordinary controls.
 * - `locked`: controls stay in place but take no input, for example while the answers are being sent.
 * - `values`: each control renders its label and its value as text, for example on a read-only page.
 *
 * Reading controls (Tabs, Collapsible, Dialog, Drawer) work in every mode.
 */
export type JsonFormMode = "edit" | "locked" | "values";

interface IJsonFormContext {
  mode: JsonFormMode;
  errors: Readonly<Record<string, string>>;
  defaults: readonly string[];
  changed: readonly string[];
  hiddenLabels: readonly string[];
}

const JsonFormContext = createContext<IJsonFormContext | undefined>(undefined);

const noErrors: Readonly<Record<string, string>> = {};
const noDefaults: readonly string[] = [];
const noChanged: readonly string[] = [];
const noHiddenLabels: readonly string[] = [];

export interface IJsonFormProviderProps {
  mode?: JsonFormMode;
  /**
   * Field messages keyed by binding path, such as `{ "/answers/company": "Company: Enter a name" }`. While a provider is
   * present, the consumer owns every field message: the controls show these messages and never their own checks'
   * messages, so no message appears before the consumer decides to show it.
   */
  errors?: Readonly<Record<string, string>>;
  /**
   * Binding paths whose value is still the one the author set, such as `["/answers/oncall"]`. Each of those controls
   * shows a "Default" tag beside its label until its value changes, so a person can tell a value they chose from one
   * they never touched.
   */
  defaults?: readonly string[];
  /**
   * Binding paths whose value differs from the last submitted answer, such as `["/answers/headline"]`. Each of those
   * controls shows a "Changed" tag in its own label row, beside Required and Default.
   */
  changed?: readonly string[];
  /**
   * Binding paths whose label a surrounding heading already shows, such as `["/answers/goal"]` under a heading that asks
   * the same question. Each of those controls hides its label visually and keeps it as its accessible name; its tags
   * stay visible. Applies to controls whose label sits above them (Input, Textarea, Select, Radio, DropdownMenu,
   * ToggleGroup) and to read-only values; a Switch, Checkbox or Slider keeps the label beside it, which names the control.
   */
  hiddenLabels?: readonly string[];
  children?: ReactNode;
}

/**
 * Sets the mode, the field messages, the default-valued fields, the changed fields, and the fields with hidden labels of
 * the bound controls inside it.
 */
export function JsonFormProvider({
  mode = "edit",
  errors = noErrors,
  defaults = noDefaults,
  changed = noChanged,
  hiddenLabels = noHiddenLabels,
  children,
}: IJsonFormProviderProps): ReactElement {
  const value = useMemo(
    () => ({ mode, errors, defaults, changed, hiddenLabels }),
    [mode, errors, defaults, changed, hiddenLabels],
  );
  return <JsonFormContext value={value}>{children}</JsonFormContext>;
}

/** The nearest `JsonFormProvider`'s mode and messages, or `undefined` outside one. */
export function useJsonForm(): IJsonFormContext | undefined {
  return use(JsonFormContext);
}

type Reveal = () => void;

const JsonRevealContext = createContext<Reveal>(() => {});

export interface IJsonRevealScopeProps {
  /** Opens this container: selects its tab, expands its section or opens its dialog. */
  onReveal: () => void;
  children?: ReactNode;
}

/** Marks its children as hidden behind a container that `useJsonReveal` can open. Scopes nest. */
export function JsonRevealScope({ onReveal, children }: IJsonRevealScopeProps): ReactElement {
  const parent = use(JsonRevealContext);
  const reveal = useCallback(() => {
    parent();
    onReveal();
  }, [parent, onReveal]);
  return <JsonRevealContext value={reveal}>{children}</JsonRevealContext>;
}

/**
 * Returns a function that opens every container hiding the calling component, outermost first: the tab whose panel
 * holds it and each collapsed section around it. The containers render the change on the next frame, so focus or
 * scroll the target after it.
 */
export function useJsonReveal(): Reveal {
  return use(JsonRevealContext);
}

interface IValidationCheck {
  type: string;
}

export interface IJsonFieldOptions {
  /** The control's binding path; messages are keyed by it. */
  path?: string;
  label?: string | null;
  checks?: readonly IValidationCheck[] | null;
  /** The control's own validation messages, shown only outside a `JsonFormProvider`. */
  ownErrors?: readonly string[];
}

export interface IJsonField {
  /** The label without a trailing "*": the "Required" tag replaces it. */
  label: string;
  isRequired: boolean;
  /** The value is still the author's default (`JsonFormProvider`'s `defaults`); the label shows a "Default" tag. */
  isDefault: boolean;
  /** The value differs from the last submitted answer (`JsonFormProvider`'s `changed`); the label shows a "Changed" tag. */
  isChanged: boolean;
  /** A surrounding heading already shows the label (`JsonFormProvider`'s `hiddenLabels`); it is hidden visually. */
  isLabelHidden: boolean;
  error?: string;
  mode: JsonFormMode;
  messageId: string;
  /** ARIA state for the control: required, invalid and described by its message. */
  controlProps: {
    "aria-required"?: true;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
  };
}

/** Removes a trailing "*" an author typed to mark a required question. */
export function stripRequiredMark(label: string): string {
  return label.replace(/\s*\*+\s*$/, "");
}

/** A bound control's label, required state, message and mode, from its props and the nearest `JsonFormProvider`. */
export function useJsonField({ path, label, checks, ownErrors = [] }: IJsonFieldOptions): IJsonField {
  const form = useJsonForm();
  const messageId = useId();
  const isRequired = (checks ?? []).some((check) => check.type === "required");
  const error = form ? (path ? form.errors[path] : undefined) : ownErrors[0];
  return {
    label: stripRequiredMark(label ?? ""),
    isRequired,
    isDefault: !!path && !!form?.defaults.includes(path),
    isChanged: !!path && !!form?.changed.includes(path),
    isLabelHidden: !!path && !!form?.hiddenLabels.includes(path),
    error,
    mode: form?.mode ?? "edit",
    messageId,
    controlProps: {
      "aria-required": isRequired ? true : undefined,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? messageId : undefined,
    },
  };
}

export interface IJsonFieldLabelProps {
  field: IJsonField;
  id?: string;
  htmlFor?: string;
}

/**
 * The field's "Required", "Default", and "Changed" tags, in that order; nothing when none apply. "Required" and
 * "Changed" belong to editable forms, so read-only values omit them.
 */
export function JsonFieldTags({ field }: { field: IJsonField }): ReactElement | null {
  const isRequiredShown = field.isRequired && field.mode !== "values";
  const isChangedShown = field.isChanged && field.mode !== "values";
  if (!isRequiredShown && !field.isDefault && !isChangedShown) return null;
  return (
    <>
      {isRequiredShown && <Badge variant="outline">Required</Badge>}
      {field.isDefault && (
        <Badge variant="outline" data-slot="json-field-default">
          Default
        </Badge>
      )}
      {isChangedShown && (
        <Badge variant="outline" data-slot="json-field-changed">
          Changed
        </Badge>
      )}
    </>
  );
}

function hasTags(field: IJsonField): boolean {
  return (
    (field.isRequired && field.mode !== "values") || field.isDefault || (field.isChanged && field.mode !== "values")
  );
}

/**
 * The field's label followed by its "Required", "Default", and "Changed" tags. A hidden label stays in place for
 * assistive technology; with no tags to show, the whole row is hidden visually.
 */
export function JsonFieldLabel({ field, id, htmlFor }: IJsonFieldLabelProps): ReactElement | null {
  const isTagged = hasTags(field);
  if (!field.label && !isTagged) return null;
  return (
    <div
      data-slot="json-field-label"
      className={field.isLabelHidden && !isTagged ? "sr-only" : "flex min-w-0 flex-wrap items-center gap-2"}
    >
      {field.label && (
        <Label id={id} htmlFor={htmlFor} className={cn(field.isLabelHidden && "sr-only")}>
          {field.label}
        </Label>
      )}
      <JsonFieldTags field={field} />
    </div>
  );
}

/** What an answer control the author left empty shows instead of a value it would not send. */
export const NOT_SET_TEXT = "Not answered";

/** The field's message, referenced by the control's `aria-describedby`. */
export function JsonFieldMessage({ field }: { field: IJsonField }): ReactElement | null {
  if (!field.error) return null;
  return (
    <p id={field.messageId} data-slot="json-field-message" className="text-sm text-destructive">
      {field.error}
    </p>
  );
}

export interface IJsonFieldValueProps {
  field: IJsonField;
  /** The value as text; empty renders "No answer". */
  text: string;
  /** Hides the visible label when a surrounding heading already names this value; the group keeps its accessible name. */
  hideLabel?: boolean;
}

/** The field as read-only text: its label, then its value, grouped and named by the label. */
export function JsonFieldValue({
  field,
  text,
  hideLabel: isHideRequested = false,
}: IJsonFieldValueProps): ReactElement {
  const labelId = useId();
  const hideLabel = isHideRequested || field.isLabelHidden;
  return (
    <div
      role="group"
      aria-labelledby={!hideLabel && field.label ? labelId : undefined}
      aria-label={hideLabel && field.label ? field.label : undefined}
      data-slot="json-field-value"
      className="flex w-full min-w-0 flex-col gap-1"
    >
      {hideLabel ? (
        field.isDefault && (
          <div data-slot="json-field-label" className="flex min-w-0 flex-wrap items-center gap-2">
            <JsonFieldTags field={field} />
          </div>
        )
      ) : (
        <JsonFieldLabel field={field} id={labelId} />
      )}
      <p className={text ? "text-sm wrap-break-word whitespace-pre-wrap" : "text-sm text-muted-foreground"}>
        {text || "No answer"}
      </p>
    </div>
  );
}
