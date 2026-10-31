> [!IMPORTANT]
> **AI agents:** Before using this package, run the following command from the consuming project and read the linked setup and component documentation:
>
> ```sh
> cat node_modules/@alexgorbatchev/shadcn/llms.txt
> ```
>
> Resolve the index's relative links from `node_modules/@alexgorbatchev/shadcn/`.

`@alexgorbatchev/shadcn` is a standalone React component library for Bun applications that need the sharp, monospace devhost design language. Install it as an npm-compatible package and explore its components in the local interactive Storybook catalog. Consuming apps do not depend on the devhost project.

# What It Does

- **Consistent controls**: Provides buttons, forms, selections, navigation, overlays, and loading states.
- **Two densities**: Offers compact 20px controls and comfortable 28px controls, with provider and component overrides.
- **Theme choices**: Supports light, dark, and system preference, with customizable accent colors and fonts.
- **Interactive reference**: Shows component variants and states in Storybook with editable controls and source examples.

# How It Works

1. Install the package in a Bun React project and import its theme into your Tailwind stylesheet.
2. Wrap the app in a theme provider and a density provider, then compose the exported components.
3. Open the local Storybook catalog to explore components, switch palettes and densities, and inspect examples.

# How it Really Works

1. The stylesheet supplies semantic tokens and base body styling. Your Tailwind build scans the installed package to generate component utilities. Font loading is optional; importing `fonts.css` serves JetBrains Mono through your app's asset pipeline.
2. Theme preference persists in browser local storage, and system mode follows the operating system color preference. The theme provider sets `data-theme` and `color-scheme` on the document root, so dialogs and menus share that palette. Use one provider per document. Density also follows components into their portals. A component's `density` prop overrides its own presentation; nest a `DensityProvider` to change a subtree and its popups together. A provider declares every density token, so its subtree keeps its density whatever an ancestor or a host page declares. It renders a `div` by default; pass `render`, such as `render={<section aria-label="Tools" className="flex gap-2" />}`, to make your own element the density root instead of adding a wrapper. `useTheme()` throws outside `ThemeProvider`.
3. Storybook's Theme and Density toolbars change the component examples. Docs backgrounds and example frames follow the selected palette; the preview starts in dark mode with comfortable density.

# Prerequisites

