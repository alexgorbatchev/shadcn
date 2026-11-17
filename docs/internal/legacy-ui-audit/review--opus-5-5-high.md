# UI Review — claude-opus-5-5 (high)

## Methodology

The review was read-only: no source files were modified. All tooling and outputs live in `.tmp/ui-review-a/` (Bun + TypeScript + Playwright Chromium). Findings come from five passes. Each pass was narrower than the one before, and every reported defect was confirmed against the rendered DOM or the component source.

### 1. Build the catalog

- Built a static Storybook with `bun run build-storybook -- -o .tmp/ui-review-a/sb`. It contains 996 stories across 66 component families.
- Each script serves the build from `Bun.serve` on 127.0.0.1 with a random port. It loads each story in the isolated iframe: `iframe.html?id=shadcn-alexgorbatchev-components-<story>&viewMode=story&globals=theme:<theme>;density:<density>`.
- Story play functions run on load, so the captured state is the state after the play function ran, not the story's initial render.

### 2. Automated sweep of every story (`sweep.ts` → `out/results.json`)

- **Coverage:** 996 stories × 4 combinations (dark/light × comfortable/compact) = 3,984 page loads.
- **Setup:**
  - viewport 1024×768 at device scale factor 2, with reduced motion set to `reduce`;
  - a fresh page per story;
  - 6 concurrent workers.
- **Timing:** each check waited for `sb-show-main` or `sb-show-errordisplay`, then 700ms more.
- **Recorded per page:**
  - console errors and warnings, and uncaught page errors;
  - **layout heuristics:**
    - horizontal page overflow;
    - text clipped horizontally or vertically (`overflow: hidden/clip` with scroll size > client size);
    - ellipsis truncation;
    - a text range overflowing its element box by more than 2px;
    - in-flow flex/grid siblings overlapping by more than 2px;
  - a **style signature for every `data-slot` element:**
    - height, font size, line height and weight;
    - padding, radius, border and gap;
    - icon width;
    - `data-size` and `data-variant`;
  - an **animation audit:** every `animation-name` in use was compared with the `@keyframes` defined in the document, to find animations that reference missing keyframes.
- **Screenshots:** for dark-comfortable and light-compact, each story was clipped to its painted bounds ±16px. That gives 1,992 PNGs in `out/shots/`.

### 3. Aggregation (`analyze.ts`)

- `summary`: normalized error counts, issue counts by kind, and missing keyframes.
- `errors <regex>`: the stories that emit a given error.
- `issues [kind]`: layout issues, deduplicated across the four combinations.
- `slots <combo> [regex]`: the same slot, size and variant rendered with **different** signatures in different stories or families. This pass found most of the "same primitive, different look" findings.

### 4. Visual review of screenshots

- `sheets.ts` tiled the screenshots into 226 labelled contact sheets in `out/sheets/`, with 12 stories per sheet at 0.5 zoom, grouped by family and combination.
- Four reviewer subagents (`general-purpose`, groups A–D) each reviewed about 15 families in parallel, using the same checklist:
  - misalignment and uneven gaps;
  - inconsistent sizes between sibling variants;
  - low-contrast or clipped text;
  - touching elements and visual artifacts;
  - adjacent sections that are hard to tell apart;
  - same-role primitives that look different.
- The subagents also read the component source and could zoom into the full-resolution screenshots.
- I opened 22 images directly: 3 contact sheets plus individual screenshots and probe captures. I mostly used them to check reported findings, not to review the sheets in full myself.
- Most of the visual coverage therefore comes from the subagents' (R) reports.

### 5. Overlays and targeted probes

- **`surfaces.ts` + `surfaces-report.ts`:** play functions close overlays, so sweep screenshots mostly show triggers. To cover overlays:
  - 20 overlay and field targets were opened explicitly, by click, context-click, hover, or focus + ArrowDown. The targets were dialog, alert dialog, sheet, drawer, popover, tooltip, hover card, dropdown, context menu, menubar, select, combobox, command ×2, navigation menu, toast, sonner, native select, input and textarea.
  - Each target waited 2,500ms after mount and 1,500ms after opening.
  - Computed styles were recorded for each role: content, item, title, close and so on.
  - Each role was compared across families, in dark-comfortable and dark-compact.
