# Combined UI review — `@alexgorbatchev/shadcn`

Consolidated on 2026-10-14 from three independent reviews of the same codebase:

| Code   | Report                                                 | Method                                                                                                                                                                                                                                                 |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Ar** | [review--argon.md](./review--argon.md)                 | Read all source. Took Playwright measurements at 1280px in light/dark × comfortable/compact. Measured the `storybook-static` build already on disk, which the report says is stale. Ran no test suites.                                                |
| **As** | [review--astra-6-med.md](./review--astra-6-med.md)     | Read and hashed all 214 files. Captured 996 stories at 1280px (comfortable) and 320px (compact), plus opened states and Docs pages. Ran every interaction, reduced-motion, contrast, native and `just check` suite. Confirmed source bugs with probes. |
| **Op** | [review--opus-5-5-high.md](./review--opus-5-5-high.md) | Swept 996 stories × 4 combinations at 1024px and diffed slot style signatures. Four subagents reviewed contact sheets. Confirmed findings with probes (✔). Items marked (R) are subagent reports opus did not check itself.                            |

## How to read this document

- **No finding here was re-checked against source.** This file only merges and removes duplicates from what the three reports claim. Treat it as a work list, and verify each item before fixing it.
- **Severity** uses one scale across all three reports:
  - **High**: broken behavior, an accessibility failure, or a violation of a project contract.
  - **Medium**: a visible defect in a reusable component.
  - **Low**: a cosmetic issue or minor inconsistency.
- Problems that exist only in Storybook stories are listed separately. Fix those in the story, not in the component.
- **Confidence:**
  - **High**: reported by two or more reviewers, or reproduced with a probe, compiler run or test.
  - **Medium**: one reviewer measured it directly.
  - **Low**: an unverified (R) report, or a measurement taken only on argon's stale build.
- **Line references:** where reviewers disagree, this file uses astra's and opus's line numbers, which agree with each other. Argon's line numbers are consistently lower (for example NativeSelect `:17` vs `:29`, InputOTP `:41` vs `:44`, Combobox `:96` vs `:129`). Re-check any reference that only argon gives.
- Contradictions between reviewers are collected under [Conflicts to resolve](#conflicts-to-resolve). Do not act on those items until they are resolved.

## Summary

| Tier                                    | Count |
| --------------------------------------- | ----: |
| High                                    |    12 |
| Medium (component defects)              |    27 |
| Cross-component consistency (decisions) |    10 |
| Low                                     |    16 |
| Storybook examples and story hygiene    |    19 |
| Code hygiene                            |     7 |
| Test and CI gaps                        |     6 |
| Conflicts to resolve                    |     9 |

Findings that all three reviewers reported: Sonner rendering in a sans-serif font, InputOTP slots filled with the border token, sortable Table headers out of line with their columns, and the Combobox popup being wider than its trigger. All four are high confidence.

Progress markers: ✅ resolved and verified; ⏸ set aside.

## ✅ Dependency defects fixed in vendored forks

The deleted dependency patches had corrected the defects below; deleting them reintroduced each one. They are now fixed in forks consumed as git submodules (`vendor/shadcn-ui` on `alexgorbatchev/react-0.3.1`, `vendor/sonner` on `alexgorbatchev/sonner-2.0.8`), built by `scripts/buildVendor.ts`, resolved through `tsconfig.json` `paths` and bundled by `scripts/build.ts`. `input-otp` stays an ordinary dependency because H1 replaced its patch with wrapper state. Each fix was red before the fork change, green after it, and red again with only that change reverted. Each also has an upstream branch with the upstream project's own test, prepared but not yet published.

| Defect                                                                                                                                         | Fork fix                                                               | Regression story                                                                                         | Upstream branch                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Transform entrances shift MessageScroller anchors (throttled-CPU probes settled 1–13px off the peek offset; 40/40 settle exactly with the fix) | `geometry.ts` measures row tops and content bottom from layout offsets | `MessageScroller` `TranslatedAnchor`; `AnimatedNewTurn` asserts the peek offset right after the entrance | `fix/message-scroller-layout-anchor`     |
| Pointer text selection does not release live following                                                                                         | The viewport routes `pointerdown` through the user scroll intent       | `MessageScroller` `SelectionReleasesFollowing`                                                           | `fix/message-scroller-pointer-down`      |
| A caller `ref` on `MessageScroller` replaces the root registration, so the root loses `data-scrollable`                                        | The root composes the caller ref with its registration                 | `MessageScroller` `NativeRootRef`                                                                        | `fix/message-scroller-root-ref`          |
| Native reset leaves an emptied freeform `QuestionnaireInput` empty                                                                             | Reset restores the detached input's default value                      | `Questionnaire` `ResumeAndReset`                                                                         | `fix/questionnaire-reset-detached-input` |
| Open Sonner notifications keep their old height after a density change                                                                         | Toast heights are remeasured after every render                        | `Sonner` `DensityChange`, `DensityChangeExpanded`                                                        | `fix/remeasure-toast-height`             |

---

## High

**✅ H1. The InputOTP patch breaks the dependency's CommonJS entry.**

- Resolved: the patch is deleted. `InputOTP` now owns uncontrolled `defaultValue` state and passes input-otp a controlled `value`/`onChange`, so React no longer warns about both `value` and `defaultValue`. `bun run test:package` passes 10/10. With the wrapper change disabled, it fails 9/10 with that warning.
- Location: `patches/input-otp@1.5.0.patch`, first hunk.
- Cause: the CJS hunk inserts `defaultValue: initialDefaultValue` into an `Object.defineProperty` descriptor in the interop helper, not into the component's props, and never declares `initialDefaultValue`.
- Effect: `require("input-otp")` throws `ReferenceError: initialDefaultValue is not defined`. The ESM hunk is correct, and the browser bundle uses ESM.
- Fix: apply the same change to both module formats and exercise both entry points.
- Sources: As. Confidence: high (reproduced).

**✅ H2. Default `DialogContent` can extend past the viewport.**

- Resolved:
  - `DialogContent` and `AlertDialogContent` now sit inside Base UI's `Viewport`, using its documented outside-scroll pattern. The viewport is `fixed inset-0 grid place-items-center overflow-y-auto overscroll-contain p-4`, and the popup is `relative`.
  - Grid centring makes a tall popup start at the top and scroll, instead of overflowing upward. Short popups stay centred, at unchanged widths.
  - Outside presses still dismiss, because Base UI treats the viewport as part of the backdrop.
  - AlertDialog reproduced with long content.
  - `src/components/__tests__/Dialog.test.tsx` passes 3/3. With the fix disabled, the two long-content tests fail.
  - The Dialog, AlertDialog, Command, Attachment, Table, Questionnaire and Sheet stories pass 136/136.
- Location: `src/components/Dialog.tsx:71`.
- Cause: the content is fixed at the viewport centre with no `max-height` and no scroll container, while `body` is set to `overflow: hidden`.
- Effect: with 20 paragraphs, the panel is 744px tall in a 577px viewport. Its top sits at −83px, and the close button cannot be reached.
- AlertDialog uses the same pattern but was not reproduced.
- Sources: As. Confidence: high (probe).

**✅ H3. Keyboard focus on the default Button is invisible.**

- Resolved:
  - The box-shadow ring (`focus-visible:border-ring ring-1 ring-ring`) was replaced with a native outline: `focus-visible:outline-solid outline-1 outline-offset-1 outline-ring`. The destructive variant uses `outline-destructive`.
  - The 1px offset leaves a transparent gap between the indicator and any fill, so focus stays visible on a fill of the same colour. An outline also survives forced-colors mode, which drops box-shadow rings.
  - This is a base-level change: every Button variant, and every consumer of `buttonVariants` (Calendar days, Pagination, ButtonGroup, InputGroup buttons, Sonner actions), now shows the offset outline.
  - `src/components/__tests__/Button.test.tsx` compares screenshot scanlines for all 8 variants × 2 themes and passes 16/16. With the fix disabled, default light and dark fail.
  - The Button, ButtonGroup, Calendar, Pagination, InputGroup, Questionnaire, Sonner, Carousel and Dialog stories pass 191/191. Live screenshots of ButtonGroup and Calendar show the outline unclipped.
- Location: `src/components/Button.tsx:8-12`.
- Cause: the fill, the focus border and the 1px ring are all `rgb(255,92,214)` (`--primary`).
- Effect: focusing the button produces no visible change.
- Sources: Op ✔. Confidence: medium.

**✅ H4. The Slider thumb never shows a keyboard focus ring.**

- Resolved:
  - The thumb now uses `has-[:focus-visible]:outline-*`, the selector Base UI's Slider documentation uses, because focus lands on the thumb's nested input. The outline matches H3: 1px `--ring`, 1px offset.
  - The unreachable `focus-visible:ring-1 focus-visible:outline-hidden` were removed.
  - `src/components/__tests__/Slider.test.tsx` compares thumb screenshots before and after Tab in light and dark themes: 2/2 pass. With the fix disabled, both fail with 0 changed pixels while the input matches `:focus-visible`.
  - `@base-ui/react/slider` was added to the native Vitest `optimizeDeps`. Without it, a duplicate React instance loads.
  - The Slider and Field stories pass 41/41.
- Location: `src/components/Slider.tsx`.
- Cause: focus lands on the hidden input inside the thumb, so the thumb never matches `:focus-visible`.
- Effect: `focus-visible:ring-1` never applies.
- Sources: Op ✔. Confidence: medium.

**✅ H5. Disabled Accordion triggers look enabled.**

- Resolved:
  - The trigger now uses `data-disabled:pointer-events-none data-disabled:opacity-50`. Base UI's Accordion Trigger renders through `useButton({ native: true })`, which sets the native `disabled` attribute and `data-disabled` but never `aria-disabled`. Upstream base-nova has the same dead `aria-disabled:` classes.
  - The `DisabledItem` story now asserts that the enabled trigger renders at opacity 1 and the disabled one at 0.5. Both disabled stories now assert computed `pointer-events: none` instead of clicking. Before the fix, those clicks only worked because the disabled styles never applied, and testing-library refuses to click a `pointer-events: none` element.
  - The Accordion stories pass 16/16. With the fix disabled, Disabled fails with `pointer-events` "auto" and DisabledItem with opacity "1".
- Location: `src/components/Accordion.tsx`.
- Cause: the disabled styles target `aria-disabled`, but Base UI sets `data-disabled`.
- Sources: Op ✔. Confidence: medium.

**✅ H6. Indeterminate Progress shows nothing.**

- Resolved:
  - With `data-indeterminate` set, the indicator is now a 1/3-width segment that sweeps through the track using the new `animate-progress-indeterminate` theme token, whose keyframes are in `src/theme.css`.
  - The sweep direction comes from `--progress-indeterminate-direction`, which flips to -1 under `rtl:`. The segment starts at the inline-start edge, so a fixed `translateX` sweep would leave the track in RTL.
  - Under reduced motion, the indicator is a static full-width fill at 50% opacity with no animation, distinct from both an empty track and 100%. Measured in Storybook: `animation-name: none`, opacity 0.5, width equal to the track, 0 running animations.
  - `src/components/__tests__/Progress.test.tsx` samples one animation cycle in LTR and RTL. It requires movement (more than 10 distinct positions) and the indicator inside the track in more than 80% of frames: 2/2 pass. The `Progress.Indeterminate` story asserts a non-zero indicator width; the stories pass 7/7 normally and 7/7 under reduced motion.
  - Disable-checks:
    - With the component classes reverted, both native tests fail (1 distinct position) and the story fails (width 0).
    - With only the RTL variable removed, the RTL test fails: the indicator is visible in 0.51 of frames.
  - `@base-ui/react/progress` was added to the native Vitest `optimizeDeps`.
- Location: `src/components/Progress.tsx:54`.
- Cause: with `data-indeterminate` set, the indicator is 0px wide with `animation-name: none`, because there is no style for the indeterminate state.
- Effect: the bar looks like an empty, inactive track.
- Base UI documents `value={null}` and `data-indeterminate` for this state.
- Sources: As, Op ✔. Confidence: high.

**✅ H7. Compact form controls clip their text.**

- Resolved:
  - NativeSelect drops its fixed vertical padding (`py-1`, and `py-0.5` for `sm`), so the control height alone sets the box. Chromium centres the selected option's line box in the content box, which the Storybook screenshots confirm.
  - NativeSelect also gets `leading-tight`. Compact `sm` has a 16px content box, and the inherited 17.14px line box still overflowed it by 1px without padding (measured 16/17).
  - Input drops `py-1`. Text inputs centre their inner editor natively, and the file input's line box now fits.
  - Measured after the fix:
    - NativeSelect, compact `sm`: 16/16.
    - NativeSelect, comfortable default: 26/26.
    - Input file, compact: 18/18.
    - Input text, comfortable: 26/26.
  - The comfortable file input also clipped before the fix (26/28). The review did not report that; it is fixed too.
  - New native tests cover both densities: `src/components/__tests__/NativeSelect.test.tsx` (default and `sm`) and `src/components/__tests__/Input.test.tsx` (file and text). Each asserts `scrollHeight <= clientHeight`: 8/8 pass. Story tests for NativeSelect, Input, Table, InputGroup and Field pass 91/91.
  - Disable-check: with both components reverted, 4 tests fail: compact NativeSelect 21/18 and 19/16, file input 28/26 and 22/18.
  - `@base-ui/react/input` was added to the native Vitest `optimizeDeps`.
  - `SelectTrigger` is unchanged, because C4 established that it does not clip.
- NativeSelect at `src/components/NativeSelect.tsx:29`: `h-control` with `py-1` gives clientHeight 18 and scrollHeight 21 in compact density, so descenders are cut off. The Table page-size selector shows the same problem.
- Input at `src/components/Input.tsx:16`: in `input--file-upload` (light compact), clientHeight is 18 and scrollHeight 22.
- Related: argon reports that `SelectTrigger`'s fixed `py-2` leaves a 2px content box in compact density (`src/components/Select.tsx`).
- Sources: As, Op ✔, Ar (related). Confidence: high. See conflict C4.

**✅ H8. Reduced motion breaks the leading-edge `scroll-fade-x` mask.**

- Resolved:
  - Cause: the global reduced-motion rule forced `animation-duration: 0s`. The scroll fades are scroll-driven animations; Web Animations 2 converts a time duration on a progress-based timeline proportionally, so any non-zero duration fills the range, but 0 leaves a zero-length active interval. Local time at or past the range start is then the after phase, so the leading-edge `scroll-fade-reveal-s` (range `0 … reveal`) applied its full fade at scroll 0.
  - Measured before the fix at scroll 0: `--scroll-fade-s` was `calc(0% + min(12%, 40px))` (full fade) under reduce, `calc(0% + (0 * …))` without.
  - Fix: the global rule in `src/theme.css` now sets `animation-duration: 0.01ms`. Scroll-driven animations again span their range; time-based animations still finish imperceptibly fast. No per-utility override is needed.
  - Test: the `Attachment.ScrollableGroup` story resolves each fade size through a probe element after the scroll timeline updates, and asserts no start fade with an end fade at scroll 0, then the reverse at the end. It passes 20/20 in both the standard and reduced-motion configs.
  - Disable-check: with `0s` restored, the reduced-motion run fails with `expected 40 to be +0`.
  - Contract change: under reduced motion, computed `animation-duration` is now `1e-05s`, not `0s`. `HoverCard.CompactPortal` asserted exactly 0 and was updated. The full reduced-motion catalog then passes (982 tests; one `Table.stories.tsx` import failure from a Vitest port collision passed on rerun).
- Location: `src/theme.css:283-324`, used by `src/components/Attachment.tsx:171`.
- Sources: Op ✔. Confidence: medium.

**✅ H9. The Chart tooltip spans the full viewport when `portal` is set.**

- Resolved:
  - Verified in Recharts 3.8.0: `TooltipBoundingBox` sets `positionStyle = {}` when `hasPortalFromProps` (`es6/component/TooltipBoundingBox.js:68`). The portalled wrapper is therefore a static block, and the grid surface stretched to the body width.
  - Fix: `ChartTooltipContent` adds `w-fit`, so the surface sizes to its content (128px floor kept). In-chart tooltips are absolutely positioned and already shrink-to-fit, so they are unchanged.
  - Test: `Chart.PortalDensity` asserts the portalled tooltip is narrower than the body. Red before the fix (`expected 1200 to be less than 1200`); green after, 29/29 in both the standard and reduced-motion configs.
  - Positioning a portalled tooltip is still the consumer's job, per the Recharts `portal` contract; it renders in normal flow at the portal target.
- Location: `src/components/Chart.tsx:109`.
- Cause: Recharts stops positioning the tooltip once it is portalled, and the wrapper has `min-w-32` but no `w-fit`.
- Effect: in `chart--portal-density` the wrapper is a child of `body` with rect [0,304,1024,48].
- Sources: Op ✔. Confidence: medium.

**✅ H10. A popup's density override doesn't reach nested portals.**

- Resolved:
  - Audit: 17 popup surfaces set `data-density` but provided no `DensityContext`. The list: Popover, HoverCard, Dialog, AlertDialog, Sheet, Drawer, DropdownMenu (and sub), ContextMenu, Menubar (and sub), NavigationMenu (root and content), Select, Combobox, ToastViewport and Tooltip.
  - Fix: each content wrapper now wraps its portal in `<DensityContext.Provider value={resolvedDensity}>`, following the Sidebar idiom.
  - `NavigationMenu` wraps its Root, because content children live in the Root's React tree. `NavigationMenuContent` now resolves density and provides it too.
  - `ToastViewport` wraps its Viewport.
  - `DropdownMenuSubContent` used to pass only `data-density`, so its content re-resolved from context. It now forwards `density`.
  - `ContextMenuSubContent` and the Menubar contents already forward `density` and inherit the fix.
  - Test: `src/components/__tests__/NestedPortalDensity.test.tsx` renders each surface with `density="comfortable"` inside a compact provider. It nests a portalled Tooltip and compares the tooltip's computed `column-gap` (`--ag-control-gap`) with a comfortable reference, after a guard that the compact reference differs.
  - Red: 17/17 failed with `expected '4px' to be '6px'`. Green: 17/17. Full native suite: 16 files, 97 passed and 4 expected-fail.
  - Disable-check: with only the provider wrappers removed, 17/17 fail with the same assertion.
  - `@base-ui/react/combobox` was added to the native Vitest `optimizeDeps.include`.
  - Out of scope: non-popup components with a `density` prop (e.g. `Card density=…` containing a Popover) still set only `data-density` and don't provide context.
- Location: `src/components/Popover.tsx:32-49`, `src/components/Tooltip.tsx:37`, `src/hooks/useDensity.ts`.
- Cause: `PopoverContent density="comfortable"` sets the CSS density attribute but does not provide `DensityContext`.
- Effect: inside a compact provider, a nested Tooltip resolves to compact while the popover's buttons are comfortable.
- This breaks the AGENTS.md contract that "portal content must resolve density through context". Audit the other popup wrappers that set `data-density`.
- Sources: As. Confidence: high (probe).

**✅ H11. With `side="right"`, the Sidebar leaves its spacer on the left.**

- Resolved:
  - `side` is physical (the fixed panel uses `left-0`/`right-0`), but flex `order` follows the wrapper's inline direction. The spacer was DOM-first, so it sat at the row start: wrong for `side="right"` in LTR and for `side="left"` in an RTL document.
  - Fix: the desktop peer wrapper takes `ltr:data-[side=right]:order-last rtl:data-[side=left]:order-last`, so the spacer always shares the panel's physical edge. `SidebarInset` keeps `m-2` and drops only the panel-facing margin while expanded (`peer-data-[state=expanded]` with `peer-data-[side=left]:ml-0` or `peer-data-[side=right]:mr-0`).
  - Test harness: the global `PreviewFrame` centred every story in a `max-w-xl p-6` column while the panel is viewport-fixed, so even the left-side geometry was incoherent (left Inset expected 8, got 160). This is why the old RightSide test passed despite the bug. `PreviewFrame` now accepts a `previewFrame: "viewport"` story parameter, set only on the Sidebar meta. The S3 decision for all other stories is unchanged, and Sidebar is not in the visual-regression set.
  - Tests: `Inset` (left control), `RightSide`, `RightInset`, `RtlLeftInset` and `RtlRightInset` measure the main region against the far viewport edge and the panel's inner edge, expanded and collapsed. Red: the four new cases failed (`expected 256 to be +0`, `256 to be 8`, `264 to be 8`, `+0 to be 8`). Green: the Sidebar file passes 23/23.
  - Disable-check: with only the two class changes reverted, the same four fail with the same assertions, and the left control still passes.
  - Remaining upstream limitation: the inset margins use `peer-data-*`, so they apply only when `Sidebar` precedes `SidebarInset` in the DOM. Upstream base-nova `sidebar-15` renders the right sidebar after the inset with `collapsible="none"`, which gets no inset margins.
- Location: `src/components/Sidebar.tsx:184-205, 295`.
- Effect at 1280px: the spacer occupies x 0–256, the panel x 1024–1280, and the inset content x 256–1272, so content runs underneath the panel. The inset also keeps margin rules written for the left side.
- The RightSide story test never checks content geometry.
- Sources: As. Confidence: high (probe).

**✅ H12. NavigationMenu breaks two project motion contracts.**

- Resolved:
  - Directional slide: confirmed and fixed. Base UI 1.9.0 sets `data-activation-direction` (`left`/`right` for a horizontal menu) on `NavigationMenu.Content`, and its own Tailwind example uses the bracketed `data-[activation-direction=…]` form. The unbracketed classes are inherited unchanged from upstream shadcn base-nova (`navigation-menu.json`). `NavigationMenuContent` now uses the four bracketed variants, and the stray whitespace in that class string is collapsed.
  - Test: `src/components/__tests__/NavigationMenu.test.tsx` (native Chromium) samples each panel's computed `translate` per frame while the pointer moves between triggers. Moving right, the incoming panel must start at a positive offset and the outgoing one must leave at a negative offset; moving back must reverse both. The switch uses hover, because Playwright's click first hovers (which switches) and then toggles the newly active panel closed, clearing the direction. Red: `expected 0 to be greater than 0`. Green: 3/3 consecutive runs. Disable-check: restoring only the unbracketed classes fails with the same assertion.
  - Scale: the claim is stale. Neither the working tree nor HEAD has `scale-90` on the Popup (upstream base-nova does; this copy had already dropped it). No change.
  - Reduced motion: no class change needed. A Chromium probe of the Default story with `reducedMotion: "reduce"` read `transitionDuration: 0s` on the Positioner, Popup and Content (`0.35s` without the preference), via the global `prefers-reduced-motion` rule in `src/theme.css`. A panel switch jumps straight to its end state; the only off-zero frames are Base UI's single starting/ending-style frames, which also carry `opacity-0`.
- Directional slide classes compile to nothing:
  - `src/components/NavigationMenu.tsx:107` uses `data-activation-direction=left/right` without brackets.
  - With Tailwind 4.3.3, none of the four candidates emits a rule. The bracketed control `data-[activation-direction=left]` does emit one.
  - Sources: As. Confidence: high (compiler run).
- `NavigationMenuPopup` (`:115`) uses `data-[starting-style]:scale-90 data-[ending-style]:scale-90`. AGENTS.md says to avoid scale transitions. Sources: Ar.
- `NavigationMenuPositioner` and `NavigationMenuPopup` (`:101, :115`) run 0.35s transitions without `motion-reduce:transition-none`. Sources: Ar.
- Opus rated NavigationMenu "clean"; see conflict C6.

---

## Medium — component defects

**✅ M1. InputOTP slots use the border token as their fill.**

- Fix: slots use the field-frame fill `bg-secondary` (as Input, Select, InputGroup and Textarea do); placeholder characters use `text-faint-foreground`, the token Input/Textarea use for `placeholder:`.
- Verification: `src/components/__tests__/InputOTP.test.tsx` checks, in light and dark, that the slot border pixel differs from the composited fill, characters and placeholders reach 4.5:1 against the fill, and placeholders differ from characters. Reverted, both themes fail (border equals fill). InputOTP stories 18/18, contrast 72/72. `input-otp` added to the native Vitest `optimizeDeps` (it already was in the story config); without it the test loaded a second React.
- Note: the placeholder token change is a convention alignment; the old `text-muted-foreground` also passes on the new fill, so the test does not distinguish the two.
- Location: `src/components/InputOTP.tsx:44` (`border-input bg-input`).
- Effect:
  - Inactive slots blend into a solid bar; in dark compact, border and fill are both `rgb(111,119,131)`.
  - Placeholder characters are not muted (opus estimates about 1.9:1).
  - Dark-mode character contrast is 3.92:1. See conflict C7.
- Sources: Ar, As, Op. Confidence: high.

**✅ M2. Sonner renders in sans-serif instead of JetBrains Mono.**

- Location: `src/components/Sonner.tsx` (argon cites `:46`, astra `:33`, opus `:27-38`).
- Cause: Sonner injects an unlayered `<style>` that sets `[data-sonner-toaster] { font-family: ui-sans-serif, … }`. Unlayered styles beat `@layer utilities`, so `font-mono` loses.
- Fixed under D8: the Toaster receives the typed `style` prop with `fontFamily: "inherit"`, which beats the injected stylesheet without a patch. `Notifications.test.tsx` asserts the Sonner toast's computed font equals the body font, and fails with the D8 fix reverted.
- Sources: Ar, As, Op. Confidence: high.

**✅ M3. Indeterminate Checkbox shows the checked glyph.**

- Location: `src/components/Checkbox.tsx:26`, which renders `CheckIcon` unconditionally.
- `aria-checked="mixed"` is set correctly; only the visual is wrong.
- Fixed with Base UI's documented Checkbox Group pattern: `Checkbox.Indicator` `render={(props, state) => … state.indeterminate ? <MinusIcon /> : <CheckIcon />}`.
- Verified: `Checkbox.test.tsx` measures the glyph's painted ink, using pixels in the indicator's computed text colour. The checked glyph is taller than half its width; the mixed glyph is more than three times wider than tall. The test passes with the fix; with the fix reverted the mixed glyph measures 10×7 and the test fails. Checkbox, Slider and Field stories: 55/55. Contrast: 220/220.
- Sources: As, Op ✔. Confidence: high.

**✅ M4. Combobox popup sizing is wrong.**

- Cause: Base UI anchored the popup to the inner `<input>`, because the frame was a plain `InputGroup`. The upstream `+--spacing(7)` hack approximated the width of the trigger addon, and the inner input's offset produced the RTL shift.
- Fix: the frame renders through Base UI's `Combobox.InputGroup` (`render={<InputGroup … />}`). The positioner then anchors to the whole field frame (`inputGroupElement ?? inputElement`). The popup uses `w-(--anchor-width)` with `min-w-[min(var(--anchor-width),var(--available-width))]`; the chips-only override is redundant and was removed.
- Behaviour change: pressing a non-interactive part of the frame, such as a text addon, now focuses the input and opens the popup, through Base UI's `handleInputPress` with `openOnInputClick`. The Input Addon story now asserts this and checks for no trigger button while the popup is closed. While the popup is open, Base UI renders a visually hidden "Dismiss" button beside the input.
- Verification: `src/components/__tests__/Combobox.test.tsx` checks:
  - LTR and RTL: the popup's left and right edges match the field frame.
  - 320px: the popup stays inside the viewport.
  - With the fix reverted, all 3 tests fail: left 17 vs 16, right 783 vs 784, right edge 324 > 320.
  - With only the `min()` guard removed, the narrow-viewport test fails (325 > 320).
  - Combobox stories 27/27; contrast 108/108.
- Location: `src/components/Combobox.tsx:129`.
- `min-w-[calc(var(--anchor-width)+--spacing(7))]` makes the popup 28px wider than its trigger in every case (256 vs 284px). Sources: Ar.
- In RTL, the popup is offset from the input group: x 268–803 vs 248–776. Sources: Op ✔.
- At 320px, the 384px minimum width beats the 310px maximum, and options overflow the viewport. In CSS, `min-width` wins over `max-width`. Sources: As.
- Overall confidence: high.

**✅ M5. The Select scroll-up arrow is painted under the list.**

- Cause (verified in Base UI 1.9.0 source): with `alignItemWithTrigger`, `SelectList` receives `position: relative` and becomes the scroller. The scroll arrows are `position: absolute` without a z-index. The up arrow precedes the list in DOM order, so the list paints over it. The down arrow follows the list and was unaffected.
- Fix: `z-10` on both `SelectScrollUpButton` and `SelectScrollDownButton`. This matches upstream shadcn base-nova `select.json` and Base UI's demo (`.ScrollArrow { z-index: 1 }`). The popup is `isolate`, so the z-index stays local to the popup.
- Verification: `src/components/__tests__/Select.test.tsx` opens a 30-item Select with a middle value in a 480×320 viewport and hit-tests the centre of each arrow with `elementFromPoint`. Before the fix, the up-arrow test fails (an option is hit). With the fix, 2/2 pass. Select stories 27/27.
- Location: `src/components/Select.tsx:111-113, 190`.
- Cause: the list starts at `scrollTop=17`. The arrow has `data-visible`, but the relatively positioned list paints over the absolutely positioned arrow.
- Effect: the arrow is invisible, and hovering where it should be hits an option.
- Sources: As. Confidence: medium.

**✅ M6. In a DropdownMenu checkbox item, the label overlaps the check mark.**

- Cause: the popup was fixed at `w-(--anchor-width) min-w-32`, the same as upstream base-nova, which relies on consumers passing a width. A narrow trigger therefore gave a 128px popup. A single-word label is a flex item that cannot shrink below its min-content width, so it ran into the `pe-8` padding where the absolutely positioned indicator sits. The popup also had no `max-w`, so a full-bleed trigger made it overflow the viewport (325 > 320).
- Fix: the popup sizes to its content, as ContextMenu and Menubar already do. Its width is clamped between `min-w-[min(max(var(--anchor-width),--spacing(32)),var(--available-width))]` and `max-w-(--available-width)`. It is still never narrower than its trigger or 8rem. Base UI positions with floating-ui's `translate()` from `top:0; left:0`, so shrink-to-fit has the full containing block, and `w-max` is unnecessary (an ablation confirmed this).
- Behaviour change: a DropdownMenu popup is now wider than its trigger when its content needs more room; previously it was exactly the trigger width. An explicit `className="w-…"` still sets a fixed width.
- Verification: `src/components/__tests__/DropdownMenu.test.tsx` covers:
  - Checkbox and radio labels end before their indicators at 320px: LTR compact and comfortable, RTL compact, and a trigger at the right edge. Each label stays on one line.
  - The popup is exactly as wide as a 320px trigger.
  - A full-bleed trigger at 320px keeps the popup inside the viewport.
  - With the fix reverted, 5/6 fail (e.g. label right 118 > indicator left 115; RTL 202 < 205; popup right 325 > 320).
  - With only the `min()` guard removed, the viewport test fails.
  - Stories for DropdownMenu, Item, Breadcrumb, InputGroup, Table, Avatar, Sidebar and ButtonGroup: 130/130.
  - Native overlay and density tests: 53/53. Contrast: 136/136.
- Location: `src/components/DropdownMenu.tsx:54` (popup width) and `:219` (checkbox item).
- At 320px compact, the "Notifications" label spans x 35–128.6 and the check x 123–139. The same overlap appears in comfortable and RTL.
- Sources: As. Confidence: medium. Related to conflict C3.

**✅ M7. Chart axis labels never get the theme colour.**

- Confirmed against recharts 3.8.0 `es6/cartesian/CartesianAxis.js`: the tick `<text>` is `.recharts-cartesian-axis-tick-value`, inside `.recharts-cartesian-axis-tick-label` groups. The `.recharts-cartesian-axis-tick` group holds only the tick `<line>`, so the old descendant selector never matched, and the text kept recharts' `fill="#666"` presentation attribute.
- Fix: the selector is now `[&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground`. That class is also applied to custom `tick` elements and functions (`TickItem`).
- Verification: `src/components/__tests__/Chart.test.tsx` renders a BarChart with an XAxis and a YAxis under forced light and dark themes. Every tick's computed `fill` must equal the computed `text-muted-foreground` colour.
  - Before the fix, both themes fail with `rgb(102, 102, 102)`, against an expected `rgb(75, 83, 94)` in light and `rgb(163, 171, 182)` in dark.
  - With the fix, 2/2 pass. Reverting the fix fails both again.
  - Chart stories: 29/29. Chart contrast: 116/116.
  - `recharts` was added to the native test `optimizeDeps`.
- Location: `src/components/Chart.tsx:43`.
- Cause: the selector targets `.recharts-cartesian-axis-tick text`, but the rendered parent is `.recharts-cartesian-axis-tick-label`.
- Effect: dark-theme labels render `rgb(102,102,102)` on `rgb(18,20,23)`, about 3.2:1 from astra's values, which fails AA for small text.
- The contrast suite does not catch this.
- Sources: As. Confidence: medium.

**✅ M8. The Sidebar `outline` button has no border. (Not reproducible; regression guard added.)**

- The finding does not hold:
  - `git log -S"hsl(var(--sidebar-border))"` finds no revision of `src/components/Sidebar.tsx` that ever contained the wrapper.
  - The outline variant uses `shadow-[0_0_0_1px_var(--sidebar-border)]` and `hover:shadow-[0_0_0_1px_var(--sidebar-accent)]`, the same as upstream base-nova.
- Verification: `src/components/__tests__/Sidebar.test.tsx` checks the outline `SidebarMenuButton`'s computed `box-shadow` layers.
  - At rest it must contain `<--sidebar-border> 0px 0px 0px 1px`; on hover, `<--sidebar-accent> 0px 0px 0px 1px`.
  - It passes on the current source.
  - With the claimed `hsl(var(…))` wrapper injected, it fails with `box-shadow: none`.
- Location: `src/components/Sidebar.tsx`; argon cites `:517`.
- Cause: `hsl(var(--sidebar-border))` and `hsl(var(--sidebar-accent))` wrap hex tokens, so the CSS is invalid and the shadow-border never renders.
- Sources: Ar. Confidence: medium.

**✅ M9. The Sidebar skeleton breaks hydration.**

- Confirmed: during hydration of server markup produced by `renderToString`, React logs an attribute-mismatch `console.error`, and the mismatched widths are never patched. Upstream base `sidebar.tsx` has the same `Math.random()` code.
- Fix: the width is now derived from `useId()` through an FNV-1a hash (`getSkeletonWidth`). React guarantees that id is identical on server and client, so widths still vary across items and stay in the 50–89% range.
- Verification: `src/components/__tests__/Sidebar.test.tsx` renders six skeletons with `renderToString` and hydrates them with `hydrateRoot`. It asserts:
  - no `console.error` or recoverable errors;
  - the client widths equal the server widths;
  - every width is in 50–89%;
  - the widths are not all the same.
  - It passes with the fix and fails with the fix reverted (`console.error` called once). Sidebar stories pass 23/23.
- Location: `src/components/Sidebar.tsx:627-632`.
- Cause: `SidebarMenuSkeleton` calls `Math.random()` during render.
- Effect: the server render and the client render produce different `--skeleton-width` values.
- Sources: As. Confidence: high (SSR probe).

**✅ M10. Sidebar layout defects.**

- Compact `SidebarMenuBadge` (`h-5`, `top-0.5`) overflows its 20px button by 2px. Sources: Ar.
  - Confirmed: the compact `sm` badge bottom sits 2px below the button, and the comfortable `sm` badge is 3px off-centre.
  - Fix: the badge is now `h-control-xs`, matching `SidebarMenuAction`'s `w-control-xs`. Its per-size offsets are `top-px` (sm), `top-0.5` (default) and `top-1` (lg), because button minus badge height is 2, 4 and 8px in both densities.
- In collapsed mode, `SidebarGroupLabel` uses `-mt-8` (−32px) against `h-control` (28 or 20px), overshooting by 12px. Sources: Ar.
  - Stale: the current source already uses `group-data-[collapsible=icon]:-mt-control`. A regression guard was added; with `-mt-8` injected it fails (content 4px and 12px too high).
- When collapsed to icons, label text leaks out, because only `[&>span]` is hidden. Sources: Op ✔.
  - Confirmed for raw text children of `SidebarMenuButton`. Fix: non-blank string and number children are wrapped in `<span>` (`wrapTextChildren`), so the existing `[&>span]:sr-only` rule hides them and the accessible name is kept.
  - Not fixed: text inside a consumer's `SidebarHeader` (for example the story's "Workspace" label) is consumer content and leaks in upstream too. Text placed inside a `render` element rather than in `children` is also not wrapped.