- [Bun](https://bun.com/docs), validated with 1.4.2.
- [React](https://react.dev) and React DOM 19.3, as specified by the package peer dependencies.
- [Tailwind CSS](https://tailwindcss.com/docs/installation) v4; the consumer build must process the imported theme.

The package targets client-rendered Bun React applications.

# Installation

Install the package and the libraries its core components use. The package installs no third-party packages itself, so the consuming project owns every dependency version:

```sh
bun add @alexgorbatchev/shadcn @base-ui/react@^1.9.0 @base-ui/utils@0.5.0 class-variance-authority@^0.7.1 clsx@^2.1.1 lucide-react@^1.53.0 tailwind-merge@^3.7.0 tw-animate-css@^1.4.0 usehooks-ts@^3.1.1
```

Package preparation and contributor commands are documented in [AGENTS.md](./AGENTS.md#commands).

## Optional features

Import shared controls and providers from `@alexgorbatchev/shadcn`. Import the following features from their dedicated entry points and install only the peers you use. These features, their hooks, and their types are not exported from the package root.

| Import path suffix   | Components                                                           | Install alongside the package                                                                       |
| -------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/analytics`         | AnalyticsProvider, AnalyticsScope, AnalyticsImpression, useAnalytics | Existing core peers; no vendor SDK                                                                  |
| `/json-render`       | JSON Render component registry and catalog                           | `bun add @json-render/core@0.21.1 @json-render/react@0.21.1 embla-carousel-react@^8.6.0`            |
| `/chart`             | Chart parts, AnalyticsChart, Sparkline, hooks and types              | `bun add recharts@3.8.0 cssesc@3.0.0 es-toolkit@1.52.0`                                             |
| `/calendar`          | Calendar, CalendarDayButton, DatePicker, DateRangePicker             | `bun add @daypicker/react@^10.0.2`                                                                  |
| `/persian-calendar`  | PersianCalendar                                                      | `bun add @daypicker/persian@^10.0.2 @daypicker/react@^10.0.2`                                       |
| `/carousel`          | Carousel components, useCarousel, and carousel types                 | `bun add embla-carousel-react@^8.6.0`                                                               |
| `/command`           | Command components, including CommandDialog                          | `bun add cmdk@^1.1.1`                                                                               |
| `/resizable`         | Resizable components and SplitView                                   | `bun add react-resizable-panels@^4.14.3`                                                            |
| `/fonts.css`         | JetBrains Mono font stylesheet                                       | `bun add @fontsource-variable/jetbrains-mono@^5.3.0`                                                |
| `/sonner`            | Sonner, SonnerToaster, Toaster, toast, useSonner                     | `bun add sonner@2.0.8`; the patched runtime is bundled                                              |
| `/input-otp`         | InputOTP components                                                  | `bun add input-otp@1.5.0`; the patched runtime is bundled                                           |
| `/virtual-table`     | VirtualTable and row measurement props                               | `@tanstack/react-virtual@3.14.13`                                                                   |
| `/message-scroller`  | MessageScroller components, hooks, and types                         | `bun add @shadcn/react@0.3.1`; the patched runtime is bundled                                       |
| `/questionnaire`     | Questionnaire components and types                                   | `bun add @shadcn/react@0.3.1`; the patched runtime is bundled                                       |
| `/data-grid`         | DataGrid, column picker, and native table helpers                    | `bun add @tanstack/react-table@9.2.8`                                                               |
| `/virtual-data-grid` | VirtualDataGrid and row measurement props                            | `bun add @tanstack/react-table@9.2.8 @tanstack/react-virtual@3.14.13`                               |
| `/file-upload`       | FileUpload selection and validation                                  | `bun add react-dropzone@^20.1.4`                                                                    |
| `/color-picker`      | ColorPicker                                                          | `bun add react-colorful@^5.8.1`                                                                     |
| `/image-crop`        | ImageCrop and native export helpers                                  | `bun add react-image-crop@^11.1.2`                                                                  |
| `/tree`              | Tree, native hooks and features                                      | `bun add @headless-tree/core@^1.8.0 @headless-tree/react@^1.8.0`; patched runtimes are bundled      |
| `/editor`            | RichTextEditor, native Tiptap hooks and StarterKit                   | `bun add @tiptap/core@^3.32.0 @tiptap/react@^3.32.0 @tiptap/pm@^3.32.0 @tiptap/starter-kit@^3.32.0` |
| `/event-calendar`    | EventCalendar, EventForm and native calendar APIs                    | `bun add date-fns@^4.4.0`; TypeScript: `bun add -d @types/react-big-calendar@^1.16.3`               |
| `/gantt`             | Gantt and Roadmap                                                    | `bun add date-fns@^4.4.0 @date-fns/tz@^1.5.0`                                                       |

Import `@alexgorbatchev/shadcn/event-calendar.css` for EventCalendar, and `react-image-crop/dist/ReactCrop.css` for ImageCrop. The root also provides application shells, dashboard and billing layouts, authentication/settings forms, account/workspace controls, Kanban, facets, tags, number fields, toolbars, meters, stat cards and status displays. See the [component catalog reference](./docs/internal/component-catalog.md) for source groups, native APIs, dependency costs and consumer responsibilities.

For example:

```tsx
import { Button, DensityProvider } from "@alexgorbatchev/shadcn";
import { ChartContainer, type ChartConfig } from "@alexgorbatchev/shadcn/chart";
import { Carousel, CarouselContent, CarouselItem } from "@alexgorbatchev/shadcn/carousel";
```

A production install of this package adds no third-party packages: every library is an optional peer that consumers install themselves, or is bundled into the package. Core peers are listed under Installation; feature peers are listed per entry point above. The patched `sonner`, `input-otp`, `@shadcn/react`, and Headless Tree runtimes, and the calendar with its patched `uncontrollable` wrapper, are bundled so consumers receive the fixes even when their package manager does not apply Bun patches. Install their upstream peers for the types the declarations reference; the tree runtime stays behind `/tree` and the calendar runtime behind `/event-calendar`. Import tree hooks and features from this package's `/tree` entry point so they use the bundled native implementation. Install `@base-ui/utils` at the exact version `@base-ui/react` requires, so the portal components share Base UI's own ref merging without a second copy. Shared providers work across entry points.

The optional assistant-ui catalog provides presentational families under `/assistant-ui/<family>` and runtime adapters under `/assistant-ui/native/<family>`. For example, import `ApprovalCard` from `@alexgorbatchev/shadcn/assistant-ui/approval-card`. Add `@alexgorbatchev/shadcn/assistant-ui.css` to your stylesheet. Native threads require an actual assistant-ui runtime and the selected family's optional peers. See the [assistant-ui reference](./docs/internal/assistant-ui.md) for imports, dependency-bearing styles, source inventory, and the SelectionToolbar isolation limitation.

For embedded surfaces, import `PortalProvider` from the package root and pass the real overlay `container`. Dialogs, alerts, sheets, drawers, menus, navigation popups, comboboxes, selects, hover cards, tooltips, popovers, and Base UI toasts inherit that container. The container applies to the outermost popup: a popup opened inside another one, such as a select in a dialog, renders inside that popup's portal, where a modal dialog counts it as inside the dialog and keeps it reachable by assistive technology and the pointer. Native portal props can still supply an explicit container override.

## Configurable analytics

Wrap the application in an optional analytics provider and supply your own transport:

```tsx
import { Button } from "@alexgorbatchev/shadcn";
import { AnalyticsProvider, AnalyticsScope, type IAnalyticsTransport } from "@alexgorbatchev/shadcn/analytics";

function Settings({ transport, consent }: { transport: IAnalyticsTransport; consent: boolean }) {
  return (
    <AnalyticsProvider transport={transport} enabled={consent}>
      <AnalyticsScope name="settings" properties={{ surface: "account" }}>
        <Button analytics={{ id: "save-settings" }}>Save</Button>
      </AnalyticsScope>
    </AnalyticsProvider>
  );
}
```

The transport implements `track(event)` and may return a promise. The app owns vendor SDKs, identity, consent, and delivery. Components emit semantic UI events without extracting labels, values, URLs, or user content. Use `analytics={false}` for a control or a disabled scope for a subtree. Display components require explicit `AnalyticsImpression` observation. See the [event contract and catalog coverage](./docs/internal/analytics.md).

# Quick Start

For Bun's native HTML server, install its Tailwind plugin:

```sh
bun add -d tailwindcss bun-plugin-tailwind
```

The stylesheet example below also uses the optional font:

```sh
bun add @fontsource-variable/jetbrains-mono@^5.3.0
```

Register the plugin in your app's `bunfig.toml`:

```toml
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

In `src/styles.css`, import the theme after Tailwind and explicitly scan the installed package. The `@source` path is relative to this stylesheet; Tailwind excludes `node_modules` from automatic scanning. See [Tailwind source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources).

```css
@import "tailwindcss";
@import "@alexgorbatchev/shadcn/theme.css";
@import "@alexgorbatchev/shadcn/fonts.css";
@source "../node_modules/@alexgorbatchev/shadcn/dist";
```

Omit the `fonts.css` import if your app supplies its own font. Bun's plugin registration is documented in [HTML and static sites](https://bun.com/docs/bundler/html-static#tailwind-css).

The theme sets `body { position: relative; }`. Preserve a positioned body when overriding global styles: Drawer's absolute Safari backdrop needs it to cover a scrolled page. See the [Base UI Safari setup](https://base-ui.com/react/overview/quick-start#ios-26-safari).

Give your application root `isolation: isolate` so page stacking levels stay below portaled menus and dialogs. For example, add `#root { isolation: isolate; }` to the stylesheet when mounting React into `#root`. SidebarProvider also isolates its own layout. See [Base UI portal setup](https://base-ui.com/react/overview/quick-start#portals).

Import that stylesheet from your app entry, then render:

```tsx
import { useState, type ReactElement } from "react";
import { Button, DensityProvider, ThemeProvider } from "@alexgorbatchev/shadcn";
import "./styles.css";

export function App(): ReactElement {
  const [count, setCount] = useState(0);
  return (
    <ThemeProvider defaultTheme="system">
      <DensityProvider density="comfortable">
        <Button onClick={() => setCount(count + 1)}>Clicked {count} times</Button>
        <Button density="compact" variant="outline">
          Compact action
        </Button>
      </DensityProvider>
    </ThemeProvider>
  );
}
```

For a Vite consumer, install the maintained React and Tailwind plugins:

```sh
bun add -d vite @vitejs/plugin-react @tailwindcss/vite tailwindcss
```

Use this `vite.config.ts`, with the same stylesheet imports and `@source` declaration above:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

An independent production Vite consumer installed from the archive verifies RTL grouped corners, tab markers, and portaled controls with `lang="en"`. Bun’s native CSS pipeline has the logical-property limitation described below. See the [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite).

# Configuration

| Option                       | Type                            | Default                         | Description                                                            |
| :--------------------------- | :------------------------------ | :------------------------------ | :--------------------------------------------------------------------- |
| `ThemeProvider.defaultTheme` | `"light" \| "dark" \| "system"` | `"system"`                      | Initial preference when storage has no saved value.                    |
| `ThemeProvider.storageKey`   | `string`                        | `"shadcn-alexgorbatchev-theme"` | Local storage key for the preference.                                  |
| `ThemeProvider.forcedTheme`  | `"light" \| "dark"`             | unset                           | Overrides the displayed palette without changing the saved preference. |
| `ThemeProvider.preset`       | `"devhost" \| "shadcn"`         | `"devhost"`                     | Document-wide design preset, independent of color mode and density.    |
| `DensityProvider.density`    | `"compact" \| "comfortable"`    | `"comfortable"`                 | Density for descendants and their portals.                             |
| Component `density`          | `"compact" \| "comfortable"`    | inherited                       | Local override on styled components that expose the prop.              |

`useTheme()` returns `theme`, `resolvedTheme`, `setTheme`, and `preset`. Call `setTheme("light")`, `setTheme("dark")`, or `setTheme("system")` from a component inside the provider.

Use `<ThemeProvider preset="shadcn" defaultTheme="system">` for the [default shadcn Neutral palette](https://ui.shadcn.com/docs/theming), system sans-serif text, and its rounded corner scale. The default `devhost` preset uses the package's monospace design and sharp corners. Both presets support light, dark, and system modes, including portaled content. Code retains the monospace font. Density, component composition, and package-specific status colors remain independent of the preset.

The preset is controlled by the prop; changing it updates the document without changing the saved color-mode preference. Persist that prop in your application if needed. Storybook exposes the same choice in its **Design** toolbar. For a page styled before React mounts, set `data-theme-preset="shadcn"` and `data-theme="light"` or `"dark"` on `<html>` to match the provider. The existing `theme.css` import and `@source` setup cover both presets.

Override tokens after the theme imports. This example uses the existing success palette as the primary accent:

```css
:root,
[data-theme="light"],
[data-theme="dark"] {
  --ag-font: ui-sans-serif, system-ui, sans-serif;
  --primary: var(--success);
  --primary-foreground: var(--success-foreground);
  --ring: var(--success);
}
```

# Local React Prototypes

The package includes `shadcn-prototype`, a local runner for editable React mockups. Its generated workspace includes a preview host and complete dashboard, editable project directory, and settings recipes. Helpers and sample data are included; the recipes do not import Storybook files.

1. Create a workspace using Bun:

   ```sh
   bunx --bun --package @alexgorbatchev/shadcn shadcn-prototype workspace create ./mockups
   ```

2. Install its declared dependencies and start the preview:

   ```sh
   cd mockups
   bun install
   bun node_modules/.bin/shadcn-prototype workspace start .
   ```

3. Edit a recipe under `src/prototypes/`, or copy a recipe folder and update its `prototype.ts`. The preview discovers each folder automatically. Use the workbench controls for scenarios, themes, density, viewport sizes, and reset. Open screen gives a direct URL to the canvas.

4. Run `just check` in the generated workspace to typecheck and build. `dist/` contains the static site. Preview requires Bun; the `just` recipes require [just](https://just.systems).

The runner creates a new directory and rejects existing destinations. It does not install dependencies automatically. The generated manifest pins this package to the runner's version and declares the libraries used by the recipes and preview. The component package's dependency-installation contract is unchanged. State is in memory and resets when the canvas reloads; the recipes do not contact real services.

| Command                        | Options                                            | Behavior                                                                            |
| ------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `workspace create <directory>` | `-h, --help`                                       | Write a complete workspace to a new directory.                                      |
| `workspace start [directory]`  | `-p, --port <number>` (default 5173), `-h, --help` | Run the local preview; directory defaults to `.`. Port 0 chooses an available port. |
| `workspace build [directory]`  | `-h, --help`                                       | Build static output; directory defaults to `.`.                                     |
| `skill`                        | `-h, --help`                                       | Print the agent skill installation instructions.                                    |
| Root                           | `-V, --version`, `-h, --help`                      | Show the package version or command tree.                                           |

Use `AGENT=1` for concise agent output. Read the [prototype agent skill](./skills/shadcn-prototype/SKILL.md) for the complete workflow, URL parameters, environment, and error handling. The generated recipes are runnable consumer examples; the Storybook excerpts below remain component references.

# LLM Documentation

Storybook serves a generated `llms.txt` index at its site root, with linked setup instructions and a reference page for each story file. Pages contain public package imports, documented story controls, default args, and Storybook CSF examples with interaction tests omitted. The excerpts can depend on local helpers and fixtures; each page links to its full source. Story controls describe the configured controls, rather than the complete TypeScript props API.

The npm package includes the same index at `llms.txt` in its root and its linked pages under `llms/`. Package and Storybook builds regenerate these files from the public exports, README, and story catalog.

# Component Catalog

| Area                     | Components                                                                                                                                                                                    |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions and status       | Alert, Badge, Button, ButtonGroup, ButtonLink, Sonner, Toast, Toggle, ToggleGroup                                                                                                             |
| Forms and selections     | AuthForm, Calendar, Checkbox, Combobox, Command, EmailCodeAuthForm, Field, Input, InputGroup, InputOTP, Label, OptionSelect, Questionnaire, RadioGroup, Select, Slider, Switch, Textarea      |
| Structure and navigation | Accordion, AspectRatio, Avatar, Breadcrumb, Card, Carousel, Chart, Collapsible, Empty, Item, Kbd, Menubar, NavigationMenu, Pagination, Resizable, ScrollArea, Separator, Sidebar, Table, Tabs |
| Layout and typography    | AppShell, Container, Grid, GridItem, Heading, PageHeader, PageIntro, Stack, Text                                                                                                              |
| Data display             | WeatherForecast, WeatherSummary                                                                                                                                                               |
| Overlays                 | AlertDialog, ContextMenu, Dialog, Drawer, DropdownMenu, HoverCard, Popover, Sheet, Tooltip                                                                                                    |
| Loading                  | Progress, Skeleton, Spinner                                                                                                                                                                   |
| Conversations            | Attachment, Bubble, Marker, Message, MessageScroller                                                                                                                                          |
| App configuration        | DensityProvider, DirectionProvider, ThemeProvider                                                                                                                                             |

Use the composed parts exported from the package root, such as `DialogTrigger`, `DialogContent`, and `DialogTitle`. Storybook provides working compositions, variants, disabled states, and action callbacks. The local preview starts with `bun run storybook` and binds to `127.0.0.1:6006`.

Set `wrap` on `ItemTitle` to keep complete titles visible in narrow items, including long names without spaces. The default title presentation remains unchanged.

`ToggleGroup` supports optional single selection by default and independent selections with `multiple`. Set `required` for a single selection that stays pressed when activated again by pointer, Space, or Enter. Required groups accept exactly one initial item through the controlled `value` or uncontrolled `defaultValue` tuple and cannot use `multiple`. Empty selection requests are canceled through Base UI before consumer callbacks or analytics run; accepted changes retain the native array value and event-details API. This selection rule does not add form submission or validation behavior.

`ScrollArea` supplies a native scroll viewport and one vertical `ScrollBar` by default. Set `scrollbars={<ScrollBar orientation="horizontal" />}` for a wide horizontal layout, or supply a fragment containing vertical and horizontal parts for both axes. The tracks stay outside the viewport and reserve their shared corner. `keepMounted` belongs to `ScrollBar`; root and track className callbacks receive native overflow/scroll state. Focus the viewport for native keyboard scrolling.

Scrolling is intentional: cards, panels, dialogs, sheets, and floating surfaces carry `data-scroll="none"`. Put long content in a nested `ScrollArea` or an explicitly styled native scroll viewport; the outer surface stays stationary. `DialogContent` bounds its height to the viewport and uses a flex column, so give a nested `ScrollArea` `className="min-h-0"` to let it shrink within the dialog. Headers and footers stay outside that scroll area when they need to remain visible.

`ThemeProvider` mounts the development-only `ScrollGuard`. Without a theme provider, mount `<ScrollGuard />` once in your app. Add `data-scroll="none"` to any HTML element to apply the same check. The guard throws a browser error identifying the element, axis, and scroll range when computed `overflow: auto` or `scroll` permits overflowing content to scroll. It checks the marked element itself, including portaled elements in the same document, after content and size changes; nested scroll viewports remain independent. Hidden and clipped overflow do not trigger it. Duplicate mounts share one observer per document, and the final unmount disconnects it. Pass `ownerDocument` to check an iframe's document; shadow roots require their own layout validation. The guard installs no observers when the consuming application's `NODE_ENV` is `"production"`.

`ButtonLink` renders a native anchor with Button's `variant`, `size`, `align`, `truncate`, `fullWidth`, and `density` options, so navigation keeps the link role, Enter activation, and browser link behavior without `role="button"`. Pass `href` for a plain link, or a router link element through `render`, such as `<ButtonLink variant="outline" render={<Link to="/settings" />}>Settings</ButtonLink>`; class names, children, handlers, and refs merge with the rendered element. Its render callback receives typed slot and density state. Mark icons with `data-icon="inline-start"` or `data-icon="inline-end"` as in Button. Use `Button` for actions that do not navigate.

`Badge` renders a span by default. Use `render={<a href="https://base-ui.com/" />}` for navigation or a native button for actions; handlers and refs merge with the rendered element. Its render callback receives typed variant, density, and slot state. Mark icons with `data-icon="inline-start"` or `data-icon="inline-end"`; their spacing follows inline direction. Use the success and warning variants for those statuses.

Compose `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, and `CardFooter` inside `Card`. Use a native heading inside `CardTitle` when the title belongs in the document outline. The `size="sm"` option reduces spacing; density controls the base inset. A leading image meets the frame without top padding, and cards without footers retain bottom padding. The `--card-spacing` CSS variable adjusts both section gaps and insets.

`Label` retains native explicit and implicit associations and refs. Connect it to an input with `htmlFor` and the input's `id`, or wrap the input. Prefer `FieldLabel` in Field compositions. For disabled styling, mark a wrapper with `className="group"` and `data-disabled="true"`, or mark a preceding disabled control with `className="peer"`. `Skeleton` supplies a visual placeholder and respects reduced-motion preference; your loading region owns status announcements and `aria-busy`, and replaces placeholders when content arrives.

Compose forms with `FieldGroup`, `Field`, labels, descriptions, and `FieldError`. The Field catalog demonstrates React Hook Form controllers with Zod validation, invalid-field focus, submission, and reset. To use that example, install `react-hook-form@7.89.0`, `@hookform/resolvers@5.9.1`, and `zod@4.6.5` in your app. These are optional example dependencies. The example uses `noValidate` to demonstrate schema errors; choose your app's browser-validation policy explicitly. `FieldError` deduplicates messages and omits alerts when the errors contain no nonempty messages. See the [official form guide](https://ui.shadcn.com/docs/forms/react-hook-form).

`Input` exposes Base UI's native props, including `onValueChange`, state-based className/style callbacks, `render`, and refs. `Textarea` uses native HTML textarea props and `onChange`; its content sizing grows and shrinks with text. Both support browser form submission, validation, disabled/read-only states, and uncontrolled reset. Restore controlled values through your form's reset handler. Input's field-state callbacks require Base UI's native Field context; the styled `Field` composition is an HTML layout.

Compose grouped controls with InputGroupInput or InputGroupTextarea, then place InputGroupAddon after the control in the DOM. Its align prop positions content at inline-start/end or block-start/end. Clicking addon text focuses the control; caller click handlers still run, and preventDefault cancels that focus. Links and buttons retain their own focus. InputGroupInput preserves Input’s native props and callbacks; InputGroupButton preserves Button’s native callbacks and defaults to type="button". Set type="submit" or type="reset" explicitly for form actions. Small text/icon actions fit the group frame in both densities. See the [official Input Group guide](https://ui.shadcn.com/docs/components/base/input-group).

`Checkbox` and `Switch` support controlled `checked`/`onCheckedChange`, initial `defaultChecked`, read-only and disabled states, cancellable changes, and state-based className callbacks. Named controls submit through their native hidden inputs; `uncheckedValue` supplies an explicit off value. For forms with reset actions, own the checked state and restore it in the form's `onReset` handler or through your form library. Base UI 1.9.0's uncontrolled Checkbox and Switch retain their rendered checked state on native form reset while their hidden inputs reset, so submitted values can disagree with the visible controls. The Switch thumb follows inline direction and stays inside its track in both sizes.

`RadioGroup` uses `value`/`onValueChange` for controlled selection and `defaultValue` for initial selection. Name the group and each option; use `FieldSet`/`FieldLegend` and `Field`/`FieldLabel` for visible labels. Arrow keys select options and skip disabled items; Space selects a focused option. Both the group and `RadioGroupItem` preserve native state-based className and style callbacks. Use `nativeButton` with `render={<button type="button" />}` for sibling labels on button-rendered items. `name`, `required`, and `form` connect selection to browser form submission and validation, including an external form. The required-form story restores controlled selection through `onReset`.

`Select` supports single, multiple, and object values through its native generic props. Pass `items` to display labels instead of raw values; provide object comparison and serialization through `isItemEqualToValue` and `itemToStringValue`. Disabled options remain focusable while rejecting selection. Read-only selection permits browsing and blocks value changes. The composed parts preserve state-based className callbacks, and portaled content follows density and DirectionProvider context. Named multiple selects submit repeated form entries. Restore controlled values in your form's reset handler. Bun-built RTL menus currently place the selection checkmark on the wrong side; verify that layout in consuming apps. See the [Base UI Select reference](https://base-ui.com/react/components/select).

`Combobox` retains native filtering, single/multiple selection, cancellation, controlled values, object identity comparison, and keyboard focus. Give its input an accessible name; an input inside the popup uses a named trigger. `ComboboxInput.className` belongs to the native input and accepts its state callback; use `frameClassName` for the surrounding InputGroup. Built-in controls use “Open popup” and “Clear selection”; customize them with `triggerLabel` and `clearLabel`. Chips use density metrics, and their removal button is named “Remove item”. Keep `ComboboxEmpty` mounted so its polite live region can announce results. In grouped lists, pass `items={group.items}` to each `ComboboxGroup`. Popup density and direction follow their providers, including through portals; reduced motion disables popup animations. See the [Base UI Combobox reference](https://base-ui.com/react/components/combobox).

`Slider` preserves scalar, mutable-array, and readonly-array value types and callbacks. Use `getAriaLabel` to name each thumb and `getAriaValueText` for custom spoken values. Vertical sliders accept an explicit height; `step`, `largeStep`, `minStepsBetweenValues`, and `format` retain native behavior. Named ranges submit a repeated entry for each thumb. Restore controlled values through your form's reset handler. See the [Base UI Slider reference](https://base-ui.com/react/components/slider).

`Dialog` traps keyboard focus by default, closes on Escape or an outside press, and restores focus when dismissed. Set `disablePointerDismissal` to block outside dismissal. `modal={false}` permits outside interaction and closes when focus leaves; `modal="trap-focus"` preserves Tab cycling while permitting outside pointer interaction. `AlertDialog` blocks outside dismissal; Escape and Cancel request closing. `AlertDialogAction` is a button: your app controls confirmation and closing. Use native `initialFocus` and `finalFocus` refs for custom focus targets. Both compositions preserve typed trigger payloads, state-based className callbacks, native render/ref behavior, density/direction in portals, and reduced-motion preference. Bun-built RTL Dialog close icons currently remain on the right; verify their placement in consuming apps. See the [Dialog](https://base-ui.com/react/components/dialog) and [Alert Dialog](https://base-ui.com/react/components/alert-dialog) references.

`Tabs` supports horizontal and vertical layouts. Its default keyboard behavior moves focus with arrow keys and activates with Enter or Space; `TabsList activateOnFocus` activates as focus moves. Disabled tabs remain focusable and reject activation. `TabsContent keepMounted` preserves panel inputs while hidden. Uncontrolled selection falls back when the active tab is removed or disabled. `Accordion` uses an array of expanded values, with `multiple` for independent panels. Its disabled native button triggers are skipped by Tab, as are disabled Collapsible triggers; enabled Accordion headings remain in the Tab order. Native className callbacks are preserved throughout both compositions, and AccordionContent applies its className to the native panel. Panel height follows dynamic content and reduced-motion preference. The current Bun consumer renders a vertical RTL line-tab marker on the wrong side; the same story passes under Storybook's Vite pipeline, so inspect RTL marker placement in Bun-built apps.

Compose a date picker from `Popover`, `Button`, and `Calendar`. The Calendar catalog demonstrates selection with popup dismissal and focus restoration, ranges, birth-date dropdowns, presets, a native time input, and editable date inputs. Input examples use `chrono-node` for strict dates or natural-language phrases such as “tomorrow”; install that dependency in apps using those examples. Invalid or cleared text clears the selected date. ArrowDown opens the calendar, and dismissal restores input focus. Keep the selected date in your app's state; there is no separate `DatePicker` export. See the [official date picker guide](https://ui.shadcn.com/docs/components/base/date-picker).

For rendered HTML or Markdown output, import `@alexgorbatchev/shadcn/typeset.css` after Tailwind and the package theme, then wrap the content in a native element with `className="typeset"`. Text follows its container's font size, document palette, and density leading. Set `--typeset-size`, `--typeset-leading`, and `--typeset-flow` in your own preset to tune reading rhythm. Your layout owns the content width. Add `not-typeset` or `data-not-typeset` to keep embedded UI and nested containers outside the prose styles. Wide tables can use a named, keyboard-focusable `typeset-scroll` wrapper; bare tables retain table semantics and wrap to fit. The Storybook Typeset composition page demonstrates these contracts. See the [official Typeset guide](https://ui.shadcn.com/docs/typeset).

Compose data tables with the exported Table parts and `@tanstack/react-table@9.2.8`, installed directly in your app. `Table dir="rtl"` sets both column direction and the overflow container's reading edge; headers align to the inline start. The Table catalog demonstrates TanStack v9's native `useTable` with sorting, filtering, pagination, column visibility, selection across pages, and row actions that copy invoice IDs or open invoice details. Pass the checkbox's original event to the row-selection handler to retain Shift range selection. There is no separate `DataTable` export. Both the [TanStack v9 quick start](https://tanstack.com/table/latest/docs/framework/react/quick-start) and [shadcn composition guide](https://ui.shadcn.com/docs/components/base/data-table) use the v9 API.

Compose `Sidebar` and `SidebarInset` inside `SidebarProvider`. Use Header, Content, Group, Menu, and Footer parts to organize navigation, and `SidebarTrigger` or `SidebarRail` to toggle it. `useSidebar` exposes desktop and mobile state. Desktop collapse supports `offcanvas`, `icon`, and `none`; the mobile panel uses a titled Sheet with Escape dismissal and focus restoration. Menu buttons accept native custom elements through `render`; use anchors for navigation and keep their accessible text when collapsed. Cmd/Ctrl+B toggles the sidebar while focus is inside its provider. Set `open`/`onOpenChange` for controlled desktop state, or observe changes without supplying `open`. Persist changes in your application through `onOpenChange`, and restore them through `defaultOpen` or controlled `open`. Set widths through the typed `SidebarStyle` variables `--sidebar-width`, `--sidebar-width-mobile`, and `--sidebar-width-icon`. Sidebar colors follow the palette of the subtree they render in; set `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, or `--sidebar-ring` to give the sidebar its own colors.

`InputOTP` uses one real input for typing, selection, paste, and autofill. Compose its visual slots inside `InputOTPGroup`; supply `maxLength` and an accessible label. Use `defaultValue` to initialize an uncontrolled code, or `value` and `onChange` to control it. Changing `defaultValue` after mounting preserves the current input. Import the OTP parts together from `@alexgorbatchev/shadcn/input-otp`; its bundled implementation owns their context. `EmailCodeAuthForm` from the same entry point is passwordless sign-in in two steps: the email step calls `onRequestCode(email)`, and the code step collects a numeric code of `codeLength` digits (default 6) and calls `onVerifyCode(email, code)` when the code is complete or submitted. It offers Resend code and Use a different email, shows pending state while a handler runs, and shows a rejected handler's message without leaving the current step. `Calendar` supports single, multiple, and range selection. `ResizablePanelGroup` sizes use explicit percentage strings such as `defaultSize="50%"`; numeric sizes are pixels. `CommandDialog` supplies the modal title and description; set `Command`'s `label` to name its search input.

Use the Theme toolbar to select light, dark, or system palettes; Docs and example frames follow that selection. Local and routed previews can run on separate ports with independent dependency caches. Reload an open preview after restarting it on a different port.

`Carousel` supports horizontal, vertical, and right-to-left navigation. Focus its named region to use the arrow keys; arrow keys inside slide inputs retain their input behavior. Supply `opts` and `plugins` for carousel configuration, and `setApi` to receive its API. Reduced-motion preference disables programmatic slide animation.

Compose `ChartContainer`, `ChartTooltip`, and `ChartLegend` with Recharts components. Import the chart parts from `@alexgorbatchev/shadcn/chart` and install its peers listed above. Give the container a height or aspect ratio; `ChartConfig` supplies series labels, icons, and either one color or light/dark colors. Use semantic values such as `var(--primary)` and keep `accessibilityLayer` enabled for keyboard tooltips. Use `labelKey` and `nameKey` for custom tooltip data, and legend content's `nameKey` for custom legend labels. Keep series selection in application state; the tooltip's `defaultIndex` only sets its initial state.

Supply HTML attributes and refs to tooltip or legend content through `htmlProps`; Recharts injects its own chart props into those content components, so those props do not go to the DOM. An `onClick` legend callback renders keyboard-accessible buttons. Omit the tooltip's `portal` prop for native floating positioning; custom portal targets own their positioning through the native `wrapperStyle` API. Tooltip and legend content preserve chart density, direction and configured colors through portals. A container's `dir` overrides DirectionProvider context, and content's `htmlProps.dir` overrides the chart direction. Reverse Recharts' `XAxis` explicitly for RTL data ordering; native keyboard movement follows that axis. See the [Chart guide](https://ui.shadcn.com/docs/components/base/chart).

For notifications, mount `Sonner` (also exported as `Toaster` and `SonnerToaster`) inside `ThemeProvider` and call `toast.success("Saved")`. Use one host per document, or give hosts unique `id` values and target them with `toasterId`. `ToastToaster` provides the separate Base UI composition: call `useToastManager()` inside its provider, or create a manager with `createToastManager()` and pass it through `toastManager`. Both compositions provide actions, dismissal, promise feedback, and density overrides. The Base UI manager uses `{ title: "Uploading" }` for promise titles; a plain string sets the description.

Sonner inherits `DirectionProvider` and accepts an explicit `dir` override. Use `mobileOffset={{ left: 24, right: 40 }}` for independent mobile margins. To update a notification in place, retain the ID returned by `toast.loading()` and pass it as `id` to `toast.success()` or `toast.error()`. Sonner's `cancel` option accepts `{ label, onClick }` and dismisses the notification after the callback.

For Base UI notifications, retain the ID from `manager.add()` and call `manager.update(id, options)`; adding an existing ID updates that notification in place. `onClose` signals dismissal and `onRemove` signals removal after the exit transition. A provider's `limit` keeps older notifications mounted but inactive until space becomes available.

Set Sonner's `expand={false}` to show a collapsed stack that expands on hover. Older notification content stays hidden while collapsed; cards retain their width. Per-notification `onAutoClose` and `onDismiss` callbacks receive the notification, including its ID. Native timers pause while hovering the host. Use `toast.custom((id) => ...)` for custom content and `toast.dismiss(id)` from its action.

Import `Sonner`, `toast`, and `useSonner` together from `@alexgorbatchev/shadcn/sonner`. The package bundles a patched Sonner 2.0.8 implementation that remeasures open notifications after density changes, preserving their IDs and running timers. A separate direct import from `sonner` uses a different notification store.

`Bubble` provides seven visual variants, start/end alignment, grouped replies, and overlapping reactions. Compose interactive content with `BubbleContent render={<button type="button" />}` or a native anchor. Leave extra space between replies with reactions, such as `BubbleGroup className="gap-8"`; layout overrides replace the package's density spacing utilities. `Marker` presents conversation notes, statuses, bordered rows, and labeled dividers. Use `role="status"` for updates, and `render` for native links or buttons. Labeled dividers retain their text semantics; their lines are decorative. Icons in `MarkerIcon` are hidden from assistive technology. Separator labels wrap inside narrow columns; use `className="flex-col"` on Marker to stack its icon above the content.

For a Bubble tooltip or popover, keep `BubbleContent` outermost: `render={<TooltipTrigger render={<button type="button" />} />}` or the corresponding `PopoverTrigger`. This preserves the content slot used by Bubble variant styles. Base UI tooltips are visual only; give the trigger an accessible name containing the same information. Put essential error or delivery details in a popover or inline content. See the [native tooltip recommendations](https://base-ui.com/react/components/tooltip#recommendations). `MarkerContent shimmer` animates a pending status and restores static readable text under reduced motion.

Compose `MessageAvatar` and `MessageContent` inside `Message`; the content holds an optional `MessageHeader`, a Bubble or other surface, and an optional `MessageFooter`. Set `align="end"` for an outgoing reply. Headers stay at the content's start; surfaces and footers follow alignment. Avatar placement tracks the rendered footer height and spacing, including live density and content changes. `MessageGroup` stacks consecutive replies; an empty `MessageAvatar` reserves alignment space for earlier replies from the same sender.

`Attachment` displays file metadata and a caller-controlled state: `idle`, `uploading`, `processing`, `error`, or `done`. It provides three sizes, horizontal or vertical layout, and icon or image media. Uploading and processing titles shimmer; reduced-motion preference leaves static readable text. The exported theme includes the required shimmer and scroll-fade utilities. `AttachmentTrigger` fills the card with a native button or an element supplied through `render`, while `AttachmentAction` remains independently clickable. Give triggers and icon actions accessible labels and include the error reason in `AttachmentDescription`. `AttachmentGroup` provides a snapping scroll row; add `tabIndex={0}`, `role="group"`, and an accessible label when the items have no interactive controls.

Place `MessageScroller` inside `MessageScrollerProvider` and a container with a defined height. Wrap every regular transcript row in `MessageScrollerItem` with a stable `messageId`; set `scrollAnchor` for a new turn. The viewport is a named keyboard-scrollable region, and content is a live log for added rows. `defaultScrollPosition` opens at the start, end, or last anchor. Auto-scroll is opt-in; wheel scrolling, scroll keys and pointer interaction release following, and the reader can return with the scroll button. Older rows preserve the current reading position when prepended. The three exported hooks provide commands, available edges, and visible rows/current anchor. Scroll buttons become inert at their target edge and use instant scrolling under reduced-motion preference. Rows use normal layout because the registry's content-visibility optimization makes message jumps and history preservation unstable in the verified browser tests; this package does not claim the upstream optimization's long-transcript performance.

For virtualized history, use `MessageScrollerViewport` as the virtualizer's scroll element. Let the virtualizer own row measurement, positioning and indexed jumps; use block content with its total height instead of wrapping virtual rows in `MessageScrollerItem`. The Storybook `VirtualizedHistory` example uses TanStack Virtual with 1,000 rows and expandable content. The application supplies that optional dependency.

To animate a sent row, the `AnimatedNewTurn` example uses `motion.create(MessageScrollerItem)` from Motion, preserving its ref, stable `messageId` and `scrollAnchor`. Animate transform and opacity with a tween; keep the streamed reply in a regular row. Anchoring uses the row's layout position, so its entrance translation does not change the target. Disable the entrance when the reader prefers reduced motion. Motion is an optional application dependency; the component package does not import it.

Server-rendered transcripts opening at `end` or `last-anchor` remain hidden through `data-pending-scroll` until hydration applies their position; `start` remains visible. Keep the same transcript and opening position on the server and client. The [upstream guide](https://ui.shadcn.com/docs/components/base/message-scroller#avoiding-a-flash-on-reload) also describes an optional application-owned inline script for first-paint `end` positioning; that script is outside this package's verified hydration path.

Import the scroller parts and hooks together from `@alexgorbatchev/shadcn/message-scroller`. Its bundled native implementation preserves both caller root refs and the frame's scroll-state attributes; hooks imported directly from a separate `@shadcn/react/message-scroller` module use a different provider context. `scrollToMessage(id)` can queue a permalink before transcript rows mount; a true result means accepted or queued, rather than already visible. After rows mount, an unknown ID returns false. Anchors can mark system events as well as replies. The current-anchor hook retains the most recent anchor that has reached its tracking boundary, even after that row scrolls above the viewport.

Bun 1.4.0's CSS bundler lowers logical positioning to language-based selectors. A plain CSS reproduction confirms that `dir="rtl"` with inherited `lang="en"` positions a logical inline-end marker on the wrong side; production CSS contains the same lowering. This affects Bubble reactions and vertical line-tab markers. Direction changes independent of language remain a Bun consumer limitation. The Storybook/Vite build preserves native logical positioning. See [Bun's CSS lowering documentation](https://bun.com/docs/bundler/css#dir-selector).

Compose `QuestionnaireItem`, `QuestionnaireTitle`, and answer controls inside `Questionnaire`, which renders a native form. `QuestionnaireChoice` supplies native radios or, with `multiple`, checkboxes; label every `QuestionnaireInput`. Read answers with `FormData.get()` or `getAll()`. `QuestionnaireProgress` and the Previous, Skip, Next, and Submit parts follow the active item. Optional steps need an answer or an explicit skip; observe `onStatusChange` to distinguish skipped answers. Letter and number shortcuts select answers without advancing. Use `item`/`onItemChange` for controlled navigation and `invalid` for external validation. Draft defaults and native reset restore initial answers and navigation. These parts accept density overrides and native render/ref props where supported. See the [upstream composition guide](https://ui.shadcn.com/docs/components/base/questionnaire).

# Page layout

Compose screens from layout components instead of utility classes. Each one accepts `render` for a semantic element, such as `render={<section aria-label="Members" />}`, `<ul />`, `<li />`, `<form />`, or `<main />`; props, handlers, and refs merge with the rendered element.

- `Stack` arranges children along one axis. `direction` is `vertical` (default) or `horizontal`, or a breakpoint map such as `{ base: "vertical", md: "horizontal" }`. `gap` and `padding` take the density-aware spacing tokens `none`, `control`, `panel-sm`, `panel`, `field`, and `section`. `align`, `justify`, and `wrap` position children. `grow` takes the remaining space of a parent `Stack` and lets its content shrink; `height` is `auto`, `full`, `viewport`, or `min-viewport`.
- `Grid` lays out equal columns: `columns` is 1–6 or 12, or a breakpoint map such as `{ base: 1, md: 2, xl: 4 }`. `minColumnWidth` (`xs`, `sm`, `md`, `lg`) instead fits as many columns as the grid's own width allows, so card grids adapt inside narrow panes. `GridItem span` widens a cell; `span="full"` always spans every column.
- `Container` centers a column with a maximum `width` (`xs` 20rem, `sm` 24rem, `md` 42rem, `lg` 64rem, `xl` 80rem, or `full`).
- `Text` renders body copy as a paragraph with semantic `size`, `tone`, `weight`, `align`, `truncate`, and `tabular` options; use `render={<span />}` for inline text. `Heading` renders `h1`–`h6` from its required `level`, with a `size` chosen independently of the outline level.
- `ScrollArea grow` scrolls inside the remaining space of a parent `Stack`.

A header row with trailing actions, a two-column form, and a centered sign-in page:

```tsx
import {
  AuthForm,
  Button,
  Container,
  Field,
  FieldLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
  Textarea,
} from "@alexgorbatchev/shadcn";

<Stack direction="horizontal" justify="between" align="center" gap="control" wrap render={<header />}>
  <Heading level={2}>Members</Heading>
  <Button>Invite</Button>
</Stack>;

<Grid columns={{ base: 1, md: 2 }} gap="field" render={<form onSubmit={save} />}>
  <Field>
    <FieldLabel htmlFor="first-name">First name</FieldLabel>
    <Input id="first-name" />
  </Field>
  <Field>
    <FieldLabel htmlFor="last-name">Last name</FieldLabel>
    <Input id="last-name" />
  </Field>
  <GridItem span="full">
    <Field>
      <FieldLabel htmlFor="notes">Notes</FieldLabel>
      <Textarea id="notes" />
    </Field>
  </GridItem>
</Grid>;

<Stack height="min-viewport" align="center" justify="center" padding="panel" render={<main />}>
  <Container width="sm">
    <AuthForm onSubmit={signIn} />
  </Container>
</Stack>;
```

`AppShell` navigation items take either `href` or `render`, a router link element such as `{ id: "plans", label: "Plans", render: <Link to="/plans" />, active: true }`; the router element owns its destination and client-side navigation while the item keeps its active state, `aria-current="page"`, and activation analytics. `content="scroll"` (default) places children in a padded scrolling column; `content="fill"` gives them the remaining area without padding or scrolling, for full-height screens that manage their own scroll regions.

`WeatherSummary` shows one day's forecast: a `label`, a `condition` from `clear`, `partly-cloudy`, `cloudy`, `fog`, `drizzle`, `rain`, `snow`, or `thunderstorm` with its icon, `high` and `low` temperatures in `unit` (`celsius` by default), and an optional `precipitationProbability` from 0 to 100. Values are rounded and formatted with `Intl` for `locale`; `conditionLabel` localizes the condition name. `WeatherForecast` renders several days, each with an `id`, as a list named by `label`: `variant="strip"` (default) wraps compact days side by side, and `variant="list"` shows one detailed day per row.

# Inline editing and ratings

`InlineEdit` mounts an edit session with a controlled `value`, `onValueChange`, `onCommit`, and `onCancel`. Mount it in place of the displayed label. Its input focuses and selects its text by default; `shouldSelectOnMount={false}` preserves the initial caret. Enter or blur commits once, Escape cancels without committing, and asynchronous saves disable the input until completion. Set `hasChanges={false}` to cancel an unchanged edit before calling `onCommit`; the caller owns normalization and comparison. It defaults to true, so creation sessions can commit their initial value. Rejected saves display a generic error and allow retry; `renderError` can map the unknown failure to application-authored guidance.

`VirtualTable` renders a bounded, dynamically measured set of native table rows using TanStack Virtual. Supply `items`, stable `getItemKey`, `header`, `label`, and `renderRow`; spread the supplied measurement props onto each native row. Optional `columns` accepts a `TableColumnGroup`; responsive columns keep their widths aligned with cells that share their `visibleFrom`. `maxHeight` defaults to `65vh`, `estimateRowHeight` to 80 pixels, and `overscan` to five rows. `retainedKeys` keeps editing rows mounted; the focused row is retained automatically. Filtering and selection belong to the consumer.

`VirtualDataGrid` renders a TanStack Table instance built with `dataGridFeatures` through `VirtualTable`: every filtered and sorted row, without pagination, in a fixed-layout table. Column `meta` sets `label`, `textAlign`, `truncate`, `visibleFrom`, `fill`, and `sortColumnIds`; a `fill` column takes the width the sized columns leave, and `sortColumnIds` names other columns the header sorts with its own buttons so its `aria-sort` reports them. Other resizable columns get a window-splitter handle that resizes by dragging, by the arrow keys, Home, and End, and resets on double-click. Set `columnResizeMode: "onChange"` so columns follow the pointer while dragging; TanStack's default `"onEnd"` resizes only on release. Widths change through CSS variables, so a `useTable` selector can omit `columnSizing` and `columnResizing` to keep resizing from rendering rows. `renderRow` receives each row and its measurement props; spread the props onto a `TableRow` and render `DataGridCells` inside it to wrap rows in menus or drag sources. `retainedRowIds` keeps rows mounted while they hold editors. `DataGridColumnOptions` shows, hides, and reorders the columns that allow hiding; its reset restores the table's initial visibility, order, and sizes.

Column `meta.filter` offers a column in `DataGridFilters`, hidden columns included. A `range` filter edits `[min, max]` bounds, `null` for an open end, for `filterFn: "inNumberRange"`; its inputs suggest the range of the rows the other filters leave, formatted through the filter's `Intl.NumberFormatOptions`. An `options` filter chooses among labelled string values, one or several, listed in its `options` or, when they depend on runtime data, in the `options` prop of `DataGridFilters` and `DataGridFilterSummary` keyed by column ID, for `filterFn: "arrHas"` (one value per row), `"arrIncludesSome"` (an array per row), or a custom `filterFn`; each option counts the rows the other filters leave with that value, so a column whose rows hold several values or values in another form supplies them through `getUniqueValues`. Column filters combine with each other and with the global filter. `DataGridFilterSummary` lists the active filters with buttons that remove them, and both controls clear every column filter at once.

Import `DataGridSelectHeader` and `DataGridSelectCell` from `@alexgorbatchev/shadcn/data-grid`. Pass the current `useTable` result as `table` to both controls, and pass `row` and an accessible `label` to each cell. The header selects selectable filtered rows across all pages and preserves selections hidden by filters. It shows a mixed state when some of those rows are selected and disables itself when none are selectable. Its default label is "Select all filtered rows"; provide `label` to name the scope in your application. Cells follow native row selection rules, including disabled rows and partially selected parents. The controls observe selection changes without requiring the parent table selector to include selection state.

`ActionsMenu` shares one `items` definition between a dropdown action and an optional context menu. Supply an accessible `label`; the default trigger is a ghost icon button. `size="sm"` displays the label, and `variant`, `disabled`, and `trigger` customize the action. Supplying `contextTarget` composes the native context trigger with that element and adds its popup. Compose items with `MenuItem`, `MenuLinkItem`, checkbox/radio parts, groups, labels, separators, shortcuts, and submenu parts; dropdown and context menus share these implementations. `MenuLinkItem` retains its native anchor and menu keyboard semantics.

For nested layouts, compose `ActionsMenuTrigger`, `ActionsMenuContextTarget`, and `ActionsMenuContextContent` explicitly inside `ActionsMenu`. The dropdown trigger owns its local native dropdown root and popup; the context target and content share an independent context root. A tree row can use `TreeItem render={<ActionsMenuContextTarget />}` and put the trigger in its action slot. For a table row, render the context target as the actual `tr`, then place the dropdown trigger and context content inside a `td`: native popup portals insert focus guards at their declaration, which must remain valid table children.

`TreeItem linkProps` places the registered tree item, roving focus, and native drag handlers on an anchor. Pass `href` and anchor events directly, or compose a router link through `linkProps.render`. The outer `render` and `ref` remain available for row overlays; disclosure and `endEnhancer` controls remain siblings of the link. Enter and modified clicks retain native link behavior, while tree arrows retain navigation and expansion behavior. Optional `dropHint={{ content, open, side }}` displays caller-controlled drag feedback without adding a focus target.

Embedded actions, links, menus, editable fields, and media controls retain their own keyboard behavior. Registered anchor and button rows still participate in tree navigation; rename and search inputs retain their completion and cancellation shortcuts.

`PageHeader` accepts an optional `eyebrow` above its single page title. It accepts any React content without introducing another heading. Breadcrumbs, description, actions, and density remain independent slots; long action content wraps within narrow layouts.

`StarRating` takes a controlled numeric `value` from 0 to 5, `onValueChange`, and an accessible `label`. Its native radio buttons support keyboard selection and an Unrated option to clear the rating. Set `disabled` while saving. `Avatar shape="square"` displays square artwork with matching image, fallback, and border corners.

`DialogContent size="wide"` uses a desktop maximum width of 576px; `size="narrow"` uses 192px, and the default uses 384px. Dialogs remain bounded by the viewport. `FieldGroup columns={2}` arranges fields in two columns on desktop and one on mobile.

`FormDialog` supplies a controlled dialog with a fixed heading and footer around a scrolling body. Supply `open`, `onOpenChange`, `title`, and children; `description`, `size`, and `density` are optional. With `onSubmit`, the body and actions use a native form: the caller handles `preventDefault`, validation, submission, and pending state. `submitLabel` adds the stock submit button, with optional `submitVariant` and `submitDisabled`; `primaryAction` supplies a custom action instead. Without `onSubmit`, custom actions can request consent without introducing a form. Without a primary action, `cancelLabel="Done"` gives a close-only footer. `isBusy` blocks native dismissal and disables the stock actions; callers disable their own inputs and custom actions. Pass already-rendered safe guidance through `error`.

`ImagePicker` displays a 256px square preview with upload and unset buttons. Supply the existing `src`, a staged `file` (`undefined` for the existing image, `null` for removal), and `onFileChange`/`onClear` callbacks. It accepts PNG, JPEG, and GIF files and releases local preview URLs when they change or unmount. The consumer owns saving and removal confirmation.

`ConfirmationDialog` uses an alert dialog with Cancel and a destructive confirmation button. Supply `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, and `onConfirm`. It waits for asynchronous work, keeps the dialog open on failure, and prevents cancellation while that work is pending. Its body scrolls within the viewport while the heading and actions stay visible. Failures display generic guidance by default; `renderError` maps unknown failures to application-authored messages.

# Split views

`SplitView` pairs a `sidebar` with its `children` in equally padded, borderless panels. Provide `sidebarLabel`, `contentLabel`, and `resizeLabel` for accessibility and a unique `storageKey` to remember the resized layout in localStorage. The desktop sidebar defaults to 325px (`defaultSidebarSize`), with a 200px minimum and a 50% maximum. Its 2px divider supports mouse, touch, and keyboard resizing. Below 1024px, the panels stack vertically while preserving the desktop preference. Storage failures leave the layout usable.

`ResizableHandle thickness="strong"` and `Separator thickness="strong"` use 2px dividers; their default thickness is 1px.

`TableHead` and `TableCell` accept `textAlign="start"`, `"center"`, or `"end"` to align labels and numeric columns consistently in either text direction.

# Drag and drop

Wrap draggable sources and drop targets in `DragDropProvider`. `DragSource` and `DropTarget` accept Base UI's `render` composition, so a button, table row, or sidebar item keeps its native element. For compositions that already manage rendering, use `useDragSource` and `useDropTarget` and spread their `props` onto the existing element.

```tsx
import { useState, type ReactElement } from "react";
import { Button, DragDropProvider, DragSource, DropTarget } from "@alexgorbatchev/shadcn";

export function MoveExample(): ReactElement {
  const [result, setResult] = useState("Waiting");
  return (
    <DragDropProvider>
      <DragSource
        type="application/x-music"
        data={{ title: "First light" }}
        labels={["First light"]}
        render={<Button />}
      >
        Drag track
      </DragSource>
      <DropTarget
        accept={["application/x-music"]}
        onDrop={(item) => setResult(JSON.stringify(item.data))}
        render={<Button variant="outline" />}
      >
        Drop here
      </DropTarget>
      <Button onClick={() => setResult("Moved First light")}>Move without dragging</Button>
      <output>{result}</output>
    </DragDropProvider>
  );
}
```

Supply JSON-serializable `data` and display-only `labels`. Native drags preserve the custom MIME payload, plain-text labels, and keyboard modifiers. `canDrop` rejects unavailable destinations; `getDropEffect` chooses `move`, `copy`, or `link`. Drop callbacks receive the item and native drag event. Validate external payloads before applying application changes.

The preview shows compact individual badges, up to five labels followed by `+N more…`. Set `maxPreviewItems` on the provider to change the limit, or use `DragDropPreview` directly. `useDropTarget` exposes the hovered MIME `type`, `isOver`, `isAlt`, and `effect` for hints and highlighting. The provider clears drag state after drops and cancellation. Native drag gestures need an equivalent keyboard-accessible action, such as the move button above or a context-menu command.

`useDropTarget().feedback` retains the last accepted MIME type, Alt modifier, and drop effect after leaving or dropping. Use this snapshot for hint content that remains visible during an exit animation; use `isOver` to control visibility and active highlighting. New accepted drag events update feedback immediately, including modifier changes. The live `type`, `isAlt`, and `effect` fields still describe the current hover.

`EmptyState` composes a title, description, and optional child actions. `DataViewer` presents JSON-compatible data for people: records become labelled terms, lists of plain values read on one line, lists of records are numbered, booleans read Yes or No, and missing or empty values read None or Empty. Keys become sentence-case labels with common acronyms (`track_id` reads "Track ID"); pass `formatLabel` to name domain keys, falling back to the exported `formatDataLabel`. `JsonViewer` displays a read-only formatted JSON value with configurable `label` and `rows` for people who need the JSON text itself.

# Devhost Preview

The routed preview serves Storybook at `shadcn.localhost` through devhost. To use a different hostname, copy [.env.example](./.env.example) to `.env.local` and set `SHADCN_DEV_HOST_SUFFIX`; the Storybook host becomes `shadcn` followed by that suffix. Exported environment variables take precedence over `.env.local`, which stays untracked.

From this repository, start the configured Storybook service:

```sh
just run
```

`just run` loads `.env.local`, applies the `.localhost` default, and runs `devhost start`. Running `devhost start` directly requires `SHADCN_DEV_HOST_SUFFIX` in the environment; devhost rejects the manifest when it is undefined.

Open the hostname printed by devhost over HTTPS. The manifest allocates a port automatically and serves Storybook through the shared devhost HTTPS proxy. The hostname must resolve to the machine running devhost, and the managed Caddy instance must be running (`devhost caddy start`).

Storybook binds to IPv4 loopback and allows the configured hostname in both Storybook and Vite. Caddy listens on all interfaces and serves HTTP as well as HTTPS, so the external devbox gateway can reach it. The direct `just storybook` preview remains available on `127.0.0.1:6006`.

# Troubleshooting

- **Components render without styling**: Check that your app imports the stylesheet, processes it with Tailwind v4, and registers the package's `dist` directory with `@source`. Adjust that path if your stylesheet lives somewhere other than `src/styles.css`.
- **A feature dependency cannot be resolved**: Install the peers listed for that feature under [Optional features](#optional-features). Importing a feature does not install its peers.
- **An export is missing from the package root**: Import feature components, hooks, and types from their dedicated entry point, such as `@alexgorbatchev/shadcn/chart` or `@alexgorbatchev/shadcn/resizable` for `SplitView`.
- **The custom font does not appear**: Install `@fontsource-variable/jetbrains-mono` and import `@alexgorbatchev/shadcn/fonts.css`, or override `--ag-font` with your app's font stack.
- **Theme controls throw a provider error**: Render components that call `useTheme()` inside the document's `ThemeProvider`.
- **Docs use an unexpected palette**: Select the desired Theme toolbar option. System uses the saved preview preference when one exists, otherwise the operating system preference. Reload an open preview after its server restarts on a different port.

# License

[MIT](./LICENSE). See [third-party notices](./THIRD_PARTY_NOTICES.md) for component and font attribution.
