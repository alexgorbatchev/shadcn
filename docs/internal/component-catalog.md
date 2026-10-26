---
created_on: 2026-10-22 20:55
last_modified: 2026-10-25 10:55
status: current
---

# Component catalog and source adoption

This reference describes the public compositions available to consumers and the source decisions maintainers must preserve. See [upstream test reuse](./upstream-test-reuse.md) for the pinned source inventory and public-test limitations. These components use this package's presentation and APIs; they do not preserve each reference pack's API or every option in its examples.

## Source groups

| ID  | Reference                                                           | Package families                                                                                            | Integration choice                                                                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | shadcn/ui, MIT                                                      | AppShell, PageHeader, WorkspaceSwitcher, AccountMenu, AuthForm, SettingsSection, DashboardLayout            | Compose the package's Base UI Sidebar, Select, Menu, Field, Card, and ScrollArea. AppShell uses the public Sidebar `position="container"` option, which keeps a bounded shell's sidebar inside the shell.                                                                                                                                                                  |
| F2  | ReUI public registry, MIT                                           | DataGrid, FilterBar, Stepper, FileUpload, Tree, Kanban, EventCalendar, Gantt                                | TanStack Table v9 owns data operations; Base UI Tabs owns step navigation; react-dropzone owns native file selection/validation; Headless Tree owns tree behavior. Kanban and Gantt use the package's public drag/drop system and equivalent keyboard controls. React Big Calendar owns calendar layout and navigation. Premium blocks, templates, and icons are excluded. |
| F4  | Kibo UI, MIT                                                        | RichTextEditor, FileUpload, ImageCrop, ColorPicker, TagInput, EventForm, Roadmap                            | Integrate native Tiptap, react-dropzone, react-image-crop, react-colorful, and Base UI Combobox APIs. Roadmap shares controlled items across board, timeline, and list views. Source examples inform composition; upstream wrappers with correctness defects are not copied.                                                                                               |
| F5  | Tremor Blocks, MIT; Tremor component behavior reference, Apache-2.0 | StatCard, BarList, StatusTracker, AnalyticsChart, Sparkline, DashboardLayout, BillingUsage, SettingsSection | Use package Card/Meter/Tooltip compositions and native Recharts through `/chart`. Blocks inform dashboard composition. No Apache-licensed Tremor runtime source is bundled by these additions. Tracker checks await tooltip display and assert callback payloads.                                                                                                          |
| F6  | coss `apps/ui` MIT registry only                                    | NumberField, Toolbar, Meter, DatePicker, DateRangePicker                                                    | Use native Base UI parts and this package's Calendar/Popover. Preserve state-valued `className` and `style`, keyboard behavior, formatting, focus, and density. Toolbar and Stepper disabled presentation follows native data/ARIA state while retaining native focus behavior. No AGPL `packages/ui` source or tests are included.                                        |
| F7  | Mantine UI, MIT, design/example reference                           | Responsive shell, authentication, account/settings, stats and dashboard layouts                             | Consolidate overlapping compositions into the families above. No Mantine runtime or stylesheet is required. Its smoke/axe tests are not treated as interaction coverage.                                                                                                                                                                                                   |

Exact reviewed source revisions and links are in [upstream test reuse](./upstream-test-reuse.md). Attribution and reproduced license notices are in [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md).

## Core imports

The package root exports NumberField parts, Toolbar parts, Meter parts, Stepper parts, TagInput, FilterBar, Kanban, AppShell, PageHeader, WorkspaceSwitcher, AccountMenu, AuthForm, SettingsSection, StatCard, BarList, StatusTracker, DashboardLayout, and BillingUsage.

NumberField's noninteractive viewport scrub cursor uses Base UI's document.body portal and resolves density through React context. Its viewport portal is independent of custom popup containers.

AppShell owns the bounded application frame and main ScrollArea. Its `navigation` entries are ordinary links; consumers own routing. WorkspaceSwitcher and AccountMenu report selections/actions. AuthForm, SettingsSection, EventForm, and BillingUsage call consumer handlers; they do not implement authentication, persistence, billing, or network upload services.

Stepper uses manual tab activation by default: arrows move focus and Enter/Space selects a step. Disabled steps remain unavailable. Consumers own validation and which steps are complete. The completed indicator supplies a visual check; consumers should give steps meaningful labels.