- The non-collapsible variant is squeezed from 256 to about 160px, and desktop leaves a dead zone of about 200px. Sources: Op ✔. The dead zone may be related to H11.
  - Squeeze confirmed and worse: next to unbreakable inset content at a 600px viewport the aside shrinks to 0px. Fix: the non-collapsible aside is `shrink-0`.
  - Dead zone not reproduced as described. The measured equivalent is that the aside's `h-full` does not fill the `min-h-svh` wrapper; it is invisible because `--sidebar` equals `--background`. Left unchanged.
- The group label uses `px-2` while the menu button uses `px-control-x`. Sources: Op ✔.
  - Confirmed: label text started 2px before button text in comfortable and 2px after in compact. Fix: the label uses `px-control-x`.
- Verification: `src/components/__tests__/Sidebar.test.tsx` adds tests for badge centring (both densities, all sizes), label/button text alignment (both densities), the collapsed-label offset, a pixel comparison of raw-text against span-wrapped collapsed buttons, and the non-collapsible width beside wide content. With the fix reverted, all except the collapsed-label guard fail; with the fix, 10/10 pass. Sidebar stories pass 23/23.
- The M8 test was pointer-position dependent: the pointer rested over the top-left button, so its at-rest assertion saw the hover shadow. It now moves the pointer to a separate element first.

**✅ M11. The Toggle's minimum width lets content overflow.**

- Location: `src/components/Toggle.tsx:8, 17`.
- At 320px compact, `toggle--right-to-left` buttons shrink to 56px, and labels overlap by about 7.6px. Sources: As.
  - Confirmed in both densities: in a 256px row, labels overrun their toggles by about 1.6px. Cause: the explicit `min-w-control` replaces the flex item's `min-width: auto`, so the toggle shrinks below its content. Upstream base-nova has the same base classes.
  - Fix: the Toggle base is `shrink-0`, matching `ToggleGroupItem` and `Button`. The `RightToLeft` stories now wrap (`flex-wrap`) instead of overflowing at narrow widths.
