---
created_on: 2026-10-09 11:00
last_modified: 2026-10-21 09:57
status: current
---

# Storybook contrast tests

For contributors checking the component catalog, Storybook runs axe-core's `color-contrast` rule against rendered browser content. Violations fail story tests and appear in the Accessibility panel. The rule checks WCAG 2.2 AA text contrast: at least 4.5:1 for ordinary text and 3:1 for large text. See [Deque's rule documentation](https://dequeuniversity.com/rules/axe/4.14/color-contrast).

## Run the catalog

```sh
bun run test:contrast
```

The command uses headless Chromium through the existing Storybook Vitest addon, with native reduced-motion preference to measure settled content. It runs all stories tagged `test` in light and dark themes, each at comfortable and compact density. Story-specific globals and component density overrides still apply. No running preview server is required. Each configuration runs stories sequentially because InputGroup and Table use Chromium's shared native clipboard. Each configuration has its own dependency cache. The regular and reduced-motion interaction suites retain their existing browser preferences.

For a focused run:

```sh
bun run test:contrast src/components/stories/actions/Button.stories.tsx
bun run test:contrast --project contrast-light-compact src/components/stories/overlays/Drawer.stories.tsx
```

The regular `bun run test` also checks contrast using the preview's default globals. `just check` checks types, formatting, package rendering, and the static Storybook build; run `test:contrast` separately for the complete contrast matrix.

## Inspect results in Storybook

Open a story and select the Accessibility panel. Use the Theme and Density toolbars to inspect a specific palette and density. In the testing widget, enable Accessibility alongside component tests. The preview sets `a11y.test` to `error`, so detected violations fail instead of producing advisory warnings. See [Storybook's accessibility testing guide](https://storybook.js.org/docs/writing-tests/accessibility-testing).

The scan includes the story document's body, including portal content. It runs after the story's `play` function. An overlay closed by `play` is absent from that scan; stories that finish with visible popup content cover the open state. Drawer and Sheet include dedicated `Open` stories for this purpose.

## Scope and limitations

- The automatic rule checks text contrast. Other accessibility rules are outside this suite's scope.
- Axe's incomplete results require manual review and appear in the Accessibility panel. The CLI can pass when only incomplete results remain; that does not establish sufficient contrast for those elements.
- Hidden content and inactive controls are outside the text-contrast requirement. A passing disabled-control story does not establish its visual contrast.
- Icons, control boundaries, focus indicators, and meaningful chart graphics need review under [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). This text rule does not certify them.
- Only rendered states are scanned. A passing catalog run does not establish accessibility for every possible consumer composition or every intermediate interaction state.

The browser tests in `.storybook/__tests__/preview.test.tsx` exercise the configured scan with readable Button text and intentionally insufficient portal text. Run them with:

```sh
bun run test:native .storybook/__tests__/preview.test.tsx
```
