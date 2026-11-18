/** Where a cursor move goes, in displayed order. */
export type DataGridCursorMove = "previous" | "next" | "first" | "last" | "previous-page" | "next-page";

/**
 * What a cursor move does to the selection: `follow` carries a selection of at most one row along with the cursor, as
 * Finder's arrows do, and leaves a larger selection alone; `keep` moves the cursor only; `extend` selects from the
 * anchor to the cursor.
 */
export type DataGridCursorSelection = "follow" | "keep" | "extend";

/** How a selection change was made, so consumers can tell explicit picks from one that follows the cursor. */
export type DataGridSelectionGesture =
  | "select"
  | "toggle"
  | "range"
  | "add-range"
  | "follow"
  | "extend"
  | "all"
  | "clear";

/** One gesture's whole new selection and range anchor. */
export interface IDataGridSelectionChange {
  rowIds: string[];
  anchorRowId?: string;
  gesture: DataGridSelectionGesture;
}

export type DataGridSelectionChangeHandler = (change: IDataGridSelectionChange) => void;
export type DataGridCursorChangeHandler = (rowId: string | undefined) => void;

/** Pointer modifiers: Shift selects a range; Mod (⌘ or Ctrl) toggles a row, or adds a range with Shift. */
export interface IDataGridPointerModifiers {
  shift: boolean;
  mod: boolean;
}

export interface IDataGridRowCursorOptions {
  /**
   * Receives every gesture's new selection and anchor instead of the table's own row selection, for consumers that
   * keep the selection elsewhere. Pair it with `anchorRowId`.
   */
  onSelectionChange?: DataGridSelectionChangeHandler;
  /** The range anchor of a selection the consumer owns. */
  anchorRowId?: string;
  /** Reports the row under the cursor whenever it changes. */
  onCursorChange?: DataGridCursorChangeHandler;
  /**
   * Whether rows handle the built-in keys: ↑/↓, Home/End and PageUp/PageDown move the cursor (Mod keeps the selection,
   * Shift extends it), Shift+Space toggles the cursor row and Mod+A selects every matching row. Turn it off when an
   * app keymap runs the same actions through the cursor's methods.
   */
  keyboard?: boolean;
}

/** What a virtualized grid gives its cursor: displayed rows, page size and a way to show and focus a row. */
export interface IDataGridRowNavigation {
  rowIds: () => string[];
  pageSize: () => number;
  reveal: (rowId: string, focus: boolean) => void;
}

export interface IDataGridRevealOptions {
  focus?: boolean;
}

/** A grid's row cursor and selection gestures (`useDataGridRowCursor`), passed to `VirtualDataGrid`'s `rowCursor`. */
export interface IDataGridRowCursor {
  /** The row under the cursor, which takes the grid's one tab stop. */
  cursorRowId: string | undefined;
  anchorRowId: string | undefined;
  keyboard: boolean;
  move: (move: DataGridCursorMove, selection?: DataGridCursorSelection) => void;
  /** Toggles the cursor row and moves the anchor to it. */
  toggle: () => void;
  /** Selects every row the filters leave, keeping picks they hide. */
  selectAll: () => void;
  clear: () => void;
  /** A click on a row, with its modifiers. */
  pointer: (rowId: string, modifiers: IDataGridPointerModifiers) => void;
  /** Puts the cursor on a row without moving focus or scrolling, as focusing the row does. */
  setCursor: (rowId: string | undefined) => void;
  /** Scrolls the cursor row into view, and focuses it unless told not to, such as after a sort moves it. */
  reveal: (options?: IDataGridRevealOptions) => void;
  /** Connects the grid that renders the rows; `VirtualDataGrid` calls it. */
  attach: (navigation: IDataGridRowNavigation | null) => void;
}