- The icon Toggle is 36×28 rather than square, and the outline variant is 2px wider. Sources: Op (R).
  - Confirmed: there was no icon size, so an icon-only toggle was `min-w-control` plus `px-control-x`. Upstream base-nova has no icon size either. Fix: added `icon`, `icon-sm` and `icon-lg` sizes (`size-control`, `size-control-sm`, `size-control-lg`), mirroring Button. The `IconOnly` story uses `size="icon"`.
  - Confirmed: only `outline` had a border. Fix: every variant has `border border-transparent`, as in Button; `outline` only changes the colour to `border-input`.
  - Side effect: the default variant's existing `focus-visible:border-ring` now paints, so its keyboard focus indicator is 1px border plus 1px ring, the same as outline.
- Verification: `src/components/__tests__/Toggle.test.tsx` checks, in both densities, that labels stay inside toggles in a narrow row; that icon toggles are square and as tall as the matching text size, with the icon centred; and that outline and default toggles with the same content are the same width. With the fix it passes 6/6; with the fix reverted all 6 fail. Toggle and ToggleGroup stories pass 22/22. `@base-ui/react/toggle` was added to the native config's `optimizeDeps.include`, because optimizing it during the run reloaded the test.

**✅ M12. The Alert action is misplaced.**

- Location: `src/components/Alert.tsx`.
- Cause: `AlertAction` hard-codes `top-2 end-2` (8px) while the Alert uses `p-panel` (16px comfortable).
- Effect: "Undo" sits 4.57px above the title's centre line, with an 8px end inset against a 16px start inset.
- Sources: Ar, Op (R). Confidence: high.
- Confirmed: comfortable is 4.57px above the title line centre with an 8px end inset (content starts at 16px); compact is 0.24px off. Upstream base-nova keeps `top-2 right-2` against its own `px-2.5 py-2`, so the offsets only matched upstream's padding.
- Fix: `AlertAction` is `absolute top-panel end-panel flex h-lh items-center`. It shares the content inset, and its box is one title line tall, so any action height is centred on the first title line. The existing `pe-18` reservation still keeps a wrapping title clear of the "Undo" button in both directions.
- Verification: `src/components/__tests__/Alert.test.tsx` checks centring on the first title line, and checks the end inset and title clearance in LTR and RTL, all in both densities. With the fix 6/6 pass; with it reverted 4 fail (both centring tests and the comfortable inset tests). Alert stories pass 7/7.

**✅ M13. AlertDialog with media leaves a wide gap.**

- Location: `src/components/AlertDialog.tsx` header and media.
- Cause: the header has `gap-x-4` and `grid-rows-[auto_1fr]` but no `grid-cols-[auto_1fr]`, so both columns are `auto`. `AlertDialogMedia` also keeps `mb-2`.
- Effect: the gap between media and title is 23px in comfortable and 31px in compact, instead of 16px.
- Sources: Ar. Confidence: medium.
- Confirmed: the two implicit `auto` columns share the free width, so the gap grows with the dialog width. With a short title in the default-size dialog it measured 79px (comfortable) and 87px (compact) against a 16px column gap. The stacked-layout `mb-2` also pushed the header 3.86px / 8px below its tallest column. Upstream base-nova has the same classes.
- Fix: in the side-by-side layout (default size, `sm` and up, with media), the header adds `grid-cols-[auto_1fr]` and the media adds `mb-0`. The stacked layout keeps `mb-2`.
- Verification: two new density-parameterised tests in `src/components/__tests__/Dialog.test.tsx`. One checks that the media → title gap equals the header's computed `column-gap` and that the description shares the title's start. The other checks that the header ends at its tallest column. With the fix 7/7 pass; with it reverted 4 fail. AlertDialog stories pass 24/24.

**✅ M14. With `Message align="end"`, the header stays aligned to the start.**

- Location: `src/components/Message.tsx`.
- Cause: `MessageContent` excludes `message-header` from `self-end`.
- Effect: the sender name sits about 300px away from the avatar and bubble.
- The footer is also inset, and start and end bubbles use the same colour. Sources: Op (R).
- Sources: Ar, Op (R). Confidence: high.
- Confirmed: in a `w-96` message the "Alex" text ended 298px short of the footer text, in both LTR (`End`) and RTL. The exclusion was a deliberate local deviation: THIRD_PARTY_NOTICES said "preserve start-aligned message headers", and the `End` story asserted it. Upstream base-nova uses `group-data-[align=end]/message:*:data-slot:self-end`, which includes the header.
- Fix: restored the upstream selector and removed the stale sentence from THIRD_PARTY_NOTICES. `docs/internal/handoff.md:60` still describes the old behaviour as history.
- Not changed: the footer inset (`px-control-x`) matches upstream's `px-3` and now matches the header inset. Bubble colour is chosen by the caller through the `Bubble` `variant`, not by `Message`.
- Verification: the `End` story now checks that the header text ends where the footer text ends, and the `RTL` story checks the mirrored start. With the fix the Message, MessageScroller and Bubble stories pass 55/55; with it reverted `End` and `RTL` fail (298px).

**✅ M15. ButtonGroup separators and text break in some orientations.**

- Location: `src/components/ButtonGroup.tsx`.
- `ButtonGroupSeparator` doesn't follow a vertical group's orientation. It collapses to 1×0px, and its `my-px` leaves a 2px gap with no border.
- In a horizontal group next to an outline button, the separator doubles the border to 2px.
- `ButtonGroupText` is 19.14px tall against 28px buttons, because it has no `min-h-control` or vertical padding.
- Sources: Ar, Op (R). Confidence: high.
- Confirmed: in a vertical group the default-vertical separator rendered 1×0px with `aria-orientation="vertical"`; `ButtonGroupText` in a vertical group measured 19.14px against 28px (comfortable) and 20px (compact) buttons. Upstream base-nova has the same code. In a horizontal group the text already stretches to the row height.
- Fix: `ButtonGroup` provides its orientation through `ButtonGroupContext` (`src/button-group/`). `ButtonGroupSeparator` defaults to the perpendicular orientation, so the native `aria-orientation` and geometry agree; an explicit `orientation` still wins. `ButtonGroupText` takes `min-h-control` in vertical groups only, so horizontal `sm`/`lg` rows keep stretching to their buttons.
- Outline + separator: upstream docs say outline buttons "do not need a separator since they have a border". The doubled border came from the story using that combination. The default story no longer adds a separator; new `Separated` and `VerticalSeparated` stories use `secondary` buttons as the upstream demo does.
- Verification: new `src/components/__tests__/ButtonGroup.test.tsx` (6 tests, both densities) passes; with the fix reverted the vertical separator and text tests fail (4) and the `VerticalSeparated` story fails. ButtonGroup stories 14/14, lint and tsc clean.

**✅ M16. The Tabs `line` indicator sits below the list.**

- Location: `src/components/Tabs.tsx`.
- Cause: `TabsList` padding was reduced to `p-px`, but the trigger kept upstream's `after:bottom-[-5px]` and `-end-1`.
- Effect: the indicator sits 4px outside the list.
- Sources: Ar. Confidence: medium. Re-measured on current source (C9): the list is 28px with `p-px` and the active trigger fills it, so `after:bottom-[-5px]` puts the indicator 1–3px below the list edge. Upstream base-nova (`p-[3px]`, trigger `h-[calc(100%-1px)]`) puts the same offset across the list's bottom edge.
- Confirmed: in both densities the horizontal indicator's bottom edge lands 3px below the list (31 vs 28, 23 vs 20). The vertical indicator lands 2px past the list's end edge, in both LTR and RTL.
- Fix: offsets now cover only the 1px list padding plus the 1px trigger border: `after:-bottom-0.5` (horizontal) and `after:-end-0.5` (vertical, logical so RTL follows). The 2px indicator now sits flush inside the list's bottom or end edge.
- Verification: new `src/components/__tests__/Tabs.test.tsx` (6 tests: horizontal, vertical LTR, vertical RTL, both densities) computes the indicator edge from the trigger rect, its border and the `::after` computed offset. It passes with the fix, and all 6 fail with the fix reverted. Tabs stories pass 21/21, and lint and tsc are clean. Screenshots of the light comfortable horizontal story and the dark compact vertical RTL story show the indicator on the list edge.

**✅ M17. Top-level `NavigationMenuLink` ignores density.**

- Cause: the link uses `p-2` and no height token.
- Effect: it is 33.14px tall in both densities, while triggers are 32px comfortable and 24px compact, a 9px mismatch in compact.
- Sources: Ar. Confidence: medium.
- Confirmed: the bare "About" link in the `Default` and `Compact` stories measured 33.14px against 32px and 24px triggers.
- Root cause: this is a composition error in the story, not a component bug. Upstream's link base style is a row style for `NavigationMenuContent`. The upstream docs and demo give top-level links `className={navigationMenuTriggerStyle()}`, and our `LinkComponent` story already does. With that composition the link matches the trigger's height, top, inline padding and font weight in both densities. Changing the link's base style would break the in-panel rows and depart from upstream.
- Fix: the `Default` story's top-level "About" link now uses `navigationMenuTriggerStyle()`. The README now documents the top-level link composition, which it did not mention before.
- Verification: the `Default`/`Compact` play functions now assert that the About link height equals the Products trigger height. With the story fix reverted, both fail (33.14 vs 32 / 24). New native guard tests in `src/components/__tests__/NavigationMenu.test.tsx` cover both densities and pass. NavigationMenu stories pass 12/12, and lint and tsc are clean.

**✅ M18. Some animated components ignore reduced motion.**

- Not reproducible; no component change. `src/theme.css` (base layer, present since the initial commit) applies `animation-duration: 0.01ms !important` and `transition-duration: 0s !important` to every element and pseudo-element under `prefers-reduced-motion: reduce`. Important declarations in the base layer override the components' normal (non-important) `duration-*` utilities in the later utilities layer, so per-component `motion-reduce:*` classes are not needed for these cases. The gap-div and fixed-container items were also stale: both already carry `motion-reduce:transition-none`. NavigationMenu was settled under H12.
- Verification: new `src/components/__tests__/ReducedMotion.test.tsx` runs in the native `native-reduced-motion` Chromium project (`reducedMotion: "reduce"`). It opens a `DropdownMenuSubContent` and collapses an icon Sidebar, then asserts that the submenu, gap, container and group label have no running `Animation`s. Both pass. With only the two global duration declarations removed, both fail: the submenu has a running `CSSAnimation`, and the group label has two running `CSSTransition`s. The gap and container still pass in that state because their own `transition-none` sets `transition-property: none`. Restored, both pass again. Lint and tsc are clean.

- `DropdownMenuSubContent` (`src/components/DropdownMenu.tsx`) has `animate-in`/`animate-out` without `motion-reduce:*:animate-none`.
- Sidebar transitions have no `motion-reduce:transition-none`: the gap div's width, the fixed container's `left/right/width`, and `SidebarGroupLabel`'s `margin/opacity`.
- NavigationMenu has the same gap; see H12.
- Sources: Ar. Confidence: medium. Run `bun run test:reduced-motion` on the affected stories to confirm.

**✅ M19. Field spacing breaks in some layouts.**

- Fixed the checkbox stretch. The finding names the wrong orientation: the `Field/HorizontalDescription` story's play function switches the field to **vertical**, and in vertical (and narrow responsive) fields, `*:w-full` stretched a direct `Checkbox` or `RadioGroupItem` child to 320×16. `fieldVariants` now uses `*:not-[[role=checkbox],[role=radio]]:w-full` for those orientations, so the toggles keep their own `size-4`. `Switch` was not affected because its size-specific width selector wins on specificity. Upstream `field.tsx` has the same `*:w-full`.
- The separator part is not a visual defect, so there is no component change. At compact density the 20px `FieldSeparator` box touches its neighbours, but its rule sits 10px from each of them, more than the 8px gap between fields, and the "Or" glyphs clear both. At comfortable density each side has a 12px box gap. Upstream uses the same `-my-2 h-5`.
- Verification: `src/components/__tests__/Field.test.tsx` checks Checkbox, Switch and RadioGroupItem in vertical and responsive fields at both densities against their standalone size. It passes with the fix, fails for Checkbox and RadioGroupItem (320 vs 16) with the fix disabled, and passes again when re-applied. The Field, Checkbox, RadioGroup and Switch stories pass (73), and lint and tsc are clean.
- `FieldDescription` in horizontal orientation stretches its checkbox to 320×16, caused by `*:w-full` at `src/components/Field.tsx:61`. Sources: Op ✔.
- `FieldSeparator`'s `-my-2` cancels the compact `gap-field-gap` of 8px, so the separator touches the fields on both sides. Sources: Ar.

**✅ M20. The Questionnaire "Reset draft" button is far too wide.**

- Fixed. Root cause: the reset button is a consumer child with no grid placement. On the first item, `QuestionnairePrevious` is `hidden` (`display: none`), so auto-placement puts the reset button in the empty `minmax(0,1fr)` first column, and the default `justify-self: stretch` stretches it across that track. When Previous is visible, the button lands in an `auto` column and has its content width. `QuestionnaireActions` now sets `justify-items-start`, so unplaced actions keep their content width. The built-in Previous/Skip/Next/Submit parts already set their own `justify-self-*`, so they are unaffected. Upstream `questionnaire.tsx` uses the same grid, and the upstream "Restore a saved draft" docs example puts a reset button inside `QuestionnaireActions`, so the bug also affects upstream's documented composition.
- Verification: new `src/components/__tests__/Questionnaire.test.tsx` renders the documented composition with Previous hidden at both densities and compares the reset button's width with a standalone `Button`. It fails without the fix (457.09 vs 101.48px) and passes with it. Disabling only the fix makes it fail again, and re-applying it makes it pass. Questionnaire stories pass (20/20), and lint and tsc are clean.
- It is 466px wide next to a 50px "Next" button, because of the grid columns at `src/components/Questionnaire.tsx:222`.
- Sources: Op ✔. Confidence: medium.

**✅ M21. On the vertical Carousel, the Next button overlaps the counter.**

- Fixed in the story; the component is unchanged. `CarouselPrevious`/`CarouselNext` are positioned absolutely and deliberately overhang the carousel (`-top-10`/`-bottom-10`), as upstream's do (`-top-12`/`-bottom-12`). Upstream's vertical docs example leaves consumers to reserve that space. The `Vertical` story reserved the top overhang with `p-12` but placed the `output` counter only `gap-panel` below the carousel, so the Next button's box (comfortable 262–288px) intersected the counter's (264–287px). The glyphs did not collide at this width because the counter text is start-aligned, but the button shared the counter's row. Vertical stories now use a `gap-12` column gap, which mirrors the top reserve.
- Verification: the `Vertical` play function (also used by `VerticalRtl`) now asserts that the Next button's bottom edge is at or above the counter's top. It fails with the story fix disabled (288 vs 264, for both stories) and passes with it (22/22). Measured: comfortable 288 ≤ 296, compact 296 ≤ 304. Lint and tsc are clean. Note that the first red run and one green run crashed with "Browser connection was closed" at load average ~94; they were re-run.

- Location: `-bottom-10` at `src/components/Carousel.tsx:188`.
- Sources: Op ✔. Confidence: medium.

**✅ M22. Bubble `typeset` clips ordered-list markers.**

- Fixed in `src/components/Bubble.tsx`: the ghost variant now sets `*:data-[slot=bubble-content]:overflow-visible`. A ghost bubble has no background, radius or padding, so there is no box for its content to be clipped to; the other variants keep upstream's `overflow-hidden` for their rounded corners. `Bubble` is a flex column, so `BubbleContent` stays an independent formatting context and its margins still don't collapse. Confirmed from screenshots: Chromium places outside markers before the `li` border box, so in JetBrains Mono "a. " (1.8em, 21px at 12px) overruns the `ol`'s 1.5em (18px) padding by about 3px. The clip cut off the "a"/"b" glyphs on the inline-start side in both LTR and RTL. `typeset.css` is unchanged because no fixed list padding can hold every marker ("viii.", "10.").
- Verification: the new `src/components/__tests__/Bubble.test.tsx` covers both densities and both directions. It counts the inked pixels of a ghost bubble's lettered list and compares them with the same list rendered outside a bubble at the same type size. It fails with the fix disabled (442 vs 482 inked pixels, comfortable LTR) and passes with it; the Bubble stories pass 25/25 and lint and tsc are clean. `captureImageData` in the test helpers now accepts any `Element`, which is what `page.elementLocator` takes.
- Location: `src/components/Bubble.tsx:78` and `src/typeset.css:184`.
- Cause: `BubbleContent` has `overflow-hidden`, and the ghost variant removes padding, so the `1.5em` outside markers ("a.", "b.") get cut off, in RTL as well.
- Sources: As, Op ✔. Confidence: high.

**✅ M23. Bubble ghost variant and reactions.**

- The ghost variant puts `border-none` on the outer `bubble`, so `bubble-content` keeps its transparent 1px border.
- `BubbleReactions` is absolutely positioned and overhangs 19.5px (comfortable) or 13.5px (compact), but `BubbleGroup` gaps are only 6px or 4px, so reactions overlap the neighbouring bubble. The story works around this with `gap-8`.
- Sources: Ar. Confidence: medium.
- Fix (reactions): `BubbleReactions` is now an in-flow flex item. `order-first`/`order-last` place it on its side, and a negative margin of `--spacing(1)` + `control-gap` cancels the Bubble gap and overlaps the content edge by 6px (comfortable) or 4px (compact); the absolute version overlapped by 6.5px or 4.5px. Alignment uses `self-start`/`self-end` with a logical 12px inset. The overhang now occupies layout, so the default `BubbleGroup` gap separates reactions from the next reply. A reaction row wider than its content widens the bubble instead of overflowing the bubble's opposite edge.
- Fix (ghost border): the root `border-none` was dead, and I removed it. The content's transparent 1px border is deliberately kept: it reserves the `focus-visible:border-ring` stroke that, with `ring-1`, gives interactive ghost content the same 2px indicator as Input. Removing it would thin the indicator to 1px. The cost is a 1px inset of ghost text. Nothing in the change is behavioural, so no test covers it.
- Verification: `Bubble.test.tsx` "bubble reactions keep the group gap to neighbouring bubbles" checks both densities and both sides. It asserts clearance equals the group `row-gap`, and that reactions still overlap the content. With the fix disabled it fails with clearance −13.5 against 6. With the fix it passes 2/2 (green, disabled, green). Bubble stories pass 25/25 with the story `gap-8` workaround removed. Screenshots of SpacedReactions, Reactions, DecorativeReactions and RTLReactions in light/comfortable and dark/compact were inspected. Lint and tsc are clean. README guidance was updated.
- Follow-up: the margin above was written with `var(--spacing-control-gap)`. That token is declared in `@theme inline`, so it resolves at `:root` and stayed comfortable in compact density: the compact overlap was really 6px, not the 4px claimed in the reactions fix. The margin now uses `var(--ag-control-gap)`, and the test asserts that the overlap equals the content's block padding on the reaction side. Before the correction, compact failed with an overlap of 6 against a padding of 4. The test passes with the correction (green, disabled, green), and the Bubble stories pass.

**✅ M24. Item `size="sm"` is identical to `default`.**