- **`probe.ts`:** evaluates any DOM expression on one story, for any theme/density, with reduced motion `reduce` or `no-preference`, and can save a full-page screenshot. Every ✔ finding was confirmed this way: computed styles, client vs scroll sizes, `:focus-visible` matching after keyboard focus, and element rects.
- **Single-purpose probes:**
  - `disabled.ts` finds disabled controls whose computed style matches an enabled sibling of the same slot.
  - `fade.ts` and `fadeshot.ts` check scroll-fade masks at scroll start, middle and end, with and without reduced motion.
  - `crash.ts` reloads suspect stories in isolation to tell story-specific crashes from cross-story interference.

### Verification and grading

- Each finding is tied to the source that causes it, cited as `file:line`.
- I spot-checked the subagent claims. Claims that turned out wrong were corrected or dropped; one example is the visual-baseline claim under **Story hygiene**.
- Legend:
  - **✔** — I measured or probed this directly.
  - **(R)** — a reviewer subagent reported it from screenshots or source, and I did not independently measure it.

### Limits

- Screenshots were reviewed for only two of the four combinations: dark-comfortable and light-compact. Light-comfortable and dark-compact received only the automated sweep, plus the dark-compact overlay pass.
- Desktop viewport only (1024px); mobile widths were not reviewed.
- The sweep's 700ms wait can land in the middle of a play function. State-dependent findings were therefore re-checked with probes.
- Motion was reviewed with reduced motion, plus targeted `no-preference` probes. Full-motion animations were not recorded frame by frame.
- The `combobox--groups` overlay was never captured.
- Storybook Docs pages were not reviewed.

## Session token usage

The token counts below were summed from the session transcript and its four reviewer-subagent transcripts. Each API message was counted once, deduplicated by message id. All messages used model `claude-opus-5-5`.

| Scope         | API messages |   Input |   Cache write |     Cache read |      Output |          Total |
| ------------- | -----------: | ------: | ------------: | -------------: | ----------: | -------------: |
| Main session  |          189 |     384 |       678,671 |     16,772,405 |     119,874 |     17,571,334 |
| Subagents (4) |          256 |     512 |     1,002,200 |     19,099,960 |     123,493 |     20,226,165 |
| **All**       |      **445** | **896** | **1,680,871** | **35,872,365** | **243,367** | **37,797,499** |

Most of the total is cache reads. Tokens that were not cache reads total 1,925,134: input + cache write + output.

The total does not include the context-compaction summarization call, because that call is not recorded as an assistant message in the transcript.

## High

| #   | Issue                                                            | Evidence                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Compact form controls clip their text** ✔                      | **NativeSelect:**<br>• Compact: 20px tall, with clientHeight 18 and scrollHeight 21. "Node" loses its descenders.<br>• Comfortable fits: height 28, client 26, scroll 26.<br>• Cause: fixed `py-1` in `src/components/NativeSelect.tsx:29`.<br>**Input:**<br>• `input--file-upload` (light-compact): height 20, client 18, scroll 22.<br>• Cause: `py-1` in `src/components/Input.tsx:16`. |
| 2   | **Slider thumb never shows a keyboard focus ring** ✔             | • Focus lands on the hidden input inside the thumb.<br>• The thumb itself never matches `:focus-visible`, so `focus-visible:ring-1` never applies and box-shadow stays `none`.                                                                                                                                                                                                             |
| 3   | **Default Button focus is invisible** ✔                          | The fill, the focus border and the 1px ring are all rgb(255,92,214) (`src/components/Button.tsx:8-12`).                                                                                                                                                                                                                                                                                    |
| 4   | **Indeterminate Progress renders nothing** ✔                     | • `progress--indeterminate`: the indicator is 0px wide with no animation, although `data-indeterminate` is set.<br>• `src/components/Progress.tsx` has no styling for that state.                                                                                                                                                                                                          |
| 5   | **Chart tooltip spans the full viewport when `portal` is set** ✔ | • `chart--portal-density`: the tooltip wrapper is a child of body at [0,304,1024,48].<br>• Recharts stops positioning the tooltip when `portal` is set.<br>• `src/components/Chart.tsx:109` has `min-w-32` but no `w-fit`, so nothing limits its width.                                                                                                                                    |
| 6   | **Reduced motion breaks the leading-edge `scroll-fade-x`** ✔     | `src/theme.css:283-324`, used by `src/components/Attachment.tsx:171`.                                                                                                                                                                                                                                                                                                                      |
| 7   | **Disabled accordion triggers look enabled** ✔                   | The styles target `aria-disabled`, but Base UI sets `data-disabled`.                                                                                                                                                                                                                                                                                                                       |

