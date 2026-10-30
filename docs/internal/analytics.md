---
created_on: 2026-10-28 06:05
last_modified: 2026-10-30 09:44
status: current
---

# Component analytics

This reference defines the analytics contract for package consumers and component maintainers. Import the provider, scope, impression component, hook, and types from `@alexgorbatchev/shadcn/analytics`. The entry point uses the existing React and Base UI peers and includes no vendor SDK.

## Configuration

`AnalyticsProvider` requires a transport with `track(event): void | Promise<void>`. The application owns SDK initialization, consent, identity, timestamps, persistence, retries, and flushing. There is no queue or replay. Without a provider, instrumentation does nothing.

Set `enabled={false}` to disable dispatch, including callbacks captured before disabling. Nested providers cannot enable a disabled ancestor; an enabled nested provider uses its own transport and starts a new scope. `filter(event)` can exclude events before transport. Synchronous exceptions and rejected transport promises are delivered to optional `onError`; failures in diagnostics are also isolated from UI behavior.

`AnalyticsScope` adds a name to the scope path and merges scalar properties. Inner scopes override outer keys, and component properties override scope keys. Scope follows React context through portals. `enabled={false}` suppresses the subtree without adding DOM.

Instrumented controls accept `analytics={{ id, properties }}` or `analytics={false}`. IDs are explicit stable identifiers. Generated IDs, labels, DOM text, field values, selected values, URLs, file data, and editor documents are never extracted. Applications are responsible for the contents of explicitly supplied properties. Use a disabled scope to exclude a whole composition; a control's `analytics={false}` disables its own event, not independently instrumented descendants.

## Events

Every event contains `schemaVersion: 1`, `name`, `component`, optional `id`, `scope: string[]`, and scalar `properties`.

| Event               | Meaning and ownership                                                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ui.activate`       | Button, link, command item, menu item, tree row, toast action, or authored catalog control activation. Pointer and keyboard use the same native action callback.                                                                                                               |
| `ui.change-request` | Selection/check/value callback from toggles, selectors, tabs, navigation, accordion, calendar, and questionnaire choices. A controlled parent can refuse the change. Values are omitted.                                                                                       |
| `ui.open-request`   | Overlay/disclosure/menu open callback; includes only `open: boolean`. Programmatic Base UI events are excluded.                                                                                                                                                                |
| `ui.commit`         | Edited input/textarea blur; slider/number-field committed value; completed OTP/crop; file drop or image selection callback; resize completion; inline edit after successful save; color/editor editing boundary; questionnaire submit. This does not imply server persistence. |
| `ui.navigate`       | Carousel navigation/drag settlement, tree keyboard navigation, calendar navigation, and questionnaire navigation callbacks.                                                                                                                                                    |
| `ui.drop`           | Accepted drag/drop target callback.                                                                                                                                                                                                                                            |
| `ui.impression`     | Explicit `AnalyticsImpression` observation only.                                                                                                                                                                                                                               |

Consumer callbacks run first. Canceled callbacks and default-prevented native actions do not produce callback-based events. Deferred dispatch checks cancellation after composed handlers finish. Links rendered through a router element (`ButtonLink`, `BreadcrumbLink`, and `AppShell` navigation `render`) read cancellation when their own handler runs, because client routers prevent the default action after calling that handler in order to navigate without a document load; handlers on the rendered element still cancel. Repeated events of the same name for one native event are deduplicated within a provider; the first eligible control owns the event. Different semantic events from one interaction remain distinct (for example, activating a trigger and requesting its dialog open).

Callbacks without upstream event metadata represent the upstream callback's semantics; they cannot prove physical user input. In particular, programmatic editor updates while focused may count as an edit, and calendar callbacks expose no common cancellation token. There is no claim that every callback is an accepted state transition.

## Catalog coverage

Core interactive primitives own their semantic events. Command items emit activation; automatically highlighted command values remain silent. Compound parts such as triggers, indicators, content panels, table cells, and layout elements rely on their owning root or composed controls. Data grids, virtual tables, Gantt/roadmap, JSON-render compositions, and assistant-ui families inherit instrumentation from package controls and their authored native buttons, links, and text inputs. Tree owns row activation and keyboard navigation. Sonner observes button/link activation within its rendered toast surface without collecting DOM contents.

External runtimes retain ownership of operations such as assistant generation, media playback, map navigation, and domain-specific chart selection. Use `useAnalytics(component, options)` in their application callbacks when those operations need a semantic event; package UI activation is not a domain success event. Consumer-supplied render functions and arbitrary native elements are not automatically intercepted.

Display-only components (cards, badges, charts, images, text, loading states), structural wrappers, and providers do not emit mount or render events. Wrap any display surface in `AnalyticsImpression` when a view is meaningful. `render={<Card />}` reuses that element instead of inserting another wrapper.

## Impressions

The default requires at least 50% viewport intersection continuously for 1,000 ms while the document is visible. Set `threshold` (0–1), `durationMs` (nonnegative), and `repeat` explicitly to change the policy. Once per mounted instance is the default, including React Strict Mode; `repeat` permits a new event after leaving and reentering. Leaving the viewport, hiding the document, disabling analytics, or unmounting cancels pending observation. Intersection does not measure occlusion by other elements.

## Adding instrumentation

1. Instrument the component's semantic callback using `useAnalyticsCallback`, or the actual successful operation using `useAnalytics`. Preserve upstream signatures, callback ordering, cancellation, refs, render composition, and function-valued styles.
2. Consume the analytics prop before spreading DOM or upstream props. Keep dependency-bearing runtime adapters in their existing optional entry points.
3. Test real pointer/keyboard behavior, controlled refusal, cancellation, composition, disable/re-enable, and metadata omission. Keep cross-entry context verification in installed-package tests.
