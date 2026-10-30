---
created_on: 2026-10-20 23:00
last_modified: 2026-10-30 09:44
status: current
---

# Assistant UI catalog

This reference describes the optional assistant-ui component library, its source provenance, and the boundaries consumers must preserve. The package owns the components under `src/components/assistant-ui/`; applications supply their assistant runtime, transport, model configuration, and persistence.

## Imports and peers

Import individual families when a consumer needs only part of the catalog:

```tsx
import { ApprovalCard } from "@alexgorbatchev/shadcn/assistant-ui/approval-card";
import { Thread } from "@alexgorbatchev/shadcn/assistant-ui/native/thread";
```

`assistant-ui` exports the presentational catalog. `assistant-ui/native` exports adapters using actual assistant-ui runtimes and message, composer, thread, and tool primitives. These convenience barrels cover multiple optional dependencies; individual family entrypoints keep unrelated peers out of a consumer's module graph. The package root does not re-export either catalog.

Install the optional peers required by the selected family, as declared in `package.json`. Runtime-bound components require an actual `AssistantRuntimeProvider`; the library supplies no backend or substitute runtime. The native ModelSelector registers the selected model and reasoning effort through the runtime's model-context API. MCP configuration uses the maintained MCP manager and form primitives.

Native `Thread` centers its composer while the conversation is empty. Set `emptyComposerPosition="bottom"` to keep it docked at the bottom before the first message as well.

`Thread` accepts `components.ComposerActions` for controls beside Send and `components.UserText` for rendering user text parts. These slots retain the native composer and message runtime contexts. `composerInputRef` exposes the native textarea for focus management. `viewportProps` forwards native viewport behavior, events, and its ref, including scroll restoration options; the package owns the viewport's children and rendered structure.

Native thread renaming starts after the action menu releases its focus scope, including its exit animation. Enter commits and Escape cancels while restoring focus to the conversation; clicking elsewhere commits without stealing focus. Keyboard completion blurs the editor before its blur handler finishes the operation, so teardown does not remove the active input during key dispatch. All ThreadList interaction stories assert that no console errors occur.

The existing theme and Tailwind consumer setup remains required. Add the self-contained feature stylesheet for shared catalog surfaces and the native generative-UI vocabulary:

```css
@import "@alexgorbatchev/shadcn/assistant-ui.css";
```

Import dependency-bearing styles only for the corresponding family:

| Family                            | Additional stylesheet                              | Optional stylesheet dependency |
| --------------------------------- | -------------------------------------------------- | ------------------------------ |
| MarkdownText and native Thread    | `@alexgorbatchev/shadcn/assistant-ui/markdown.css` | `@assistant-ui/react-markdown` |
| GeoMap, including generative maps | `@alexgorbatchev/shadcn/assistant-ui/geo-map.css`  | `leaflet`                      |

The Markdown stylesheet imports the maintained streaming-dot stylesheet. The map stylesheet imports the maintained Leaflet stylesheet and applies semantic styles within the native map container. The generated UI stylesheet retains the upstream `data-aui` vocabulary and uses this package's palette and density variables. No application API key is needed to render the library or run its deterministic Storybook fixtures.

The default Shiki and Prism syntax themes use the package's semantic colors and respond to consumer palette changes. Shiki uses its native CSS-variable theme API; consumers can additionally override its `--assistant-code-*` token variables or supply an explicit supported Shiki theme. Explicit Shiki themes retain their own foreground and background colors. Highlighted lines use native marks with an outline that preserves token contrast. Both renderers keep their maintained tokenization engines and language registration.

Image actions display native copy, download, and regeneration failures and allow retry. Pending copy and regeneration controls are disabled; changing the image releases the new image's controls and discards stale copy feedback.

## Page-layout elements

`CanvasSplit layout="fill"` fills its container as a page layout: it takes the container's full width and height, the thread and document panes scroll independently, the thread pane is 320–440px wide, and the panes stack below a 48rem container width. The default `layout="card"` keeps the framed demo size. `Timeline` renders an ordered list; events take optional `time`, `detail`, `meta`, `actions`, and a `connector` annotation for the segment to the next visible event, `when` is optional for neutral entries, `visibleCount` defaults to every event, and `fullWidth` spans the container. `RecommendationCard` renders each of its accept, alternatives, and reject actions only when the handler is supplied, with configurable labels and an `accepted` or `rejected` receipt.