## Medium — components

### Single-component defects

- **Checkbox (indeterminate):** shows a check mark. The indicator always renders `<CheckIcon />` (`src/components/Checkbox.tsx`). ✔ (source)
- **Combobox (RTL):** the popup is misaligned. ✔
  - In `combobox--density-and-direction` RTL, the input group spans x248–776 and the popup x268–803.
  - The same screenshot shows a separator with nothing after it, and the 3px ring.
- **Table:** sortable header text sits 11px off its column cells. ✔
  - Email header 324.1 vs cell 313.1; Amount 618.9 vs 607.9.
  - Source: `src/components/stories/Table.stories.tsx:136,146`.
- **Field (horizontal description):** stretches its checkbox to 320×16, from `*:w-full` at `src/components/Field.tsx:61`. ✔
- **Questionnaire (resume and reset):** "Reset draft" is 466px wide next to a 50px "Next", from the grid columns at `src/components/Questionnaire.tsx:222`. ✔
- **Carousel (vertical):** the Next button [411,262,26,26] overlaps the counter output [296,264,432,23]. Cause: `-bottom-10` at `src/components/Carousel.tsx:188`. ✔
- **Bubble `typeset`:** `overflow: hidden` clips the lower-alpha list markers ("a.", "b."). ✔
  - Sources: `src/components/Bubble.tsx:37,78` and typeset.css lines 184/188.
- **Sidebar:** ✔
  - **Icon-collapsed:** label text leaks, because only `[&>span]` is hidden. Group labels overflow.
  - **`sidebar--loading`:** has a raw-text "Loading projects" header (`Sidebar.stories.tsx:564-587`).
  - **Non-collapsible:** squeezed from 256 to about 160px.
  - **Desktop:** the gap spacer leaves a dead zone of about 200px.
  - **Padding:** the group label uses `px-2` while the menu button uses `px-control-x`.
  - **Layout `SidebarInput`:** has no placeholder.

### Cross-component inconsistencies

- **Density is applied unevenly.** ✔
  - **Accordion** ignores density: 39.1px tall in both modes.
  - **Also unchanged by density:** Attachment sm/xs, Avatar, Spinner, menu/select items (25.1/22.7), popover/tooltip padding, and icons (16px everywhere).
  - **Inconsistent where it is applied:**
    - Command items shrink with density.
    - The compact Menubar trigger is 16px tall.
    - The compact Select trigger keeps 10px left padding.
- **Overlays use different radii and typography.** ✔
  - **Radius:**
    - 4px: dialog, popover, tooltip, dropdown, select, drawer, sonner.
    - 2px: hover-card, context-menu, menubar, nav-menu. Their 4px items sit inside 2px containers.
    - 0: Command items.
  - **Group labels:** menubar 12/17, dropdown/context 11/500, select 11/400. "Alternative runtimes" wraps in the 144px select popup.
  - **Title line-height:** dialog 14 (`leading-none`); alert, sheet and drawer 21; popover, toast and sonner 12/17.
  - **Content size:** `dialog-content` is 12px; `alert-dialog-content` is 14/21.
  - **Context menu:** about 150px wide vs 224px for the other menus. "New file" nearly touches "Ctrl+N".
  - **Shortcuts:**
    - Menu shortcuts use `tracking-widest`: `Menubar.tsx:245`, `DropdownMenu.tsx:288`, `ContextMenu.tsx:269`. `Command.tsx:140` does not.
    - The Command shortcut changes to the foreground colour on highlight; menu shortcuts stay muted.