TagInput is a multiple-selection Combobox over supplied string options. Its change handler receives Base UI's native value and event details. Chip removal has a specific accessible label; `ComboboxChip.removeLabel` is also public.

FilterBar supplies controlled search and single-value facets with a clear action. Consumers apply those values to domain data. It is not a query-language parser.

Kanban receives controlled items, ordered columns, and `onItemsChange`. Column selectors and up/down buttons offer keyboard equivalents to dragging. `canMove` is domain validation. Board drag types are scoped to each instance, so an unrelated board cannot transfer cards accidentally. Consumers must keep IDs unique and column IDs valid.

StatCard's `changeIntent` describes a positive, negative or neutral outcome independently of the change text's sign. A decrease in churn can therefore use positive presentation.

## Optional imports and costs

| Import               | Consumer peers                                                                                             | Ownership                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/calendar`          | `@daypicker/react@^10.0.2`                                                                                 | Calendar, DatePicker, DateRangePicker; native Date values, controlled/uncontrolled selection, and native locale objects shared by the trigger and calendar. Named hidden inputs participate in FormData and are disabled with their controls.                                                                                                                                                                           |
| `/chart`             | `recharts@3.8.0`, `cssesc@3.0.0`, `es-toolkit@1.52.0`                                                      | Native chart parts, AnalyticsChart, Sparkline. Disable data animation in the supplied compositions so reduced motion is respected.                                                                                                                                                                                                                                                                                      |
| `/data-grid`         | `@tanstack/react-table@9.2.8`                                                                              | DataGrid, DataGridCells, DataGridColumnHeader, DataGridColumnOptions, DataGridFilter, DataGridFilters, DataGridFilterSummary, DataGridPagination, dataGridFeatures. Create a native `useTable` instance with `dataGridFeatures`; supply typed columns, explicit row IDs, and column layout and filters through the feature set's typed `meta`. Native header/cell templates own selection controls and actions.         |
| `/virtual-data-grid` | `@tanstack/react-table@9.2.8`, `@tanstack/react-virtual@3.14.13`                                           | VirtualDataGrid renders all filtered and sorted rows through VirtualTable with fixed column sizes, keyboard and pointer column resizing, and consumer row wrappers. Column widths follow CSS variables written from the sizing atom, following TanStack's performant column-resizing example.                                                                                                                           |
| `/file-upload`       | `react-dropzone@^20.1.4`                                                                                   | FileUpload accepts native Dropzone validation, acceptance, rejection and error callbacks. It does not start uploads, fabricate progress, or retain an upload queue.                                                                                                                                                                                                                                                     |
| `/color-picker`      | `react-colorful@^5.8.1`                                                                                    | ColorPicker owns optional uncontrolled hex state; the engine owns color conversion, alpha and keyboard/pointer controls. Disabled picker surfaces are inert.                                                                                                                                                                                                                                                            |
| `/image-crop`        | `react-image-crop@^11.1.2`                                                                                 | ImageCrop preserves native crop props, callbacks, percentages, keyboard movement and crop export helpers. Import `react-image-crop/dist/ReactCrop.css`. Consumers own the image, crop state, CORS and saving.                                                                                                                                                                                                           |
| `/tree`              | `@headless-tree/core@^1.8.0`, `@headless-tree/react@^1.8.0`                                                | Tree renders the native instance from `useTree`. Configure loading, selection, expansion and actions with native features. Default selection uses Control+Space. App drag/drop coordination remains the package's public drag/drop API.                                                                                                                                                                                 |
| `/editor`            | `@tiptap/core@^3.32.0`, `@tiptap/react@^3.32.0`, `@tiptap/pm@^3.32.0`, `@tiptap/starter-kit@^3.32.0`       | RichTextEditor receives a native editor. The caller configures extensions, content, accessible textbox attributes and persistence with `useEditor`; use `immediatelyRender: false` for SSR. The supplied toolbar requires StarterKit's bold, italic, list and history capabilities.                                                                                                                                     |
| `/event-calendar`    | `date-fns@^4.4.0`; calendar runtime is included; TypeScript also needs `@types/react-big-calendar@^1.16.3` | EventCalendar preserves native accessors, localizers, resources, callbacks and views. The default localizer is en-US in the browser's local time zone. Import `/event-calendar.css`. Event wrappers use native buttons; overflow drills down instead of opening an unmanaged portal. EventForm validates required inputs and end-before-start ranges in the browser, awaits the save callback and reports its failures. |
| `/gantt`             | `date-fns@^4.4.0`, `@date-fns/tz@^1.5.0`                                                                   | Gantt and Roadmap. Civil-day timeline, day/week/month display scales, explicit time zone, inclusive end dates, progress, clipping, task selection, dragging and keyboard shifting. Date shifts preserve wall-clock time over DST and return ordinary Date objects. Consumers own editing, dependency scheduling, resources and persistence.                                                                             |

All these peers are optional and external. Their development copies support Storybook and validation. Tiptap installs ProseMirror and its extension closure; React Big Calendar brings moment, moment-timezone, dayjs, luxon, globalize and both lodash packages even when the selected localizer is date-fns; date-fns contains a substantial function catalog. Tree shaking reduces shipped application code, not installed `node_modules`, so these features never enter the core import graph. No new regular runtime dependency is required.

### Editor example

```tsx
import { RichTextEditor, StarterKit, useEditor } from "@alexgorbatchev/shadcn/editor";