- Location: `src/components/Item.tsx`; opus cites `:51-52`.
- Both sizes use `gap-panel p-panel`, unlike Card `sm`.
- In `ItemGroup`, `ItemSeparator`'s `my-2` adds to `gap-4`, producing a 49px gap. Sources: Ar.
- Sources: Ar, Op (R). Confidence: high.
- Verified: the finding holds. Upstream base-nova and base-lyra share both defects. Upstream new-york-v4 has a distinct `sm` (`gap-2.5 px-4 py-3`) and an `ItemSeparator` with `my-0`, and base-vega also steps `sm` down.
- Fix (size): `sm` now uses `gap-(--ag-panel-padding-sm) p-(--ag-panel-padding-sm)`, the same density-aware step as Card `sm`: 12px against 16px in comfortable, 6px against 8px in compact.
- Fix (separator): `ItemSeparator` no longer adds `my-2`. The `ItemGroup` gap alone spaces it, giving 16 + 1 + 16 = 33px for `default`, as in new-york-v4. Vertical separators now span the full row height instead of being inset by 8px.
- Verification: `Item.test.tsx` checks that a small item insets its content less than default (block inset, inline inset and media gap) in both densities. It also checks that the separator sits exactly one group `row-gap` from each neighbour for all three sizes. With the fix disabled, both tests fail; the separator case shows 24 against 16. With the fix, they pass 2/2 (green, disabled, green). Item stories pass 15/15. Lint and tsc are clean. Screenshots of Default and Muted (`sm`) were inspected: 244px against 216px tall.

**✅ M25. Attachment sizes don't scale consistently.**

- Vertical orientation insets the title and description 4px from the thumbnail (`px-1`).
- `size="sm"` has no compact padding.
- `size="xs"` hard-codes `gap-1.5`, which is wider than the compact gap of `default` and `sm`.
- Sources: Ar; opus confirms Attachment sm and xs ignore density. Confidence: medium.
- Verified: all three hold. In compact, the media inline inset measured 5px, 7px and 5px for `default`, `sm` and `xs`, so `sm` was roomier than `default`. A vertical card's title started 4px inside the thumbnail edge in both directions. Upstream base-nova also has the vertical `px-1`, but its larger radii give the inset a visual reason that this sharp-cornered package lacks.
- Fix (sizes): `sm` derives its padding from `--ag-control-x` and `--ag-control-gap`, and `xs` uses `gap-control-gap` and a padding 2px below `--ag-control-gap`. Every size now steps down from the one above it and shrinks in compact. The arbitrary values use the raw `--ag-*` variables because `--spacing-control-*` is declared in `@theme inline` and resolves at `:root`. Inside an arbitrary value it would therefore stay comfortable under `[data-density=compact]`.
- Fix (vertical): `AttachmentContent` no longer adds `px-1` in vertical orientation, so text shares the thumbnail's inline-start edge.
- Verification: the new `Attachment.test.tsx` measures media inset, card height and media-to-text gap for all three sizes in both densities. It asserts that each metric never grows from `default` to `sm` to `xs` and that compact is smaller than comfortable for every size and metric. It also asserts a zero offset between thumbnail and title in a vertical card, in LTR and RTL. Both tests fail with the fix disabled and pass with it (green, disabled, green). Attachment stories pass. Lint and tsc are clean. Screenshots of Small, ExtraSmall, Vertical and ImageCompact in light/comfortable and dark/compact were inspected.

**✅ M26. NativeSelect `size="sm"` is taller than `default` in compact density.** Not reproducible: current source uses `data-[size=sm]:h-control-sm`; compact `sm` measures 18px vs 20px default (`nativeselect--small`, 2026-10-14).

- Cause: `data-[size=sm]:h-6` (24px) instead of `h-control-sm`, while `default` is 20px.
- Sources: Ar. Confidence: medium.

**✅ M27. The disabled Slider is dimmed twice.**

- Cause: both the thumb and the track container apply `data-disabled:opacity-50`, giving an effective opacity of 0.25.
- Fixed: the thumb keeps `data-disabled:pointer-events-none` and inherits the Control's single `data-disabled:opacity-50`. Upstream base-nova's thumb uses `disabled:opacity-50`, which never matches the thumb `<div>`, so upstream also dims only once.
- Verified: `Slider.test.tsx` asserts an effective (ancestor-multiplied) opacity of 0.5 for both track and thumb. The test passes with the fix; with the fix reverted it fails with `expected 0.25 to be close to 0.5`.
- Sources: Op ✔. Confidence: medium.

---

## Cross-component consistency (design decisions needed)

Each of these needs a single, deliberate rule. They are not single-line bugs.

**✅ D1. Density is applied unevenly.**

- Resolved with these rules:
  - Every selectable popup row follows the existing `CommandItem` precedent: `min-h-control`, with no fixed vertical padding (28px comfortable, 20px compact). This covers Dropdown, Context and Menubar items, checkbox, radio and sub-trigger rows, and Select and Combobox items.
  - Disclosure rows, choice cards and floating panels use the existing `--ag-panel-padding-sm` token (12px / 6px), following Card. This covers the `AccordionTrigger` and content, Field choice cards and `PopoverContent` (padding and gap).
  - Tooltip uses `min-h-control px-control-x`. The `SelectTrigger` start inset uses `ps-control-x`, matching Button; its chevron side keeps `pe-2`, matching Button's trailing-icon inset.
  - Vertical `TabsTrigger` uses `h-control-sm` plus `basis-auto`, because `flex-1` sets a zero basis that overrides height in a column. Horizontal and vertical triggers now match in both densities.
  - The Menubar root drops `p-px`, so its triggers match tab triggers (26px / 18px) and no longer shrink to 16px.
  - Icons, Avatar and Spinner keep fixed sizes by design: they are glyph-sized content, and density controls geometry. README documents this.
- Verification:
  - `src/components/__tests__/Density.test.tsx` (native browser) passes 16/16.
  - With the class edits disabled, all 16 fail.
  - Required `.storybook/vitest.native.config.ts` to pre-optimize the accordion, radio, radio-group, tabs and cmdk entries. Without them, mid-run optimization loaded a second React.
- Visual baselines for menus, Select, Combobox, Accordion, Tabs, Field, Popover and Tooltip will change.
- These ignore compact density entirely:
  - menu, select and context items (25.14px in both modes);
  - `AccordionTrigger` (39.14px);
  - vertical `TabsTrigger` (23.14px);
  - Field choice cards (57.14px);
  - Avatar and Spinner;
  - popover and tooltip padding;
  - icons (16px everywhere).
- Where density is applied, it is inconsistent:
  - Command items shrink;
  - the compact Menubar trigger is 16px tall;
  - the compact Select trigger keeps 10px start padding.
- Sources: Ar, Op ✔.

**✅ D2. Form controls use different typography and padding.**

- Resolved with these rules:
  - Every field uses control text `text-sm` (12px), matching Button and the existing Select, NativeSelect and ComboboxChips. Input and Textarea drop `text-base`, and so does `InputGroupInput` through Input.
  - `text-base` here is 14px. Upstream uses it as a mobile focus-zoom guard, which needs at least 16px, so 14px never gave that protection.
  - The NativeSelect start inset uses `ps-control-x`. Its chevron side keeps `pe-8`, which reserves space for the absolutely positioned icon.
  - Every field frame uses the repo's `bg-secondary` field fill: the Select trigger, the InputGroup root (and through it Combobox and Command input) and ComboboxChips. InputGroup's `has-disabled:bg-muted` still overrides it.
- Verification:
  - `src/components/__tests__/FormControls.test.tsx` (native browser) checks Input, Textarea, InputGroup, NativeSelect, SelectTrigger and ComboboxChips against Button's font size and start inset and Input's fill in both densities. It passes 6/6; with the edits disabled, all 6 fail.
  - The contrast suite passes 648/648 across the affected field families. The Select placeholder's `muted-foreground` on `bg-secondary` exceeds Input's existing `faint-foreground` placeholder pairing.
  - The field story interaction tests pass 162/162.
  - Addendum: `QuestionnaireInput` also used `text-base` (14px). It now uses `text-sm`.
    - It was added to `FormControls.test.tsx`, which now passes 7/7.
    - Before the change it failed with 14px vs 12px.
    - The Questionnaire stories pass 20/20, and Questionnaire contrast passes 80/80.
- Visual baselines for these fields will change.
- `Input`, `Textarea` and `InputGroupInput` use 14px (`text-base`); Select, NativeSelect, ComboboxChips and Button use 12px.
- `SelectTrigger` (`ps-2.5 pe-2`) and `NativeSelect` (`ps-2.5 pe-8`) bypass `px-control-x`.
- Input, NativeSelect and Textarea are `bg-secondary`; the Select trigger, InputGroup and Combobox are transparent.
- Sources: Ar, Op.

**✅ D3. Focus ring widths differ.**

- Resolved with these rules:
  - Field-like frames all use Input's 1px `ring-1` focus indicator. The `focus-visible` variants on the InputGroup root (and through it Combobox and Command) and the Field choice-card label move from `ring-3` to `ring-1`. The invalid `ring-3` is left alone; it is covered by D4.
  - The Accordion trigger has no inline padding, so it now uses Button's button-like pattern instead: `outline-solid outline-1 outline-offset-1 outline-ring`. Its transparent 1px border plus the 1px offset keep the indicator off the text. The upstream leftover `focus-visible:after:border-ring` is removed; it targeted an empty `::after` that had no border width.
- Verification:
  - `src/components/__tests__/FocusIndicators.test.tsx` (native browser) keyboard-focuses each surface and measures, in pixels, the band that changes along the frame's midline. InputGroup and the choice card must match Input's band thickness, and the Accordion band must end before the text starts. It passes 3/3; with the edits disabled, all 3 fail (thickness 4 vs 2, clearance 0).
  - The Accordion, InputGroup, Field, Combobox and Command story tests pass 109/109.
- Visual baselines for focused InputGroup, Combobox, Command, choice cards and Accordion will change.
- InputGroup (`src/components/InputGroup.tsx:20`), and through it Combobox and Command, plus Field choice cards use `ring-3`. Everything else, including `QuestionnaireChoice`, uses `ring-1`.
- Accordion's ring sits flush against its text.
- Sources: Ar, Op ✔.

**✅ D4. Invalid controls keep a permanent 3px ring.**

- Resolved by following the repo's existing invalid pattern (Badge, Toggle, `QuestionnaireChoice`): at rest, an invalid control shows only `border-destructive`. `ring-destructive` stays, so the regular focus indicator turns destructive while the control is focused, at its usual width.
  - Input, Textarea, NativeSelect, Select, Checkbox, RadioGroup, Switch and Questionnaire drop `aria-invalid:ring-3`.
  - InputGroup (`has-[[data-slot][aria-invalid=true]]`) and ComboboxChips (`has-aria-invalid`) drop their `ring-3`.
  - Button's focus indicator is an outline, not a ring. It drops `ring-3`/`ring-destructive` and uses `aria-invalid:outline-destructive`.
- Verification:
  - `src/components/__tests__/InvalidIndicators.test.tsx` (native browser) captures each invalid control at rest and after keyboard focus. It checks:
    - nothing is painted outside the frame at rest;
    - the focused indicator keeps the destructive border colour;
    - field-like focus thickness equals the valid Input's.
  - It passes 11/11. With all edits disabled, all 11 fail with a 2.5px halo outside the frame. With only Button's `outline-destructive` removed, the Button colour assertion fails.
  - The story interaction tests for Input, Textarea, NativeSelect, Select, Checkbox, RadioGroup, Switch, Questionnaire, Button, InputGroup, Combobox and Field pass 244/244.
  - The native Vitest config now pre-optimizes `@base-ui/react/checkbox`, `@base-ui/react/switch` and `@shadcn/react/questionnaire`, so mid-run dependency optimization no longer reloads the test module.
- Visual baselines for invalid states will change.
- `aria-invalid:ring-3 aria-invalid:ring-destructive` applies whether or not the control has focus.
- Adjacent invalid controls in compact groups (4px gap) merge their halos.
- Affected: Input, Textarea, Select, NativeSelect, Button, Checkbox, RadioGroup, Switch, InputGroup, Combobox, Questionnaire.
- Sources: Ar, Op (R).

**✅ D5. Radius hierarchy and token mapping are inconsistent.**

- Resolved with a two-tier rule:
  - Controls and inline elements use `rounded-sm` (2px).
  - Bordered block surfaces and floating surfaces use `rounded-md` (4px).
  - A child never rounds more than the container it sits in.
- Changes:
  - `TabsTrigger` goes from `rounded-md` to `rounded-sm`, matching its 2px `TabsList`.
  - `Alert` goes from `rounded-sm` to `rounded-md`, matching Card, Empty, Attachment and the overlays.
- NavigationMenu is no longer inverted: C2 made its popup 4px, and its links are 4px. This is confirmed by the test below, which passed before any D5 edit.
- No change:
  - The token mapping (`xs`/`sm` = 2px, `md`/`lg`/`xl` = 4px) stays. It is the repo's deliberate sharp-corner scale (AGENTS.md: "Preserve sharp control corners"), so collapsing upstream's larger steps onto two tiers is intended. Changing it is an owner decision.
  - `ResizableHandle`'s grip is a 4px-wide bar. A 2px radius would turn it into a pill, which goes against the sharp-corner contract.
- Verification:
  - `src/components/__tests__/Radii.test.tsx` (native browser) compares computed radii: TabsTrigger against TabsList, NavigationMenu link against popup, and Alert against Card.
  - It passes 3/3. With the edits disabled, the Tabs and Alert cases fail (4 > 2 and 2 ≠ 4).
  - The Tabs, Alert and NavigationMenu stories pass 40/40. `Density.test.tsx` passes 16/16.
- Visual baselines for Tabs and Alert will change.
- `src/theme.css` maps `xs`/`sm` to 2px and `md`/`lg`/`xl` to 4px.
- In Tabs and NavigationMenu, 4px children sit inside 2px parents.
- ✅ Overlay radii: every floating surface now computes 4px (C2). The remaining points in this item are open.
- Alert uses `rounded-sm` while Card uses `rounded-md`. ResizableHandle uses `rounded-none`.
- Sources: Ar, Op.

**✅ D6. Overlay typography and sizing differ.**

- Resolved: one typography per role across overlays, with the Sheet title, the Dialog content and the DropdownMenu label and shortcut as references.
- Changes:
  - `DialogTitle` drops `leading-none`, so it computes the same line height as the AlertDialog, Sheet and Drawer titles. Upstream base-nova uses `leading-none` on Dialog but not on Sheet, so this is a deliberate move away from upstream.
  - `AlertDialogContent` adds `text-sm`, so its body text matches `DialogContent` instead of inheriting the page size.
  - `MenubarLabel` goes from `text-sm` to `text-xs text-muted-foreground`, matching the DropdownMenu and ContextMenu labels.
  - `SelectLabel` and `ComboboxLabel` add `font-medium`.
  - `CommandShortcut` adds `tracking-widest`, matching the menu shortcuts (upstream Command has it too).
- Correction to the finding: menu shortcuts do change colour on highlight. The DropdownMenu, ContextMenu and Menubar shortcuts go from rgb(163,171,182) at rest to rgb(236,239,243) when highlighted. The highlight test passed before any D6 edit.
- No change: Popover, Toast and Sonner titles stay on the compact `text-sm font-medium` tier. Upstream uses the same split (modal titles `text-base`, non-modal floating titles `text-sm`).
- Verification:
  - `src/components/__tests__/OverlayTypography.test.tsx` (native browser, dark, comfortable) compares computed font size, line height, weight, letter spacing and colour:
    - the Dialog, AlertDialog, Sheet and Drawer titles;
    - the Dialog and AlertDialog content;
    - the group labels of DropdownMenu, ContextMenu, Menubar, Select, Combobox and the Command heading;
    - the shortcuts of DropdownMenu, ContextMenu, Menubar and Command, at rest and when highlighted.
  - It passes 15/15. With the edits disabled, 6 fail:
    - Dialog title line height (14 vs 21);
    - AlertDialog content (14/21 vs 12/17.14);
    - Menubar label (12 vs 11px);
    - Select and Combobox label weight (400 vs 500);
    - Command letter spacing (normal vs 1.1px).
  - The contrast suite on the Dialog, AlertDialog, Menubar, Select, Combobox and Command stories passes 516/516.
  - Story interaction tests for the same families pass 128/129. The failure was Combobox "Comfortable Multiple" (item visibility) at load average 13. Re-run alone it passes 27/27 twice, so it is a load flake and not caused by the label weight change.
- Visual baselines for these overlays will change.
- Original finding:
- Title line heights:
  - Dialog: 14 (`leading-none`);
  - AlertDialog, Sheet and Drawer: 21;
  - Popover, Toast and Sonner: 12/17.
- Content text: `dialog-content` is 12px; `alert-dialog-content` is 14/21.
- Group labels: Menubar 12/17; DropdownMenu and ContextMenu 11/500; Select 11/400.
- Menu shortcuts use `tracking-widest` but Command's don't, and only Command's shortcut changes colour on highlight.
- Sources: Op ✔.

**✅ D7. Backdrop and motion differ between overlays.**

- Verified as intended. No code change.
  - Drawer's 450ms matches upstream base-nova `drawer.json` (`duration-450`). Its release uses Base UI's `--drawer-swipe-strength`, which `@base-ui/react/drawer/popup/DrawerPopupCssVars.d.ts` documents as "A scalar (0.1-1) used to scale the swipe release transition duration in CSS." A gesture-driven sheet needs this longer, velocity-scaled timing. A 100ms snap would cut off the swipe.
  - Sheet's square corners match upstream base-nova `sheet.json`, which has no rounding. C2 already excludes edge-anchored surfaces from the 4px overlay radius.
- ✅ Backdrop blur: Dialog, AlertDialog, Sheet and Drawer all blur at 4px (C1).
- Original finding: Drawer runs a 450ms transition against 100ms for the others; Sheet has square corners.
- Sources: Ar, As.

**✅ D8. Toast and Sonner are two notification systems that look different.**

- Resolved: Sonner now renders the same surface as Toast.
- Measured before the fix (native Chromium, dark, comfortable, 1280px):
  - radius (4px/4px), inline padding (16px/16px) and action button (outline `sm`, 26px) already matched;
  - three properties differed: font (Sonner sans, Toast mono), width (356 vs 384px) and close glyph colour (rgb(236,239,243) vs rgb(163,171,182)).
- Changes:
  - `Sonner` passes `style={{ fontFamily: "inherit", "--width": "var(--container-sm)", ...style }}` through Sonner's typed `ToasterProps.style`, which Sonner spreads after its own `--width` default. Sonner's injected `[data-sonner-toaster]` rule sets `font-family` and `width` outside cascade layers, so the old `[&[data-sonner-toaster]]:font-mono` utility never applied (this is the cause behind M2). Sonner now inherits the document font as Toast does, and its width uses the same `--container-sm` token as Toast's `max-w-sm`. The style type lives in `src/sonner/types.ts`. A caller's `style` still overrides both.
  - `ToastClose` drops its `text-muted-foreground hover:text-foreground` override and follows the ghost `Button` palette. This matches Sonner's tested contract ("close control follows the ghost button palette") and upstream base-nova `DialogClose` (plain `variant="ghost"`).