`GeoMap height="fill"` fills its parent's height, with the place list scrolling below the map; `showPlaces={false}` hides the list. The map follows container resizes. `tileUrl` is a Leaflet URL template, so a same-origin tile proxy such as `/api/map-tiles/{z}/{x}/{y}` works. `attribution` is HTML for Leaflet's attribution control; changing it replaces the text without recreating the map, which suits providers that report attribution per viewport. A controlled `selectedId` change pans the map to that place.

## Portals and injected roots

Wrap an embedded surface with the public `PortalProvider`, passing its real overlay container. Existing Base UI overlays consume that container; assistant-ui adapters resolve its element or shadow root for upstream portal primitives. An explicitly provided container that is not mounted yet defers those overlays. Density follows React context into portals.

The upstream assistant-ui SelectionToolbar is an exception: its published root portals directly to `document.body` and reads the window selection. The library preserves that native implementation and tests ordinary document selection and quote behavior. It does not promise shadow-root isolation for SelectionToolbar. An injected application must omit that surface or wait for upstream container and shadow-selection support; this package does not patch or replace the runtime primitive.

Sidebar keyboard shortcuts are scoped to the focused provider and respect a consumer's prevented event. Sidebar has no implicit cookie persistence; consumers own persistence through its controlled state and callback API.

## Source inventory and maintenance

[`assistant-ui-catalog.json`](../../assistant-ui-catalog.json) records all 172 items in the fetched official registry: 155 component items, one composed item, two hooks, eight UI items, two styles, one utility item, and three application/API templates. Its 174 unique fetched source-file records contain SHA-256 digests of the original UTF-8 contents, original export names, and the existing source destinations. Repeated files shared by registry items use one file record. Metadata-only entries have a separately labeled registry metadata digest.

Application pages and API route templates are excluded from this reusable UI package. The composed Eve item retains its library component and toolkit sources while excluding its `app/page.tsx` application template. Existing standalone Base UI owners fulfill shared primitives instead of duplicating the registry's Radix controls. MIT attribution is retained in [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).

When updating a registry item, compare its fetched source and exports with the recorded file digest. Preserve native behavior, revise every split destination and the ledger together, and add or update the family's central Storybook stories. Keep internal extraction helpers private to the package boundary. Build all entrypoints together so runtime contexts retain their identity across imports.

## Validation

Use the root `just fix` and `just check` gates. Browser interactions, native browser tests, contrast, reduced motion, packed consumer rendering, and the 90% coverage gate remain separate required evidence; a successful package build alone does not establish them. Regression tests must fail when their corresponding behavior change is temporarily removed. Keep temporary logs and archives under `.tmp/`, and serialize browser runs when coordinating source mutations.

`bun run test:coverage` combines the Storybook projects with the native browser, hook, and utility projects. It uses Istanbul so the native WebKit checks participate alongside Chromium; the V8 provider cannot measure WebKit. All four global thresholds remain 90%. Package tests install the real archive with the pinned Bun version, validate each public export's packed artifact, and build consumers with only their required optional peers.

The source inventory describes mappings, not a validation-completion claim. Report any failing or unrun gate explicitly.

The maintained Storybook Vitest addon resets the native pointer before each story. Ordinary stories use the play context's `userEvent` so they also run in the standalone preview; never import `vitest/browser` into a story or its helpers. Native media activation and GPU preference-transition checks belong in the native browser suite. Browser projects own their motion preference; tests that change it must restore the original preference. Await visibility after asynchronous message insertion. `just check` also opens the built standalone preview in Playwright and exercises navigation, a native conversation, audio playback, and the GPU voice surface outside Vitest Browser Mode.

The Vitest 4 Istanbul provider carries the upstream fix from [vitest#11529](https://github.com/vitest-dev/vitest/pull/11529) for concurrent module warmups replacing an uncovered file's counters. The Bun patch retains counters by transform key before awaiting Vite. The package verification gate runs a deterministic regression that checks the actual coverage report retains the uncovered module. Remove this patch when the supported Vitest version includes the upstream fix.

The [Storybook toolchain reference](./storybook-warnings.md) describes the Node loader patch, native React build plugin, and measured preview bundle budgets. These preview settings preserve the package's public entry points and optional feature peers.