export function DescriptionEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: "<p>Describe the project.</p>",
    editorProps: {
      attributes: { role: "textbox", "aria-label": "Description", "aria-multiline": "true" },
    },
  });
  return <RichTextEditor label="Description" editor={editor} />;
}
```

## Styling and validation

Compositions use semantic palette classes, package radius tokens, the monospace font, density variables, framed existing popups and explicit scroll viewports. Pointer-driven behavior remains in the maintained engines or the existing drag/drop implementation. Color gradients and image masks depict edited content; their colors are not application palette choices.

Behavioral stories cover selection, keyboard navigation, controlled clearing, form validation/submission/failure, formatting, file rejection, image export, tree expansion/selection, editor history, table operations, roadmap view synchronization, calendar navigation and tooltips. Native browser tests exercise Kanban/Gantt dragging, rejected moves and DST shifts. NumberField checks exercise native mouse scrubbing when pointer lock is denied, formatting, keyboard stepping and value commits. Playwright's absolute mouse coordinates produce cursor resets in the local pointer-lock automation and do not establish physical raw-pointer behavior while locked; that hardware path needs manual review. The AppShell height regression is checked with its fix enabled and with only that fix disabled.

Use the repository validation commands from AGENTS.md. Coverage measures the local runtime source, not the internals of external peers. Contrast checks cannot establish image-content contrast, canvas export quality, the meaning of supplied status colors, or arbitrary consumer content; retain the manual-review limits in [accessibility.md](./accessibility.md).

## Upstream defects avoided

Kibo's reviewed ColorPicker maps controlled RGB channel values into hue/saturation/lightness state and uses truthiness fallbacks that discard valid zero values. The package integrates react-colorful instead.

Kibo's reviewed ImageCrop size retry changes a `scaleFactor` that does not change canvas dimensions or drawing. An oversized result can recurse repeatedly. The package exports react-image-crop's native canvas/image helpers and does not copy that retry.

ReUI's reviewed Stepper trigger unregistration tests whether a null ref is already in an element array, leaving stale trigger entries. The package uses Base UI Tabs' maintained focus management instead.

## Calendar runtime ownership

React Big Calendar 1.20.0 is bundled, as a development dependency, because its uncontrollable 7.2.1 wrapper uses an obsolete JSX transform. The version-pinned Bun patch replaces the wrapper's compiled element creation with React's JSX runtime in both ESM and CommonJS builds, preserving controlled/uncontrolled state, callbacks, and ref forwarding. The package build bundles the calendar, wrapper, and their runtime dependencies; React and declared peers remain external. Bundling preserves the calendar’s dependency resolution instead of relying on the consuming application’s hoisted versions. A clean npm consumer verifies warning-free navigation and selection in development and production without applying Bun patches.

This exception adds the calendar's dependency tree to core-only installations. Keep the implementation isolated behind the optional feature entry point. When upstream ships a corrected wrapper, remove the patch and bundled-build exception, restore the calendar as an optional peer with a development dependency, and verify browser interactions, declaration consumers, and clean npm consumers before removing the bundled implementation. See [upstream issue 2785](https://github.com/bigcalendar/react-big-calendar/issues/2785).