- Verification:
  - `src/components/__tests__/Notifications.test.tsx` (native) compares computed font, width, radius, inline padding and close colour, and checks that Sonner's font equals the body font. With the fix disabled it fails on font, width and close colour. With the fix it passes.
  - Native `Notifications`, `Sonner` and `Toast` pass 16/16 (plus 2 `test.fails` from the set-aside density-height defect). The `Sonner` desktop width expectation changes from 356 to 384.
  - The Sonner and Toast stories pass 26/26, and contrast passes 104/104.
- ⏸ Whether both notification systems stay public is an owner decision. They now look the same, so that decision is about API surface, not visual drift.
- Visual baselines for Sonner (width and font) and the Toast close glyph will change.
- Original finding: font (see M2); radius 2 vs 4px; padding `p-panel` vs fixed 16px; shadcn Button vs Sonner's own buttons; width 382 vs 356px; decide whether both stay public.
- Sources: Ar, Op.

**⏸ D9. Too many surface tokens share the same colour.**

- Confirmed in `src/theme.css`: `--background`, `--card` and `--popover` are `#121417` (dark) and `#fcfcfd` (light, not `#f8f9fb` as reported), `--sidebar` is `var(--background)`, and `--muted` equals `--accent`.
- Set aside: introducing a surface elevation scale changes the brand palette and the contrast of every surface, so it is a design decision for the owner, not a defect fix.
- Original finding: nested surfaces can only be told apart by a 1px border.
- Sources: Ar, Op ✔.

**⏸ D10. Disabled styling differs.**

- Confirmed: Button's `disabled:border-dashed disabled:border-border disabled:bg-transparent disabled:text-faint-foreground` treatment dates from the initial commit (`a16ba50`) and is covered by the Button disabled visual baseline. Every other control uses upstream's `opacity-50`.
- Set aside: choosing one disabled language for the whole catalog is a brand decision for the owner. The double-dimming defect is fixed separately under M27.
- Original finding: Button uses a dashed border; other controls use opacity.
- Sources: Op ✔.

---

## Low

- **✅ L1.** `QuestionnaireChoice` indicator sits 1.55px below the centre of single-line labels (manual `translate-y`). Ar.
  - Verified: upstream base-nova uses the same hard-coded `translate-y-[--spacing(0.45)]` (1.8px) on the indicator and shortcut. A `translate-y-0.5` override applies when a description is present. These offsets assume 14px `text-sm` with a 19.25px line. Here the label is 12px with a 16.5px line. Measured against the first line box, the indicator sat 1.55px low. In the described case the shortcut sat 3.55px low, because its 20px box took the extra 2px override.
  - Fix: both boxes use `translate-y-[calc((var(--ag-control-text)*var(--leading-snug)-100%)/2)]`, which centres them on the label's first line box. The description override is removed.
  - Note: CSS cannot centre on the glyph box, because `calc()` has no access to font ascent or descent. In Chromium, JetBrains Mono's 16px content area sits at the top of the 16.5px line box. The glyphs therefore render 0.25px above the line-box centre the boxes now share.
  - Verification: `Questionnaire.test.tsx` ("a choice centres its indicator and shortcut on the first label line") covers both densities, radio and checkbox, and with and without a description. It was red at 1.8 and 3.8, then green, then disabled (failing at 1.55 and 3.55), then green again. The 20 Questionnaire stories pass. Screenshots in light/comfortable and dark/compact are centred.
- **✅ L2.** `PaginationPrevious` sits 0.55px (comfortable) or 1.09px (compact) higher than the other items. Cause: the `inline-flex` baseline comes from an SVG first child. Ar.
  - Verified: each `PaginationItem` was a plain block `<li>`. The inline-flex link sat on that `<li>`'s line box. Previous and Next start with an SVG, so their baseline is synthesised from the icon's bottom edge. Both measured −0.55px from the row centre in comfortable density. Upstream base-nova has the same structure (`Button render={<a>}` inside a bare `<li>`).
  - Fix: `PaginationItem` is a `flex` container. The link becomes a blockified flex item and no longer participates in a line box. The `<li>` and list semantics are unchanged, and consumer `className` is merged through `cn`.
  - Verification: `Pagination.test.tsx` ("pagination controls share the content row's centre") covers both densities and Previous, the active page, Ellipsis and Next. It was red at −0.55, then green, then disabled (red again), then green again. 17 Pagination and Table stories pass.
- **✅ L3.** `InputOTPSeparator` has 0px spacing to the groups on either side, while slots inside a group have 4px. Ar. Not reproducible: the OTP container (`containerClassName`, unchanged since HEAD) uses `gap-control-gap`. In `inputotp--default` the separator sits 6px (comfortable) or 4px (compact) from each group. Slots inside a group share borders with no gap, which matches upstream base-nova (2026-10-14).
- **✅ L4.** Spinner overflows a compact Badge: its rotated box is 16.95px inside a 16px badge. Ar.
  - Verified (2026-10-14): **Not reproducible.** The badge forces child SVGs to 12px (`[&>svg]:size-3!`). 16.95px is the axis-aligned `getBoundingClientRect` of that 12px square under `animate-spin`, at about 45° (12√2 ≈ 16.97). At 0° and 90° it reads 12.01px. That rect is a layout measurement of the rotated element, not painted overflow.
  - Painted geometry (`.tmp/fix/l4-probe.ts`, compact `badge--with-spinner`, 8 rotation samples): the method walks the LoaderCircle path (radius 9 in a 24 viewBox, computed stroke width scaled by the screen CTM) and returns its outermost stroke edges. Across every sampled angle the stroke stays within y 27.00–37.00 inside a badge spanning y 24–40, leaving a 3px margin each side. Radius-plus-half-stroke is rotation-invariant, so no angle can reach the badge edge. The badge is also `overflow: hidden`.
- **✅ L5.** `BreadcrumbEllipsis` (`size-5`) overflows a compact `Button size="xs"` by 2px above and below. Ar.
  - Verified (2026-10-14): the compact `xs` trigger is 16px (14px content box) and the fixed 20px ellipsis box overflowed it by 2px on each side. The trigger reported 3px of scrollable overflow (`scrollHeight` 17 vs `clientHeight` 14). The painted icon was already 12px because Button's `[&_svg:not([class*='size-'])]:size-3` wins over `[&>svg]:size-4`. Upstream's `size-5` is the same, and so is its `icon-sm` trigger composition, which is 18px in compact and would also overflow. A `data-slot=button` scope is not possible, because `DropdownMenuTrigger` overwrites the slot with `dropdown-menu-trigger`.
  - Fix: `src/components/Breadcrumb.tsx` adds `max-h-full max-w-full` to the ellipsis box. Inside a fixed-size container, the decorative box never exceeds the content box (compact `xs`: 20×14px). In an auto-height breadcrumb item, the percentage resolves to `none`, so the standalone box stays 20×20px in both densities (measured on `breadcrumb--collapsed`).
  - Verification: `src/components/__tests__/Breadcrumb.test.tsx` renders a menu trigger around the ellipsis for each density × `xs`/`icon-xs`/`icon-sm`. It asserts zero border-box overflow and zero scroll overflow. Red: compact `xs` gives overflow 2 and scrollOverflow 3. Green after the fix. Fails again with only the fix reverted, then green. The 6 Breadcrumb stories pass.
- **✅ L6.** The Slider root is 4px tall while its thumb is 12px, so the thumb overflows the component box. Ar.
  - Verified (2026-10-14): on `slider--default`, the root and Control span y 24–28 (4px) while the thumb spans y 20–32. Base UI positions thumbs absolutely at the Control's cross-axis centre (`node_modules/@base-ui/react/slider/thumb/SliderThumb.mjs:224-229`), so they never contribute to layout. Base UI's reference composition reserves the space with Control padding (`py-3`). Upstream shadcn base-nova omits it, the same as ours. A vertical slider placed in a flex row shrinks to its 4px track in the same way.
  - Fix: `src/components/Slider.tsx` gives the Control a cross-axis minimum equal to the `size-3` thumb (`data-[orientation=horizontal]:min-h-3`, `data-[orientation=vertical]:min-w-3`). The track stays centred and the root now reserves the thumb's 12px. Focus outlines, hover rings and the `after:-inset-2` hit area remain non-layout decorations.
  - Verification: the new test in `src/components/__tests__/Slider.test.tsx` renders three thumbs (0, 50, 100) in each orientation and asserts zero border-box overflow from the root. Red: horizontal overflow is 4px per thumb. Green after the fix. Fails again with the fix reverted, then green. Removing only the vertical `min-w-3` fails the vertical case on its own. The 48 Slider, Progress and Field stories pass. Overflow measurement moved into the shared `measureOverflow` helper (`src/components/__tests__/helpers.ts`), which the L5 test also uses.
- **✅ L7.** The InputGroup addon is 29.14px tall inside a 28px (or 20px) group (`py-1.5`). Op (R).
  - Verified (2026-10-14): on `inputgroup--search`, the 28px comfortable group holds a 29.14px addon, which is 17.14px of line box plus `py-1.5`. In compact density the 20px group holds 28–30px button addons (`compact-button-sizes`). The inline addon is a centred, unstretched flex item, so the overflow spills above and below the fixed-height group. Its `cursor-text` and click-to-focus box then covers neighbouring content. Upstream base-nova has the same `py-1.5` on a 32px group (a 32px addon in a 30px content box).
  - Fix: `src/components/InputGroup.tsx` moves `py-1.5` from the shared addon classes to the block-start and block-end variants, which still need it. Inline variants use `self-stretch`, so the addon's box is exactly the group's content box (26px comfortable, 18px compact) and `items-center` keeps its content centred. Block-addon geometry is unchanged (8px/6px and 6px/8px padding, same heights, before and after).
  - Verification: the new `src/components/__tests__/InputGroup.test.tsx` covers 28 combinations (2 densities × 2 inline alignments × icon, text, kbd and 4 button sizes) and asserts zero vertical overflow (`measureBlockOverflow`, new in `helpers.ts`). Red: 26 of 28 overflow by 0.58–5px. Green after the fix. Fails again with the fix reverted, then green. The 164 stories across InputGroup, Combobox, Command, Kbd, Spinner, Empty, Input, ButtonGroup and Calendar pass, as do the 30 native Combobox, FormControls, Input and Density tests.
  - Out of scope, not changed: the upstream `has-[>button]:ms-[-0.3rem]` and `has-[>kbd]:ms-[-0.15rem]` negative margins still pull inline addons 3.8px and 1.39px past the group's side borders.
- **✅ L8.** Button `xs` is wider than `sm` in compact density (102 vs 98px), and `icon-sm` draws a 16px icon. Op (R).
  - Verified (2026-10-14): in compact density `button--size-xs` measures 102px and `button--size-sm` 98px. `xs` uses a fixed `px-2` (8px) while `sm` uses density-aware `px-control-x` (6px compact). `icon-sm` has no glyph override, so it inherits the base `size-4` (16px glyph in an 18px compact box), while `sm` buttons draw 14px glyphs. Upstream base-nova `icon-sm` has the same omission. Upstream has no density scale, so its fixed xs padding never inverts.
  - Fix: `src/theme.css` adds `--spacing-control-x-xs` (control-x − 2px) and `--spacing-control-icon-x-xs` (control-x − 4px), keeping upstream's `px-2` against `px-2.5` and icon-edge `1.5` relationships. `src/components/Button.tsx` uses them for `xs` padding and its icon edge, and gives `icon-sm` the `sm` glyph (`size-3.5`). Comfortable geometry is unchanged (xs 102px with 8px and 6px insets). In compact, xs is now 94px with 4px and 2px insets, and `icon-sm` draws 14px.
  - Verification: two new tests in `src/components/__tests__/Button.test.tsx`. The first checks that labelled widths never decrease from xs to sm to default to lg, for both densities with label-only, leading-icon and trailing-icon content. The second checks that every icon-only size draws the same glyph as its labelled size. Red: compact label-only `[102, 98, 98, 98]`; `icon-sm` 16 vs 14 in both densities. Green after the fix. Both fail again with the fix reverted, then green. The 325 stories across 17 Button-consuming files pass; Calendar `DatePickerRange` failed once under parallel load and then passed 35/35 on three isolated reruns. The 62 native tests across InputGroup, Density, Pagination, Calendar, Sidebar, Toast, Sonner, Questionnaire, Dialog, FocusIndicators and Radii pass.
  - Out of scope, not changed: `default`/`lg` (`ps-2`/`pe-2`) and `sm` (`ps-1.5`/`pe-1.5`) icon-edge insets, and the same insets in `src/components/Toggle.tsx`, stay fixed. In compact, the default and lg icon edge (8px) is therefore wider than the label edge (6px).
- **✅ L9.** Switch uses a fractional `h-[18.4px]`. Op (R).
  - Verified (2026-10-14): the default Switch is 18.39px tall. With its 1px transparent border, that leaves a 16.39px track around a `size-4` (16px) thumb, which is centred 0.19px from the top and 0.2px from the bottom. Every row below the switch therefore lands on a fractional y. The `sm` size is flush (14px = 12px thumb + 2px border). Upstream base-nova has the same `h-[18.4px]`; its `rounded-full` track hides the gap, but our `rounded-sm` square thumb does not.
  - Fix: `src/components/Switch.tsx` uses `data-[size=default]:h-[18px]` (16px thumb + 2px border), the same flush relationship `sm` already has.
  - Verification: the new `src/components/__tests__/Switch.test.tsx` renders both sizes, unchecked and checked, and asserts zero top, bottom and resting-edge gap between the thumb and the track's padding box. The track is measured from the bounding rect minus the computed border widths. Red: default top 0.19 and bottom 0.2. Green after the fix. Fails again with the fix reverted, then green. The 40 Switch and Field stories and the 15 native Switch, Field and InvalidIndicators tests pass. `switch--sizes` now measures 32×18 and 24×14 in both densities.
  - Out of scope, not changed: the `switch--sizes` story still places its second row at y 63.25 in comfortable density. That offset comes from the story's 23.1px label line height, not from the Switch.
- **✅ L10.** Badge links show a double focus indicator because there is no `outline-none`. Op (R).
  - Verified (2026-10-14): keyboard-focusing `badge--as-link` computes `outline: rgb(16, 16, 16) auto 1px` with a 1px offset. Chromium's own two-tone focus ring paints on the same pixels as the badge's `border-ring` and `ring-1`, so the indicator has the same thickness but the wrong colour: dark and white instead of the themed ring. This affects both link and button badges. Input carries `outline-none` alongside the same border-and-ring classes; Badge did not. Upstream base-nova's badge also lacks `outline-none`.
  - Fix: `src/components/Badge.tsx` adds `outline-none` to the base classes, so the border-and-ring indicator Badge shares with Input is the only one painted.
  - Verification: `src/components/__tests__/FocusIndicators.test.tsx` adds a test for default-link, link-variant-link and outline-button badges. It reads the badge's settled focused pixels at the same offsets from its frame edge as Input's indicator and requires the same colours. Because a primary badge's border already equals the ring colour, the test reads by offset rather than by changed pixels. The shared capture now waits for `getAnimations()` to settle, so `transition-colors` no longer leaves a mid-transition border colour in the capture. Red: all three cases show Chromium's ring pixels (16,16,16 and 255,255,255) instead of the ring colour (184,22,140). Green after the fix. Fails again with the fix reverted, then green. The 6 FocusIndicators tests and the 60 Badge, Input, Spinner and Card stories pass. `badge--as-link` now computes `outline-style: none` in light and dark themes and shows only the themed ring.
- **✅ L11.** The date picker trigger centres its text; upstream uses `justify-start text-left`. Op (R).
  - Verified (2026-10-14): `calendar--date-picker` renders a 528px-wide trigger. Its icon and label sit 203–208px from the inline-start padding edge across the comfortable, compact, RTL and time stories. Upstream's date picker examples use `justify-start` (and `text-left` on some), so the value reads like a field rather than a centred action. The range and birth-date triggers are `w-fit` and sized to their content, so centring is invisible there.
  - Fix: `src/components/stories/Calendar.stories.tsx` adds `className="justify-start"` to the single, range and birth-date `PopoverTrigger` buttons. Upstream's `text-left` was left out on purpose. It is a physical alignment that would be wrong in RTL, and Button is `whitespace-nowrap` with flex content, so `justify-start` already aligns to the logical inline start.
  - Verification: the `DatePicker` and `DatePickerRtl` plays measure the gap between the trigger's padding edge and its content range, on the inline-start side taken from the trigger's computed `direction`, and require 0. These plays are shared with Compact, Time and TimeRtl. Red: 5 failing with gaps of 203–208px. Green: 16 passed. Fails again with the fix reverted (5 failing), then green. The 83 Calendar, Button and Popover stories pass.
- **✅ L12.** Toggle hover looks the same as pressed. Op (R).
  - Verified (2026-10-14): on `toggle--outline` and `toggle--default`, in both themes, an unpressed toggle while hovered, a pressed toggle at rest and a pressed toggle while hovered all compute the same background: `bg-muted`, light `rgb(224, 228, 234)` and dark `rgb(40, 44, 51)`. Text colour is also the same. While the pointer is over a toggle, its state cannot be read, and hovering a pressed toggle gives no feedback. Upstream base-nova has the same `hover:bg-muted` and `aria-pressed:bg-muted` pairing.
  - Decision (2026-10-15, from the owner via a temporary decision story): pressed fill `primary` (devhost), pressed label weight `regular` (kept at `font-medium`), unpressed hover `muted` (current), pressed hover `dim` (Button precedent), focus indicator `outline` (Button precedent), joined toggle group `merged` (one block accepted). This intentionally diverges from upstream base-nova's muted pressed fill.
  - Fix: `src/components/Toggle.tsx` replaces `aria-pressed:bg-muted` with `aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/80`, matching the default Button's rest and hover surfaces. Focus moves from `focus-visible:border-ring focus-visible:ring-1` to Button's `focus-visible:outline-solid outline-1 outline-offset-1 outline-ring`, and `aria-invalid:ring-destructive` to `aria-invalid:outline-destructive`. Pressed toggles use `aria-pressed:not-aria-invalid:border-transparent`, so the outline variant's `border-input` does not frame the primary fill. The `not-aria-invalid` guard was added because the new border invariant caught that a plain `aria-pressed:border-transparent` overrode `aria-invalid:border-destructive`, which hid the invalid border on pressed toggles. `ToggleGroupItem` already raises the focused item (`focus:relative focus:z-10`), so the offset outline paints above joined neighbours.
  - Verification: `src/components/__tests__/Toggle.test.tsx` adds two native-browser tests. The first, for each theme, requires a pressed toggle's settled rest and real-`:hover` surfaces to equal the default Button's, and an unpressed hover to resolve to `--muted` and differ from the pressed fill. The second, with `aria-invalid` false and true, requires pressed toggles (default and outline variants) to keep the unpressed border at rest. On keyboard Tab it requires Toggle's outline colour, style, width and offset to equal Button's, with the border and box-shadow unchanged from rest. Red: pressed light bg `rgb(224, 228, 234)` instead of `rgb(184, 22, 140)`, and focus drawing a ring box-shadow and `border-ring` with `outline-style: none`. Green: 10 passed. Fails again with the fix reverted (4 failing), then green. The Toggle, ToggleGroup, DirectionProvider, ContextMenu and Calendar stories pass the interaction (76), contrast (304), narrow (74) and reduced-motion (76) suites. No Toggle story is in the visual-regression set, so no baselines change. The decision story was deleted after the answers arrived.