- **Sonner and Toast look different.** ✔
  - Sonner's unlayered CSS overrides the layered `font-mono` utility, so Sonner renders sans-serif (`src/components/Sonner.tsx:27-38`).
  - The two also differ in close-button colour, width (356 vs 382) and inset.
- **Focus rings and field fills differ.** ✔
  - InputGroup uses `ring-3` (`src/components/InputGroup.tsx:20`), which carries into Command and Combobox. Everything else uses `ring-1`.
  - Input, NativeSelect and Textarea use `bg-secondary`. The Select trigger and Combobox are transparent.
- **Disabled styles differ.** ✔
  - Button uses a dashed border; other controls use opacity.
  - The Slider thumb is dimmed twice. The thumb and its track container both apply `data-disabled:opacity-50`, giving 0.25.
- **Accordion:** the focus ring sits flush against the text. ✔
- **Palette:** ✔
  - `card` = `popover` = `background` and `muted` = `accent`, so nested surfaces are hard to tell apart.
- **Sizing:** (R)
  - The InputGroup addon is 29.14px tall inside a 28/20px group (`py-1.5`).
  - ButtonGroupText is 19.14px tall vs 28 (`ButtonGroup.tsx:50`).
  - The vertical ButtonGroup separator is 0px tall (`ButtonGroup.tsx:69`).
  - The icon Toggle is not square, 36×28 (`Toggle.tsx:17`). The outline Toggle is 2px wider (`Toggle.tsx:12-13`).
  - Button `xs` is wider than `sm` in compact, 102 vs 98 (`Button.tsx:27`).
  - Button `icon-sm` draws a 16px icon (`Button.tsx:33`).
  - Switch uses a fractional `h-[18.4px]` (`Switch.tsx:18`).
  - Item `sm` is the same size as `default` (`Item.tsx:51-52`).
- **Invalid state:** invalid controls keep a persistent 3px red ring next to the 1px focus rings. (R)
  - Affected: Switch, Checkbox, RadioGroup, Input, Textarea, Select, NativeSelect, Combobox, Questionnaire.
- **InputOTP:** (R)
  - Slots have no dividers.
  - Placeholder contrast is about 1.9:1.
  - Dark-mode character contrast is 3.92:1.
- **Message `end`/RTL:** (R)
  - The header doesn't follow the alignment (`Message.tsx:69,85`).
  - The footer is inset (`Message.tsx:124`).
  - Start and end bubbles are the same colour.
- **Alert with action:** "Undo" is misaligned, and the end inset is 8 vs 16 (`Alert.tsx:72`). Alert uses `rounded-sm` while Card uses `rounded-md`. (R)
- **Chart:** in `portal-legend-direction` the legend is detached (`Chart.stories.tsx:518`). (R)
- **Date picker:** the trigger centres its text, where upstream uses `justify-start text-left`. (R)
- **Badge:** links get a double focus indicator, with no `outline-none` (`Badge.tsx:9`). (R)
- **Low:** (R)
  - Secondary button contrast is 1.12:1.
  - Toggle hover looks the same as pressed.
  - The resizable "Secondary" text touches the grip.
  - `scrollarea` keep-mounted has no padding.
  - Avatar RTL shows "3+" (`Avatar.tsx:101`).

## Story hygiene (catalog, not component contracts)

- **Stories end in the opposite of their named state.** ✔
  - `toggle--pressed` ends with `aria-pressed=false`.
  - `checkbox--checked` and `switch--checked` end with `aria-checked=false`.
  - In each case the `play` function clicks the control after it starts in the named state (`Toggle.stories.tsx:36-41`, `Checkbox.stories.tsx:47-52`).
  - The radio group `weekly` and `unselected` stories end on "Daily". (R)
  - One reviewer claimed visual baselines lock in these wrong states. That claim is **false**: only Input, Button, Badge and Card stories carry the `visual` tag (`.storybook/vitest.visual.config.ts:34`).