- **✅ L13.** The resizable "Secondary" label touches the grip. Op (R).
  - Verified (2026-10-14): the default Resizable render (`Horizontal`, `Vertical` and `Disabled`) centres an unpadded label in each panel. The `Horizontal` play ends at `{End}`, which leaves the secondary panel at its 20% minimum (76.2px). The 14px mono "Secondary" fills that width, so its first glyph sits against the grip. At `{Home}`, "Primary" is 2.09px from the separator. The other Resizable stories already pad panel content with `p-panel`, and upstream's resizable example pads with `p-6`. This is a story defect; `src/components/Resizable.tsx` is not involved.
  - Fix: `src/components/stories/Resizable.stories.tsx` gives the default render's panel content `p-panel` and wraps each label in a `truncate` span. At the 20% minimum, "Secondary" now truncates to "Seconda…" inside the padding instead of running into the grip.
  - Verification: the `Horizontal` play measures each label's visible extent after `{Home}` and `{End}` (glyph range clipped to the label's own box, so truncated text counts only its visible part). It requires at least 8px (the compact panel padding) from either panel edge. Red: Primary at 2.09px. Green after the fix. Fails again with the fix reverted, then green. All 10 Resizable stories pass.
- **✅ L14.** In RTL, the Avatar overflow label reads "3+". Op (R).
  - Verified (2026-10-14): **Not a defect; no change.** The visual order does reproduce. In `avatar--right-to-left`, the label's computed `direction` is `rtl`, the "+" glyph is at x 520 and the "3" at x 513, so it paints as "3+" (`.tmp/fix/l14-probe.ts`). That is the Unicode Bidirectional Algorithm (UAX #9) working as specified on the logical string "+3". U+002B is class ES and U+0033 is EN (UnicodeData.txt). W4 converts ES to EN only between two ENs, so W6 makes the leading "+" an Other Neutral. N1 then resolves it between the RTL paragraph's `sos` (R) and the EN, which counts as R, so it becomes R. An RTL reader therefore reads "+" first and "3" second, which is the logical "+3". Upstream's own Avatar RTL example (`ui.shadcn.com/docs/components/base/avatar.md`, `AvatarRtl`) passes `"+3"` (Hebrew) and `"+٣"` (Arabic) into `AvatarGroupCount` inside `dir="rtl"`, relying on the same resolution.
  - Not changed: `AvatarGroupCount` renders whatever the caller provides. Forcing `direction: ltr` or an LTR isolate inside the component would override localised content such as Arabic-Indic digits or worded counts. A consumer who specifically wants LTR numerals in an RTL layout can wrap the content in `<bdi dir="ltr">`.
- **✅ L15.** The keep-mounted ScrollArea has no padding. Op (R).
  - Verified (2026-10-14): `scrollarea--keep-mounted` renders a bare `<p>Release 1</p>` in the bordered viewport. Its first glyph sits 0px from the frame's inner block-start and inline-start edges. The Default, Horizontal and BothDirections stories pad their content with `p-panel`, and upstream's scroll-area example pads with `p-4`. This is a story defect; `src/components/ScrollArea.tsx` is not involved.
  - Fix: `src/components/stories/ScrollArea.stories.tsx` gives the KeepMounted paragraph `p-panel`.
  - Verification: the `KeepMounted` play measures the gap between the label's glyph range and the scroll area's inner border edges (block-start and inline-start). It requires at least 8px (the compact panel padding). Red: 0px. Green after the fix. Fails again with the fix reverted, then green. All 8 ScrollArea stories pass.
  - Out of scope, not changed: `NoOverflow` renders the same unpadded `<p>Release 1</p>`.
- **✅ L16.** Secondary button contrast of 1.12:1. Op (R). This is doubtful: the full contrast suite passes. Verify before acting.
  - Verified (2026-10-14): **Not a defect; no change.** The 1.12:1 figure is the secondary fill against the page background, not text. From `src/theme.css`, `--secondary` against `--background` is 1.114:1 in light (`#eef0f3` on `#fcfcfd`) and 1.117:1 in dark (`#1c1f24` on `#121417`). The label, `--secondary-foreground` on `--secondary`, is 16.93:1 in light and 14.33:1 in dark, well above the 4.5:1 text minimum. WCAG 2.2 SC 1.4.11 (Non-text Contrast) does not require that boundary to contrast. The W3C Understanding document says: "This success criterion does not require that controls have a visual boundary indicating the hit area. If a control has visible content (such as text or a sufficiently contrasting icon) … then a border or other indication of the overall boundary of the hit area is not required." Upstream shadcn's default tokens (`docs/theming.md`) make the same choice: `--secondary: oklch(0.97 0 0)` on `--background: oklch(1 0 0)`, about 1.09:1.
  - Not changed: raising the fill to 3:1 would turn the secondary variant into a dark or heavy surface and erase its low-emphasis role next to `default`. An icon-only secondary button meets 1.4.11 through the icon itself. Lucide strokes with `currentColor`, so the icon uses `--secondary-foreground` (the same 14–17:1 pairing).

---

## Storybook examples and story hygiene

Fix these in `src/components/stories/` or `.storybook/`, not in component contracts.

**✅ S1. Fixed-width examples overflow at 320px.**

- Carousel Responsive Sizes: `p-12 w-64` in `stories/helpers.tsx:482,486` pushes the Previous button to x=−16.
- `w-80` examples:
  - Field RTL choice cards (`Field.stories.tsx:435,535`);
  - InputOTP Form (`:316`);
  - Label (`:158`);
  - Card login (`:272`);
  - Accordion RTL (`:259`);
  - MessageScroller (`:62`);
  - Switch RTL description (`:215`), where only 8px of the 32px switch is visible.
- Combobox RTL Multiple: `w-96` at `Combobox.stories.tsx:722`.
- Card Size Comparison: one row with no wrap (`Card.stories.tsx:92`).
- Sources: As.
- Verified (2026-10-14): the problem is catalog-wide, not limited to the listed stories. A Playwright probe loaded all 1001 stories at a 320px viewport and flagged boxes past the viewport's inline edges with no clipping ancestor. 184 stories failed. The listed examples reproduce, except Card Size Comparison: both cards shrink inside the 272px column and nothing overflows. Causes:
  - fixed `w-64`/`w-80`/`w-96` story wrappers wider than the 272px `PreviewFrame` column;
  - button and control rows without `flex-wrap`;
  - unbroken JSON readouts in `<output>`;
  - fixed `min-w-80` popups;
  - the Item separator story's in-row toggle button.