- **Debug output is visible in the catalog.**
  - ✔ Accordion Controlled shows `[]`.
  - ✔ Sidebar Toolbar shows JSON and three full-width buttons.
  - ✔ `empty--without-icon` shows a literal `0` (`Empty.stories.tsx:45`).
  - (R) Popover native-form shows `{"width":"240","height":"25"}` (`Popover.stories.tsx:304,327`).
  - (R) Menubar shows "Link copiedtrue200".
  - (R) DropdownMenu and ContextMenu print state values.
- **Siblings touch with no gap.** ✔
  - `.storybook/PreviewFrame.tsx:22` has no flex or gap, so controls and outputs touch in about 40 stories. Examples:
    - Sonner Variants buttons (`Sonner.stories.tsx:60-74`) and `sonner--default`.
    - Dialog controlled, `densityprovider--mixed` and `hovercard--controlled`.
    - Calendar time-zone and the questionnaire outputs.
    - Command (also `command--shortcuts`, where the status text touches the trigger).
    - `inputotp--form` (CardFooter gap 0), `bubble--typeset-streaming` and the `item--in-dropdown` output.
- **Unstyled native triggers** that don't use `render={<Button/>}`: Dialog and AlertDialog payload, native-callbacks and custom-focus-and-native-render stories, and questionnaire dialog-composition. (R)
- **Content errors:**
  - The Accordion RTL story uses English text, and RTL punctuation lands on the wrong side.
  - The `input--profile-form` Name field shows the email placeholder.
  - `breadcrumb--collapsed` mixes "/" and chevron separators.
  - The Alert destructive story says "Changes saved."
  - Item story args only reach the first item.
  - `popover--native-callbacks` has a blank `h-12` band.
- **Browser default focus outline** appears instead of a styled ring: breadcrumb links, the inputgroup link addon, and the empty with-search link. (R)

## Not defects / clean

- **Not defects:** sr-only items, avatar overlap and textarea overflow are false positives. There is no page-level horizontal overflow and no missing keyframes.
- **Clean or minor nits only:** marker, aspectratio, tooltip, navigationmenu, themeprovider, directionprovider, kbd, label, skeleton, spinner, textarea, persiancalendar, pagination, tabs, card, collapsible.

## DUE DILIGENCE

- **Interaction test failures (play functions):**
  - item avatar-group and RTL (avatar `img` role not found);
  - `messagescroller--interrupted-response`;
  - `sidebar--mobile-sheet` and `mobile-right-rtl`;
  - `sidebar--non-collapsible`.
- **Real warnings:** the calendar and date-picker time stories log HH:mm warnings.
- **Environment-only failures:** the clipboard errors in `inputgroup--with-action` and `table--data-table-row-actions` come from the headless browser denying clipboard access.
- **Test gaps:** interaction tests check ARIA rather than what is drawn. That is how the Slider and Button focus defects, indeterminate Progress and the stories that end in the wrong state all pass. Visual regression covers only four families.
- **Review limits:**
  - Only dark-comfortable and light-compact screenshots were reviewed visually.
  - Sweep screenshots were taken 700ms after mount, while some play functions were still running. State-dependent findings were re-checked with probes.
  - The `combobox--groups` overlay was never captured.
- **Decision needed:** whether to add gap and flex to `PreviewFrame`. It would fix about 40 stories but changes how every story looks.
- **Concurrent activity in this repo:**
  - A Codex app-server is running `bun run test:contrast` and `bun run test`.
  - Several `agent-browser` daemons are running with this repo as their working directory.
  - `.tmp/ui-review-2` belongs to someone else, and earlier `.tmp` was deleted from outside this session.
  - All of these were left untouched.
- **Cleanup:** the review tooling and screenshots remain in `.tmp/ui-review-a/`.