- Fix:
  - 79 fixed story widths gain `max-w-full`. They keep their intended width where there is room and clamp to the column on phones. The same applies to the Carousel helper (`w-64 max-w-full`) and Chart's resize story.
  - Control rows in MessageScroller, Toast, Resizable, Carousel, Command, Badge and Tooltip, plus Combobox's horizontal `Field`, now use `flex-wrap`. Tooltip's row padding becomes `py-32`, so the horizontal padding no longer overflows.
  - The Input and Questionnaire JSON readouts use Tailwind's `wrap-anywhere`. They were originally `wrap-break-word`; S3's `items-start` columns made that insufficient (see S3).
  - Popover and Tooltip Native Callbacks open at `min-w-76` (304px, still wider than Popover's 288px default). Their plays assert ≥304px.
  - Field Responsive's `FieldGroup` takes `max-w-full`. At the 1200px test viewport it is 528px wide, which is still past the 448px `@md/field-group` breakpoint, so the horizontal assertion still holds.
  - Item Native Separator Callback moves its toggle button out of the list, above the `ItemGroup`. The vertical separator now sits between two text-only items that fit at 320px (24..296).
- New check: `bun run test:narrow` (`.storybook/vitest.narrow.config.ts` and `.storybook/narrow.setup.ts`). After each tested story's play function, it resizes the viewport to 320px. It then polls until no rendered box extends past the viewport's inline edges, unless an ancestor clips it with `overflow` or `clip-path`. The suite uses its own Vite cache (`.cache/storybook/tests-narrow`). It is documented in `AGENTS.md`, and it is not part of `bun run test`.
- Exemptions: stories tagged `wide-layout` are excluded through the addon's `tags.exclude`. Four stories carry the tag because their composition is intrinsically wider than a phone column:
  - Calendar Custom Cell Size and its RTL variant: seven 48px cells plus padding, 368px.
  - Sidebar Non Collapsible and Native Input Callback: a static 256px `collapsible="none"` sidebar beside its inset.
  - The RTL Calendar variant declares the tag itself, because Storybook's static CSF indexer does not resolve tags through an object spread.
- Verification:
  - Probe: 184 → 38 → 9 → 5 offending stories. The 5 remaining are the 4 exempt stories plus InputOTP Right To Left (see below).
  - Narrow suite red, with all 97 edits reverted and the original Item story restored: 179 failed, 816 passed across 34 files (`.tmp/fix/s1-narrow-red.log`).
  - Narrow suite green: 994 of 995 passed. The one failure was Calendar Date Picker Range RTL's popover visibility, the flake already noted under L8. A Calendar-only rerun passes 33/33.
  - The regular `vitest.config.ts` suite passes 158/158 across Item, Calendar, MessageScroller, Popover, Tooltip, Field and Sidebar.
  - `oxlint` and `tsc` are clean.
- Out of scope, not changed:
  - InputOTP Right To Left: input-otp widens its hidden `<input>` by 40px and clips the right 40px with `clip-path` (the password-manager badge `increase-width` strategy). In RTL the extra width extends left, so the input sits at −16..192 and does not cover the first (rightmost) digit slot. Hit-testing x=170/185 returns the container `div` in RTL but the `INPUT` in LTR. This is a library bug that needs a dependency patch, so it is set aside. The narrow suite does not flag it because the box is clipped.
  - Sidebar `collapsible="none"` combines a static width with `shrink-0`, which upstream lacks.

**✅ S2. Sortable Table headers are out of line with their columns.**

- The ghost `Button` inside `TableHead` adds a second `px-control-x` with no negative margin to compensate.
- Measured offsets: 10px (Ar, 1280), 11px (Op, 1024), about 7px (As, compact).
- The story line numbers disagree: Ar `107,116`; As `134`; Op `136,146`.
- Sources: Ar, As, Op. Confidence: high.
- Verified (2026-10-14): reproduces in `Table.stories.tsx` (the Email and Amount header `Button`s in `invoiceColumns`). A Playwright probe compared the inline-start edge of each header label's text range with the first body cell's text. The offset was 11px comfortable and 7px compact, at both 1280 and 1024 and in both LTR and RTL. That is the button's `--ag-control-x` padding (10px/6px) plus its 1px transparent border. Upstream's base `data-table-demo` has the same misalignment. Upstream's tasks example compensates in `data-table-column-header.tsx` with `-ml-3 h-8`.
- Fix: both sortable header buttons take `-ms-[calc(var(--ag-control-x)+1px)]`, a logical inline-start margin that cancels the padding and border. The margin uses `--ag-control-x`, as `Attachment` and `Bubble` do, because `var(--spacing-control-x)` resolves at `:root`. A first attempt that used it left compact density 4px off.
- Verification: a shared play assertion, `expectSortableHeadersAlignedWithCells`, checks that each header label's text start is within 0.5px of its column's cell text. It runs in Data Table Sorting, Compact, Right To Left and Compact Right To Left.
  - Red: 4 failed.
  - Green: 12/12.
  - Fix reverted: 4 failed.
  - Green again: 12/12.
  - The probe reports 0px in all four stories, and screenshots confirm it (light comfortable and dark compact RTL).
- Out of scope, not changed: the hover and focus fill of the sortable header now starts at the cell's inline edge, which matches upstream's tasks example.

**✅ S3. `PreviewFrame` has no gap, so siblings touch in about 40 stories.**

- Location: `.storybook/PreviewFrame.tsx:22`, which has no flex or gap.
- Affected stories include:
  - Sonner variants;
  - Dialog controlled;
  - `densityprovider--mixed` (shows `compactcomfortable`);
  - HoverCard controlled;
  - Calendar time zone;
  - Command;
  - InputOTP form;
  - Menubar (`No actionfalse100`);
  - MessageScroller outputs.
- Changing `PreviewFrame` affects every story, so decide deliberately.
- Sources: As, Op ✔.
- Verified (2026-10-14): reproduces. Story roots render as bare block or inline siblings inside the frame column, so buttons, readouts and components meet edge to edge. A measuring probe found the listed stories plus Calendar (15 stories, e.g. "div[calendar] -> output[Selected day] 2.0px"), PersianCalendar, Pagination, InputOTP Form and RTL Form, Input, Textarea and RadioGroup forms, Attachment, Item In Dropdown, AlertDialog, Bubble Typeset Opt Out and the Typeset rhythm and streaming helpers.
- Fix: `PreviewFrame` stays gap-free. A frame-wide gap or `flex` would change the layout of every story, including those whose single root must size itself. Each story now owns its layout instead, using the catalog's two conventions: rows of controls use `flex flex-wrap items-center gap-control-gap` (density-aware), and a component followed by its readout uses `flex flex-col items-start gap-4` (`flex flex-col gap-4` where children must stretch, with the button set to `self-start`). The Command Default border moved to an inner wrapper so the output sits outside the bordered box.
- Verification: a catalog-wide `afterEach` guard in `.storybook/layout.setup.ts`, registered in `.storybook/vitest.config.ts`, polls the frame column's rendered roots after every tested story. It descends through lone story-authored `div`/`form` wrappers that have no `data-slot`, and fails when consecutive siblings are less than 4px apart.
  - Full suite: 997 passed, 2 failed (the known Calendar Date Picker Range and MessageScroller Animated New Turn flakes). Re-running those two files: 52/52.
  - Wrappers reverted: 20 failed (15 Calendar stories, Pagination Default and Compact, Switch Form Submission, InputOTP Form and RTL Form).
  - Restored: 89/89 across Calendar, Switch, InputOTP, Pagination and Checkbox.
- Follow-up (2026-10-15): the final `bun run test:narrow` run found that these wrappers had regressed three S1 stories. A rerun of only those files reproduced the failures deterministically (`.tmp/fix/narrow-rerun-1.log`).
  - An `items-start` column sizes each child to fit its content. `overflow-wrap: break-word` does not lower an element's min-content size, so the Input Profile Form readout (24..448) and the Questionnaire Schema Validation readout (24..352) stayed as wide as their unbroken JSON strings. Both now use `wrap-anywhere`, which Tailwind documents for exactly this case: mid-word breaks count toward the intrinsic size inside flex containers.
  - Chart Portal Legend Direction's new chart-and-legend wrapper sized itself to the chart's 384px. The chart's `max-w-full` then resolved against that 384px wrapper, so the chart overflowed (24..408). The wrapper now carries `max-w-full` as well.
  - Verified: the narrow and regular suites each pass 70/70 across Chart, Input and Questionnaire.
- Out of scope, not changed: the guard only runs in the main Vitest config (not the narrow or visual configs), and it does not look inside components or multi-child wrappers. MessageScroller's Transcript button rows use `gap-2` rather than `gap-control-gap`. DensityProvider's explicit gap assertions partly overlap the generic guard.

**✅ S4. Some stories end in the opposite of their named state.**

- `toggle--pressed` ends with `aria-pressed=false`.
- `checkbox--checked` and `switch--checked` end with `aria-checked=false`.
- In each case the play function clicks the control after it starts in the named state (`Toggle.stories.tsx:36-41`, `Checkbox.stories.tsx:47-52`).
- The RadioGroup `weekly` and `unselected` stories end on "Daily". Op (R).
- Sources: Op ✔.
- Verified (2026-10-14): all five reproduce. Toggle `Pressed`, Checkbox `Checked` and Switch `Checked` start in their named state, then click once and stop on the opposite state. RadioGroup `Weekly` clicks Daily and stops there. RadioGroup `Unselected` presses Space on the focused Daily item and stops with Daily selected.
- Fix: Toggle `Pressed`, Checkbox `Checked`, Switch `Checked` and RadioGroup `Weekly` now go back to their named state after checking that the control can leave it. RadioGroup `Unselected` drops the final Space step. A radio group cannot be cleared through its UI, so the story could not otherwise end unselected. It still checks that nothing is selected, that Tab focuses Daily, and that Enter does not select it.
- Verification: each play now ends by asserting its named state. Red: all 5 fail. Green: 62 passed across the Toggle, Checkbox, Switch and RadioGroup stories. Fails again with the fix reverted (5 failing), then green.
- Coverage trade-off: no story now presses Space on an unselected radio. Base UI implements that behaviour; `src/components/RadioGroup.tsx` adds no keyboard handling.

**✅ S5. Debug output is visible in the catalog.**

- ✔ Accordion Controlled shows `[]`.
- ✔ Sidebar Toolbar shows raw JSON.
- ✔ `empty--without-icon` shows a literal `0` (`Empty.stories.tsx:45`).
- (R) Popover native-form shows `{"width":"240","height":"25"}`.
- (R) DropdownMenu and ContextMenu print state values.
- Sources: Op.
- Verified (2026-10-14): all five reproduce. The readouts were unlabelled `<output aria-label>` elements printing `JSON.stringify` or raw state values (`[]`, `{"state":"expanded",...}`, `true`, `100`, `card`, `date`). The Sidebar Toolbar's buttons and readout ran together on one line. `EmptyMedia` rendered a literal `0`.
- Fix: a shared story helper, `StateReadout` in `stories/helpers.tsx`, renders a visible package `Label` bound to a native `<output>` via `htmlFor`. Accordion, Sidebar, Popover, Menubar, ContextMenu and DropdownMenu stories now use it with human-readable values ("None", "Expanded", "240 × 25", "Shown", "100%", "Credit card", "By date"). The Accordion readout moved outside the `Accordion` root. The Sidebar Toolbar lays the buttons out in a wrapping row above its readouts, padded with `p-panel`. The `EmptyMedia` `0` placeholder is removed from `WithoutIcon`. The play functions now query each readout by its visible label (`getByRole("status", { name })`) and assert the formatted text.
- Verification: red 18 failed / 96 passed across the affected stories; green 114 passed; fix reverted 18 failed; green again 114 passed. oxfmt, oxlint and tsc clean. Screenshots checked for Sidebar, Accordion, Menubar, DropdownMenu Complex, Empty WithoutIcon and Popover.
- Out of scope, not changed: other stories still print raw JSON state (Input, Switch, Checkbox, Textarea, RadioGroup, InputGroup, Field, Questionnaire, Slider, Select, MessageScroller "Available edges"); the review did not list them. ContextMenu Default's stacked full-width trigger buttons are unchanged.

**✅ S6. Calendar time fields show both a decorative clock and the native time-picker icon.**

- Location: `Calendar.stories.tsx:382`.
- Sources: As.
- Verified (2026-10-14): reproduces in Time Inputs and Right To Left Time Inputs. Each field rendered an `InputGroupAddon` with an `aria-hidden` `Clock2Icon` on the inline-start side, plus Chromium's native picker button on the inline-end side. Upstream's base `calendar-example.tsx` keeps the decorative icon and hides the native button with `[&::-webkit-calendar-picker-indicator]:hidden`.
- Fix: both fields are a plain package `Input type="time"` (with `density={args.density}`, like `DatePickerComposition`'s time field). The native picker button stays, because it is the working control; the inert decorative icon and the `InputGroup` are removed. Upstream's approach was not copied because it replaces a working native control with a lookalike that does nothing when clicked, and the `-webkit-` pseudo-element only exists in Chromium and WebKit. The native indicator follows the theme because `theme.css` sets `color-scheme`.
- Verification: the play function asserts that each time input is as wide as its row, so nothing else sits beside the native control.
  - Red: 2 failed (input 202px in a 228px row).
  - Green: Calendar 35/35.
  - Fix reverted: 2 failed. Restored: 2/2.
  - Screenshots (dark compact LTR, light comfortable RTL) show one clock per field.
- Out of scope, not changed: the native indicator's presence and look in other engines (Firefox, WebKit) were not checked; it is whatever each browser draws for `type="time"`.

**✅ S7. The InputOTP Render Callback example is invisible.**

- Location: `InputOTP.stories.tsx:181`.
- Effect: the example renders as 12×0px, with no visible slot, caret or focus indicator.
- Sources: As.
- Verified (2026-10-14): reproduces. The `render` callback output a bare `<span aria-hidden>{slot.char}</span>` per slot, so every span stayed empty until something was typed, and `[data-input-otp-container]` measured 0px high. In render mode, input-otp 1.5.0 calls `render(props)` instead of wrapping children in `OTPInputContext.Provider` (`dist/index.mjs`). The package's `InputOTPSlot` can't be reused there, so the callback has to draw the slots itself.
- Fix: the callback now draws one bordered `size-control` cell per `SlotProps`.
  - Each cell shows `char`, or `placeholderChar` when there is no character.
  - It marks `isActive` through `data-active`, using the same ring as `InputOTPSlot`.
  - It draws the fake caret when `hasFakeCaret` is set, with `motion-reduce:animate-none`.
  - The cells are separated by `gap-control-gap`, so the example still looks distinct from the grouped children API.
- Verification: before typing, the play function checks that the container has height and that all four `pin-slot` cells have a non-zero size. After focusing the input, it checks that the first cell's computed `box-shadow` differs from the three idle cells, which all share one value.
  - Red: the original markup fails ("expected 0 to be greater than 0"). Dropping only the active-state classes fails the focus check ("expected [ 'none', 'none', 'none' ] to not include 'none'").
  - Green: InputOTP 18/18. Fix reverted: 1 failed. Restored: 1/1.
  - The dark compact screenshot shows four cells, with the ring on the active cell.
- Out of scope, not changed: the cell classes repeat the `InputOTPSlot` styling, because the render API exposes slot data but no context the package slot could read.

**✅ S8. The Switch Form Submission example has no visible labels.**

- Location: `Switch.stories.tsx:146`.
- Effect: three switches sit touching each other with no visible labels; only `aria-label` tells them apart.
- Sources: As.
- Verified (2026-10-14): reproduces. The three switches were bare siblings named only by `aria-label` ("Submit notifications", "Unchecked option", "Explicit unchecked value"), with nothing visible to tell them apart. Checkbox Form Submission had the same markup.
- Fix: both forms now use `FieldGroup` with three horizontal `Field`s. Each control gets a `useId`-based `id` and a visible `FieldLabel htmlFor` ("Email notifications", "Weekly digest", "Product updates"), and the `aria-label`s are gone. The submit and reset buttons sit in a `gap-control-gap` row, and the form is a `flex flex-col items-start gap-4` column. The submitted names and values (`notifications`, `omitted`, `fallback` with `uncheckedValue="off"`) are unchanged.
- Verification: the play functions find the first control by its visible label (`getByRole(..., { name: "Email notifications" })`) and toggle it by clicking the label text.
  - Putting back the `aria-label`-only markup on Switch fails Form Submission ("Unable to find an element with the text: Email notifications"). The S3 guard also failed it ("div[field-group] -> div[] 0.0px") when the wrapper was reverted.
  - Green: 89/89 together with the S3 stories.
- Out of scope, not changed: the accessible name of the first control changed from "Submit notifications" to "Email notifications" to match its visible label.

**✅ S9. The Select Native Callbacks example clips its placeholder.**

- Location: `Select.stories.tsx:253`.
- Cause: `w-20` truncates the placeholder to "Select a ru", with no ellipsis.
- Sources: As.
- Verified (2026-10-14): reproduces. "Select a runtime" needs 116px but the placeholder-state value box was 80px (`w-20`). The trigger applies `*:data-[slot=select-value]:line-clamp-1` and then `*:data-[slot=select-value]:flex`, so `display: flex` replaces line-clamp's `-webkit-box`. The text is cut off with no ellipsis.
- Fix: the placeholder state now uses `flex-none w-36` (144px). The selected state keeps `w-32`, so the function-valued `className` still visibly switches widths with `state.placeholder`. In the closed 192px trigger, the value box ends at 191px and the chevron starts at 203px.
- Verification: before opening, the play function checks that the placeholder's `scrollWidth` is no larger than its `clientWidth`.
  - Red: "expected 116 to be less than or equal to 80".
  - Green: Select 27/27. Fix reverted: 1 failed. Restored: 1/1.
- Out of scope, not changed: `SelectTrigger` inherits upstream's `line-clamp-1` + `flex` pairing, so any value wider than its box clips without an ellipsis in every Select. Fixing that is a component change; it is listed under DUE DILIGENCE.

**✅ S10. The Marker StatusExample keeps spinning after completion.**

- Location: `Marker.stories.tsx:171-192`.
- Effect: the status text changes to "Logs checked", but the Spinner is rendered unconditionally and keeps spinning.
- Sources: As.
- Verified (2026-10-14): reproduces. `<Spinner />` sat inside `MarkerIcon` regardless of `isRunning`, so its infinite `animate-spin` kept running after "Finish check".
- Fix: `MarkerIcon` now renders `<Spinner />` while running and lucide's `CheckIcon` once finished. `MarkerIcon` stays `aria-hidden`, so the status's accessible text is still only the `MarkerContent` message.
- Verification: after "Finish check", the play function checks that `status.getAnimations({ subtree: true })` is empty and that the icon slot still holds an SVG with a non-zero width.
  - Red: "expected [ CSSAnimation{} ] to have a length of +0 but got 1".
  - Green: Marker 14/14. Fix reverted: 1 failed. Restored: 1/1.
  - The test does not assert that the spinner animates before completion. The global reduced-motion rule (`theme.css:231`) ends animations at once, so that assertion would fail under `test:reduced-motion`.

**✅ S11. Sidebar story issues.**

- `sidebar--loading` shows a raw-text "Loading projects" header (`Sidebar.stories.tsx:564-587`).
- The layout's `SidebarInput` has no placeholder.
- Sources: Op ✔.
- Verified (2026-10-14): reproduces, and the defect is wider than reported.
  - In the collapsed icon rail, the raw `SidebarHeader` text wraps and paints past the rail, underneath the trigger.
  - The shared layout's `<span>Workspace</span>` header leaks the same way in every story that collapses to icons (Icon Collapse, Floating, Compact Density, Comfortable Density, Inset).
  - `SidebarInput` had only an `aria-label`, with no placeholder.
- Fix (stories): copy now uses the upstream compositions, which hide in icon mode.
  - Layout header: `SidebarGroupLabel` "Workspace" plus `SidebarInput placeholder="Search projects…"`.
  - Loading: the skeletons sit in `SidebarContent > SidebarGroup` (label "Projects") `> SidebarGroupContent > SidebarMenu > SidebarMenuItem > SidebarMenuSkeleton`.
- Fix (component): placing the skeleton in a group exposed a `SidebarMenuSkeleton` defect.
  - In the narrower icon-mode group, the `size-4` icon placeholder had no `shrink-0`, so it was squeezed to 6px, with a 0px label bar left beside it.
  - The skeleton now mirrors `SidebarMenuButton` in icon mode (`justify-center`, `p-0`). The icon placeholder is `shrink-0`, and when an icon is shown the label bar hides in icon mode.
- Verification:
  - The Icon Collapse and Loading play functions wait for the collapse `CSSTransition`s to finish, then assert that no visible text node paints outside the rail. Each text range is clipped by its overflow-clipping ancestors.
  - The Loading play function also asserts that the collapsed skeleton's only visible part is a centred 16×16 icon slot.
  - Red: "expected [ 'Loading projects' ] to deeply equal []"; "expected [ 'Workspace' ] …"; and skeleton parts `width: 6` / `width: 0` instead of `[{ width: 16, height: 16, centreOffset: 0 }]`.
  - Green: Sidebar 23/23. Story markup reverted: 6 failed. Skeleton fix reverted: 1 failed. Restored: 23/23.
  - Screenshots checked: the collapsed Loading rail in dark comfortable and light compact, and the expanded layout with the placeholder.
- Out of scope, not changed:
  - The placeholder text is static content, so it is checked by screenshot rather than by a test.
  - The text-only "Settings" footer `SidebarMenuButton` has no icon, so in icon mode its label is clipped to an unreadable fragment.
  - The Loading story's aside is labelled "Loading projects" while it also contains a "Projects" group label.
  - Sidebar visual baselines change, because of the Workspace label, the placeholder and the skeleton geometry.

**✅ S12. The Chart `portal-legend-direction` legend is detached.**

- Location: `Chart.stories.tsx:518`.
- Sources: Op (R).
- Verified (2026-10-14): reproduces.
  - The story portalled the legend into `document.body`, so it was appended after `#storybook-root`.
  - Measured at 1024px: the chart spans x 248–632 and y 24–280; the "Selected series" output sits at y 296–319; the legend spans the whole body (x 0–1024) at y 343–372, centred 72px off the chart's centre.
- Fix (story only): the legend now portals into a slot the story renders directly below the chart, which is the use the Recharts `portal` prop documents (`Legend.d.ts`: "use this element as a target for rendering using React Portal").
  - The chart and slot share a column wrapper, so the slot takes the chart's width and `ChartLegendContent` centres under it.
  - The slot is captured with a state callback ref. The legend mounts only once the slot exists, because a nullish `portal` makes Recharts render inside the chart wrapper (`Legend.js`: `portalFromProps ?? legendPortalFromContext`).
  - The slot sits outside `ChartContainer`'s `dir="rtl"` element, so the RTL assertion still proves direction comes from chart context rather than DOM inheritance.
- Verification:
  - The play function asserts that the legend is outside the chart element, lies between the chart's bottom and the output's top, and shares the chart's horizontal centre.
  - Red: "expected 372.09375 to be less than or equal to 296".
  - Green: Chart 29/29. Portal target reverted to `document.body`: the same failure. Restored: 29/29.
  - Re-measured: the legend spans x 248–632 at y 280–311, and the output follows at y 327. Screenshots checked in dark comfortable and light compact.
- Out of scope, not changed:
  - `PortalDensity`, `PortalDirection` and `TooltipDirectionOverride` still portal tooltips into `document.body`. Recharts leaves portalled tooltips unpositioned, and those stories assert that deliberately.
  - `ChartLegendContent` renders a generic `<div>`, so the story's `aria-label="Portal legend"` names a role that prohibits naming and is not exposed to assistive technology.

**✅ S13. Some native triggers are unstyled.**

- These triggers don't use `render={<Button/>}`:
  - Dialog and AlertDialog payload;
  - native-callbacks;
  - custom-focus-and-native-render;
  - questionnaire dialog-composition.
- Sources: Op (R).
- Verified (2026-10-14): reproduces.
  - `DialogTrigger`, `DialogClose` and `AlertDialogTrigger` are unstyled primitive wrappers, so without `render={<Button />}` they render a bare `<button>` with Tailwind preflight's transparent background, zero border and zero padding.
  - A catalog probe of all 1001 stories' initial render found bare dialog triggers in exactly the reported stories (for example "Remove Alex" 88×23 and "Configure project" 136×23).
  - Reading the dialog bodies found two bare closes as well: the Dialog native-callbacks "Done" and the Questionnaire "Cancel configuration".
- Fix (stories only):
  - Dialog and AlertDialog native-callbacks, custom-focus-and-native-render and payload triggers render `<Button />`. The custom-focus stories replaced their native `<button type="button" />` render element.
  - The Dialog native-callbacks "Done" close renders `<Button />` and keeps its height callback.
  - Questionnaire dialog-composition renders `<Button />` for "Configure project" and `<Button variant="outline" />` for "Cancel configuration", matching the outline secondary action `AlertDialogCancel` uses.
  - The function-valued `className` callbacks stay on the primitives, so Base UI still evaluates them with native state.
- Verification:
  - New `getLabelInset` helper (`stories/helpers.tsx`) measures the narrower of the inline inset (box width minus the label's text range) and the block inset (box height minus the computed line height). A bare button is as wide as its text or as tall as its line box, so one inset rounds to 0.
  - The affected play functions assert the inset for each trigger and for "Cancel configuration".
  - The Dialog native-callbacks "Done" is stretched by `DialogContent`'s grid and sized by its `h-8` callback, so both insets are positive even when bare. Its play function asserts the computed background is not transparent instead.
  - Red: 7 failures ("expected 0 to be greater than 0"). Green: Dialog, AlertDialog and Questionnaire 72/72.
  - All swaps reverted: the same 7 failures. Only the native-callbacks "Done" reverted: "expected 'rgba(0, 0, 0, 0)' not to be 'rgba(0, 0, 0, 0)'". Restored: 72/72.
  - Screenshots checked for dialog payload, questionnaire dialog-composition and dialog native-callbacks.
- Out of scope, not changed. The probe also listed controls that render without a button frame by design:
  - Calendar and PersianCalendar day cells.
  - Chart interactive and portal legend items.
  - The Marker "Revert change" action.
  - Icon-collapsed Sidebar menu buttons and the workspace-menus dropdown triggers (28×28).

**✅ S14. Some links show the browser's default focus outline instead of a styled ring.**

- Affected: Breadcrumb links, the InputGroup link addon, and the Empty with-search link.
- Sources: Op (R).
- Verified (2026-10-14): reproduces.
  - `BreadcrumbLink`, `EmptyDescription` links and `InputGroupAddon` links had no focus classes. Keyboard focus computed `outline-style: auto`, which is the browser's default focus ring and not the `--ring` token.
  - Upstream base-nova has the same gap for these three links.
- Fix (components):
  - `BreadcrumbLink` adds `outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-ring`.
  - `EmptyDescription` and `inputGroupAddonVariants` add the same classes, scoped to `[&>a]` and `[&>a:focus-visible]`.
  - `outline-solid` is required. In Tailwind v4, `outline-1` resolves its style from `--tw-outline-style`, which `outline-none` sets to `none`.
- Verification:
  - Breadcrumb custom-separator, Empty with-search and InputGroup link-addon tab to the link and assert computed `outline-style: solid` and an `outline-color` equal to the resolved `--ring` (`getRingColor`).
  - The Breadcrumb link has `transition-colors`, which animates `outline-color`, so its assertion waits with `waitFor`.
    - The ring is resolved before the `waitFor` call. `getRingColor` inserts a probe element, which would retrigger `waitFor`'s MutationObserver indefinitely and hang the browser run.
  - Red: 3 failures ("expected 'auto' to be 'solid'").
  - Green: all three stories pass.
  - Only the component classes reverted: the same 3 failures. Restored: green (combined S14/S15 run, 123/123).
- Out of scope, not changed:
  - Alert title and description links (`Alert.tsx:44,60`) have no focus styling.
  - Accordion content links (`Accordion.tsx:78`, `[&_a]`) have no focus styling.
  - Marker's link and button focus classes (`Marker.tsx:9`) combine `outline-none` with `focus-visible:outline-1` and lack `outline-solid`, so they likely render no visible outline. This was not reproduced.

**✅ S15. Content errors.**

- The Accordion RTL story uses English text, so punctuation lands on the wrong side.
- In `input--profile-form`, the Name field shows the email placeholder.
- `breadcrumb--collapsed` mixes "/" and chevron separators.
- The Alert destructive story says "Changes saved."
- Item story args only reach the first item.
- `popover--native-callbacks` has a blank `h-12` band.
- Sources: Op.
- Verified (2026-10-15): all six reproduce.
  - Accordion: the English question in an RTL paragraph renders its first character 287px from the right edge of the first line.
  - The ProfileForm Name `<Input {...args}>` inherits the meta `placeholder: "alex@example.com"`.
  - Breadcrumb Collapsed: the first separator renders "/" and the second the default chevron.
  - The Alert Destructive story reuses the meta render, which says "Changes saved".
  - The Item Default archive link does not spread `args`, so Outline, Muted and Compact style only the first item.
  - Popover NativeCallbacks: the callbacks were `h-12` and `min-h-10`, which add empty height and no visible change.
- Fix (stories only):
  - Accordion RightToLeft uses Arabic copy, and its play function uses the Arabic accessible names. The trigger copy is long enough to wrap in `w-80`, so the multi-line alignment checks still apply.
  - ProfileForm sets `args: { placeholder: "Alex Gorbatchev" }`.
  - Breadcrumb Collapsed uses `<BreadcrumbSeparator />` for both separators.
  - Alert Destructive has its own render: "Unable to save changes" / "Check your connection and try again."
  - Item Default spreads `args` on the archive link item.
  - Popover NativeCallbacks title uses `() => "text-lg"`. The heading token is larger than the popup text in both densities; compact `text-base` equals the 12px popup text. The description uses `() => "italic"`.
- Verification:
  - Accordion: the first character's range rect must end at the first line's right edge.
    - An earlier `caretPositionFromPoint` probe was rejected. It returned offset 0 at the right edge even for English text, so it could not fail.
  - ProfileForm: the Name placeholder must not contain "@".
  - Breadcrumb Collapsed: both separators contain an `svg`.
  - Alert Destructive: checks the alert's text content.
  - Item: the archive link's computed background, border colour and padding must equal the first item's.
  - Popover: the title's computed font size must exceed the popup's, the description must be `italic`, and the title height must stay under two line heights.
  - Red: 8 failures.
  - Green: 123/123 across the S14/S15 story files.
  - Only the story fixes reverted (combined with the S14 revert): the same 8 failures plus the 3 S14 failures. Restored: 123/123.
  - Screenshot of `accordion--right-to-left` checked: right-aligned wrapped Arabic, with the question mark at the visual line end.
- Out of scope, not changed: many other RightToLeft stories across the catalog still use English copy. Only the Accordion story was reported.

**✅ S16. The Item in-dropdown example wraps text.**

- Effect: "Project editor" wraps to two lines inside the dropdown.
- Sources: Ar. Related to conflict C3.
- Verified (2026-10-15): already resolved by M6.
  - The cause was the trigger-width popup (`w-(--anchor-width) min-w-32`), which gave 128px under the "Choose owner" trigger.
  - The popup now sizes to its content, so the menu measures 154px and "Project editor" renders on one line in both densities.
- Fix: none beyond M6. The `InDropdown` play now guards the regression.
- Verification:
  - The `item--in-dropdown` play asserts that the "Project editor" description text has exactly one client rect, i.e. one line.
  - With M6 in place: 15/15 Item stories pass.
  - With only the M6 popup width reverted to `w-(--anchor-width) min-w-32`: In Dropdown fails ("expected DOMRectList … to have a length of 1 but got 2"). Restored afterwards (byte-identical to the backup).

**✅ S17. The Combobox `density-and-direction` story has a stray separator.**

- Effect: a separator renders with nothing after it.
- Sources: Op ✔.
- Verified (2026-10-15): reproduces. The shared meta render ended `ComboboxList` with `<ComboboxSeparator className={separatorClassName} data-testid="Combobox--separator" />` after its only group, so every story using that render (including `DensityAndDirection`) showed a 1px rule 4px below the last option (separator top 205.66, last option bottom 201.66).
  - The component is not at fault: `ComboboxSeparator` is a plain `h-px` rule, matching upstream base-nova. Upstream's timezone example places a separator after every group, so it trails the last group too.
  - Base UI renders `Combobox.Separator` with `role="presentation"` inside the listbox, so `getByRole("separator")` cannot find it; tests use `data-slot=combobox-separator` plus geometry.
- Fix: story-only.
  - The trailing separator is removed from the meta render.
  - `NativePartCallbacks` needed that separator to exercise `separatorClassName`. It now has its own grouped render (`fixture_technologyGroups`) that places `<ComboboxSeparator className={separatorClassName} />` inside the first group only, the same between-groups pattern as the `Groups` story.
- Verification:
  - `DensityAndDirection` play asserts that no `combobox-separator` sits at or below the last option. Red before the fix: "expected [ 205.65625 ] to deeply equal []" (1 failed, 26 passed).
  - `NativePartCallbacks` play asserts the separator lies between the "Deno" option and the "Tools" label, and still asserts `separatorClassName` receives `{ orientation: "horizontal" }`.
  - With the fix: 27/27 Combobox stories pass. With only the trailing separator restored to the meta render: `Density And Direction` fails with the same message. Restored afterwards (byte-identical to the backup).
- Out of scope, not changed: the Select meta render (`Select.stories.tsx:64`) also ends its only group with a trailing `SelectSeparator data-testid="Select--separator"`.

**✅ S18. The `combobox--groups` overlay was never captured by opus.**

- Coverage gap only; no defect is claimed.
- Verified (2026-10-15): captured the open, unfiltered overlay (after the play function selects React, the probe reopens it and clears the input) in light/dark × comfortable/compact at 1024px, plus light comfortable at 375px.
  - The popup spans the full input group (input plus trigger addon; 248–776px at 1024px, 24–351px at 375px). There is no list scroll (`scrollHeight` = `clientHeight`), no option overflow and no page-level horizontal overflow.
  - One 1px separator sits between "Deno" and the "Tools" label in every combination, with none trailing. Options shrink from 28px to 20px in compact.
  - Group labels compute `rgb(75,83,94)` (light) and `rgb(163,171,182)` (dark) muted text, and keep their `px-2 py-1.5` height (27px) in both densities. That padding matches upstream base-nova `.cn-combobox-label`.
- Fix: none needed. The `Groups` play already asserts both groups are visible and that filtering and selection work. S17 added the between-groups separator geometry assertion to `NativePartCallbacks`.
- Out of scope, not changed: Combobox labels use `px-2` while items use `ps-1.5`, so label text starts 2px right of option text. Select, DropdownMenu, ContextMenu and Menubar labels use `px-1.5 py-1`. Both values come from upstream.

**✅ S19. The Bubble story works around the reactions overlap.**

- Location: `Bubble.stories.tsx:287` uses `gap-8` to hide M23.
- Fix the component, then remove the workaround.
- Sources: Ar.
- Resolved with M23: `SpacedReactions` now uses the default `BubbleGroup`, and its play assertion (reaction bottom ≤ next reply top) passes.

---

## Code hygiene

- ✅ **K1.** (Resolved: the duplicate `shadow-frame` is removed from `DropdownMenuSubContent` and `PopoverContent`; no class string in `src/components` repeats it.) `DropdownMenuSubContent` lists `shadow-frame` twice in the same class string. Ar.
- ✅ **K2.** (Resolved: `MenubarSubContent` now passes only `min-w-32 duration-100` and evaluates a function-valued `className` with Base UI state, so the frame border and shadow come once from `DropdownMenuSubContent`.) `src/components/Menubar.tsx:287` repeats `border border-frame-edge` and `shadow-frame` on top of the `DropdownMenuSubContent` it wraps. As.
- ✅ **K3.** (Resolved: the empty directory is removed.) `src/components/ui/` is an empty directory. Ar.
- ✅ **K4.** (Resolved: `just check` rebuilt `storybook-static/` from current source on 2026-10-15. The directory stays untracked and every measurement in this review used the live dev server; see C9.) The `storybook-static/` on disk is stale compared with source (Tabs border, `SelectTrigger` `sm` height). Ar. Regenerate it; never measure against it.
- ✅ **K5.** (Resolved: patches deleted.) The dependency patches add empty `.bun-tag-*` files: five in the shadcn patch and one in the Sonner patch. As.
- ✅ **K6.** (Traced. Package-owned sources removed; the rest are third-party.) Untraced warnings:
  - a React 19 `element.ref` access warning from the review server (As);
  - HH:mm warnings from the Calendar and date-picker time stories (Op);
  - chunk-size and dependency-directive build warnings (As).
  - Trace: a Chromium console sweep of 1001 stories and Docs pages recorded 370 warnings.
    - 64 × "Accessing element.ref was removed in React 19" come from `@storybook/react`'s Docs source generator (`reactElementToJsxString` / `_parseReactElement`). It reads `element.ref` from story args and children that contain elements with refs.
    - 287 × "Accessing the Story Store is deprecated" come from Storybook 10.6.1's preview runtime. Its `storyStore` getter is a deprecating `Proxy`, and `PostMessageTransport.send` touches it while it `JSON.stringify`s channel events.
    - The HH:mm "specified value does not conform" warnings come from user-event typing into native `<input type="time">` in the Calendar play functions. This is browser validation of the typed value; the stories pass.
    - The dependency-directive warnings in the static Storybook build come from `"use client"` in third-party ESM.
  - Package fix: `"use client"` was removed from the 7 package files that carried it. The project is configured with `rsc: false` and does not target React Server Components.
  - Not fixed: chunk-size warnings remain for the preview bundle. That is a Storybook build-output concern, not package output.
- ✅ **K7.** (Resolved: patches deleted; see H1.) The InputOTP patch's ESM and CJS hunks diverge (H1). Minified patches need both entry points verified.

---

## Test and CI gaps

- ✅ **T1.** The checked-in workflows never run the interaction, native, contrast, reduced-motion or coverage suites. Release CI runs only the package-render checks and visual regression. As.
  - Resolved: `.github/workflows/browser-tests.yml` runs a matrix of five jobs: coverage (interactions with the 90% gate), native, reduced-motion, narrow and contrast. It runs on `pull_request`, on pushes to `main`, and through `workflow_call`. Failed jobs upload their artifacts.
  - `npm-release.yml` calls it as a `browser` job, and `publish` now `needs: [visual, browser]`. `AGENTS.md`, `docs/internal/npm-releases.md` and `docs/internal/storybook-pages.md` describe the gate.
  - Not verified: the workflow has not run on GitHub, and `actionlint` is not installed locally. `storybook-pages.yml` still deploys without these suites.
- ✅ **T2.** Visual regression covers only Button, Badge, Card and Input (`.storybook/vitest.visual.config.ts:34`). As, Op.
  - Found while fixing: the existing baselines were stale. 40 Button and Input PNGs no longer matched current source, mostly because of the H3/H5 focus and disabled changes. The visual CI job would have failed. They were regenerated and reviewed.
  - Resolved: 11 deterministic stories gained `tags: ["visual"]`: Progress InProgress and Indeterminate, InputOTP Default and Invalid, Tabs Default and Line, Table DataTableSorting, Textarea Default and Invalid, and NativeSelect Default and Invalid. Their files were added to the `test:visual` filters, which produced 88 new baselines (4 theme/density projects × 2 widths). `docs/internal/visual-regression.md` lists the selection.
  - Verification: the update run passed 96/96, and the comparison run without update passed 96/96. As a red check, removing the Progress reduced-motion indeterminate class failed Indeterminate in all four projects (840 differing pixels); restoring it passed.
  - Limitation: the Storybook Vitest plugin selects stories by statically parsed `tags`. A story that spreads a tagged story (`{ ...Default, args }`), such as Button Secondary, Ghost, Success, Warning, Link and WithIcon, is not selected unless it declares its own `tags`. Those stories remain uncovered.
- ✅ **T3.** Interaction tests assert ARIA state rather than what is rendered. That is why these all pass:
  - H3 and H4 (focus visibility);
  - H6 (Progress);
  - S4 (wrong final state);
  - H11 (right-side Sidebar geometry);
  - H10 (nested density);
  - S10 (Marker spinner);
  - H12 (NavigationMenu directional motion).
  - Sources: As, Op.
  - Resolved: each listed finding now has a test that checks what is rendered. Each test failed with its fix disabled.
    - H3: `Button.test.tsx` (screenshot scanlines).
    - H4: `Slider.test.tsx` (thumb pixels before and after Tab).
    - H6: `Progress.test.tsx` (indicator positions across one animation cycle) and the Indeterminate story's width check.
    - H10: `NestedPortalDensity.test.tsx` (computed gap of a nested portalled Tooltip).
    - H11: the Sidebar `RightSide`, `RightInset` and RTL stories (main-region geometry against the viewport).
    - H12: `NavigationMenu.test.tsx` (per-frame `translate` direction).
    - S4: each play function ends by asserting its named state.
    - S10: the Marker play function asserts no running animations after completion.
- ✅ **T4.** The contrast suite passes despite M7 (chart axis labels) and M1 (OTP slot separation). Contrast tests check text colour pairs, not boundaries between elements. As.
  - Resolved:
    - M1: `InputOTP.test.tsx` checks that the slot border pixel differs from the composited fill, and that characters and placeholders reach 4.5:1 against it.
    - M7: `Chart.test.tsx` checks that every axis tick's computed `fill` equals `text-muted-foreground` in light and dark.
    - Both failed with their fixes reverted.
    - C7 records why axe cannot catch M1: it demotes one-character contrast failures to `incomplete`.
- ✅ **T5.** Astra's evidence lives only in ignored `.tmp/` folders, and its first-pass artifacts are already lost. Findings 1 and 6–9 in astra's report have no saved screenshots. Opus's tooling is in `.tmp/ui-review-a/`. Any finding that matters needs a durable regression test, not a link to `.tmp`.
  - Resolved: every ✅ finding fixed in source records a committed regression test or story assertion, under `src/components/__tests__/` or in the story play functions, together with its red/green and disable-check results. The set-aside dependency defects keep `test.fails` or `!test` stories (see the set-aside table). No resolution relies on `.tmp/` evidence.
- ✅ **T6.** The coverage-gated catalog run (`bun run test:coverage`) failed intermittently under full-catalog load. Found while validating L12; not reported by the reviewers.
  - Verified (2026-10-18): four play functions asserted a state that a transition or deferred frame had not yet reached:
    - MessageScroller `AnimatedNewTurn` ended while "Sent turn 1" was still fading in, so the post-play axe check measured a half-transparent bubble (1.72:1 and 2.03:1).
    - The same play asserted the exact peek offset right after the `translateY` entrance. That outcome depended on the `@shadcn/react` transform defect (throttled-CPU probes settled 1–13px off), now fixed in the vendored fork; see the dependency section.
    - Combobox `PopupInput` asserted input focus as soon as the popup input appeared. Base UI 1.9.0's `FloatingFocusManager` moves initial focus in a microtask and then `requestAnimationFrame` (`enqueueFocus`) on keyboard opens.
    - Calendar `DatePickerRange` (and its RTL variant) asserted `toBeVisible()` during the popover's 120ms fade-in.
    - Sidebar `MobileSheet` (and its variants) asserted the dialog was gone during the sheet's 200ms exit.
  - Fix:
    - Each play now waits for the observable end state: opacity `1`, `transform: none`, focus, visibility or removal.
    - With the fork fix, the play asserts the exact peek offset right after the entrance settles (`transform: none`).
  - Verification:
    - Before: 4 of 7 full coverage runs failed.
    - After: 5 of 5 passed (999/999).
    - Fixes reverted: 1 of 3 runs failed. These are timing flakes, so this check is statistical rather than deterministic.
    - The four story files pass the interaction (102), contrast (408), narrow (98) and reduced-motion (102) suites.

---

## Conflicts to resolve

These claims disagree between reviewers. Measure each against current source before acting on any finding that depends on it.

| #     | Topic                      | Claims                                                                                                                                                                                                                                                             | Resolution needed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1 ✅ | Backdrop blur              | **Ar:** Dialog, AlertDialog and Sheet use `backdrop-blur-xs`; Drawer doesn't. **As:** only Sheet blurs (`Sheet.tsx:39`).                                                                                                                                           | **Resolved (As correct):** only Sheet blurred. Dialog, AlertDialog and Drawer now use upstream base-nova `supports-backdrop-filter:backdrop-blur-xs`; all four compute `blur(4px)`. Test: `src/components/__tests__/FloatingSurfaces.test.tsx`.                                                                                                                                                                                                                                                                                              |
| C2 ✅ | Overlay radii              | **Ar:** Popover, Tooltip and DropdownMenu are 2px, Dialog 4px in §2.7 but 2px in §4.3, so argon contradicts itself. **Op:** Dialog, Popover, Tooltip, DropdownMenu, Select, Drawer and Sonner are 4px; HoverCard, ContextMenu, Menubar and NavigationMenu are 2px. | **Resolved (Op correct):** HoverCard, ContextMenu (and sub), Menubar (content and sub) and NavigationMenu popup were 2px. All now use `rounded-md` (4px), matching Dialog, AlertDialog, Popover, Tooltip, DropdownMenu (and sub) and Select. Drawer (top corners only) and Sheet (edge-anchored, square) are excluded by design. Test: `FloatingSurfaces.test.tsx`.                                                                                                                                                                          |
| C3 ✅ | Menu popup width           | **Ar:** fixed `w-36` (144px). **Op:** about 224px for most menus, about 150px for ContextMenu, 144px for the Select popup. **As:** width comes from the anchor, with a 128px minimum.                                                                              | **Resolved (As correct):** DropdownMenu content is `w-(--anchor-width) min-w-32` (identical to upstream base-nova), measured 128px under a 106px trigger. ContextMenu (no anchor width, `min-w-36`), Menubar and Select measure 144px. Op's ~224px comes from story `min-w-56` overrides; Ar's `w-36` is the `min-w-36` floor. The 128px floor is what causes M6 and S16 (measured: label ends x=126, check starts x=123; "Project editor" wraps to 33px). Since changed by M6.                                                              |
| C4 ✅ | Compact NativeSelect       | **Ar:** NativeSelect's `py-1` is the correct pattern, and `SelectTrigger`'s `py-2` is the problem. **As, Op:** NativeSelect clips with `py-1`.                                                                                                                     | **Resolved (As, Op correct):** compact NativeSelect clips (default clientHeight 18 / scrollHeight 21; `sm` 16 / 19). SelectTrigger's `py-2` content box is nominally 2px, but its flex-centred 17.1px value overflows visibly into the padding and is not clipped (default 18 / 18; `sm` 16 / 17). NativeSelect's `py-1` is not a pattern to copy.                                                                                                                                                                                           |
| C5 ✅ | Play-function failures     | **Op:** failures in Item avatar-group/RTL, `messagescroller--interrupted-response`, `sidebar--mobile-sheet`/`mobile-right-rtl` and `sidebar--non-collapsible`. **As:** the real Vitest suite passes 996/996, in both standard and reduced-motion runs.             | **Resolved (As correct):** the Item, MessageScroller and Sidebar story files pass 52/52 under the Storybook Vitest config, including With Avatar Group, Right To Left Avatar Group, Interrupted Response, Mobile Sheet, Mobile Right Rtl and Non Collapsible. Opus's failures came from its harness (6 workers, fixed 700ms wait).                                                                                                                                                                                                           |
| C6 ✅ | NavigationMenu             | **Op:** "clean". **Ar, As:** see H12 and M17.                                                                                                                                                                                                                      | **Resolved:** "clean" is rejected. H12 and M17 are handled as findings and verified against source when fixed.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| C7 ✅ | InputOTP dark contrast     | **Ar:** 4.57:1. **Op:** 3.92:1. Argon's own hex values (`#eceff3` on `#6f7783`) work out to about 3.92:1, which fails AA. The contrast suite passes InputOTP (As).                                                                                                 | **Resolved (Op correct):** slots compute `rgb(236,239,243)` on `rgb(111,119,131)` = 3.92:1. The suite misses it because axe-core 4.14.0 demotes a _failing_ `color-contrast` result to `incomplete` (`shortTextContent`) when the visible text is one character (`node_modules/axe-core/axe.js` ~31623–31643), and incomplete results don't fail the suite. `aria-hidden` on the slot is not the cause: removing it gives the same result. Every OTP slot holds one character, so the suite can never catch this; M1 needs a dedicated test. |
| C8 ✅ | Line references            | Argon's line numbers are consistently lower than astra's and opus's, which agree. The Table story lines differ across all three.                                                                                                                                   | **Acknowledged:** argon-only line references are treated as approximate. Each item is re-located in source before it is fixed.                                                                                                                                                                                                                                                                                                                                                                                                               |
| C9 ✅ | Argon's measurement target | Argon measured the stale `storybook-static` build (K4). All argon-only pixel values, especially M16 (Tabs) and the `SelectTrigger` `sm` height, may not reflect current source.                                                                                    | **Resolved:** re-measured against the live dev server, which serves current source. `SelectTrigger` `sm` is 18px vs 20px default in compact (M26 not reproducible). M16 reproduces: in the Line story the 2px indicator spans y 53–55 under a list whose bottom edge is y 52 (comfortable). `storybook-static` is regenerated by `just check` (K4).                                                                                                                                                                                          |

---

## Reported as not defects

- **Opus:** sr-only items, avatar overlap and textarea overflow were heuristic false positives. There is no page-level horizontal overflow at 1024px and no missing `@keyframes`.
- **Astra:** Item stories supply list-item semantics on purpose. The Sidebar shortcut inside a text input is tested on purpose. The public build bundles the three patched ESM dependencies on purpose. (Obsolete: the patches are deleted and those dependencies are now external.)
- **Opus rated these families clean or minor:** Marker, AspectRatio, Tooltip, ThemeProvider, DirectionProvider, Kbd, Label, Skeleton, Spinner, Textarea, PersianCalendar, Pagination, Tabs, Card and Collapsible. NavigationMenu was also on this list, but the other two reviewers disagree (C6). Other reviewers raised Pagination (L2), Tabs (M16, D5), Marker (S10) and Card (S1).

## Suggested order of work

1. **Resolve C1–C9** so that fixes don't depend on disputed claims.
2. **Fix High items with regression tests that check what is rendered,** not ARIA state:
   - H1 (both patch entry points; resolved by deleting the patch);
   - H2;
   - H3, H4 and H5 (focus and disabled visibility);
   - H6;
   - H7;
   - H10 (an AGENTS contract);
   - H11;
   - H12 (an AGENTS contract).
3. **Agree on rules for D1–D10,** especially density, focus rings and radii, before fixing the related Medium items one by one.
4. **Clean up the stories** (S1–S19), and decide on the `PreviewFrame` gap.
5. **Close the test gaps** T1–T4 so these classes of regression are caught automatically.
