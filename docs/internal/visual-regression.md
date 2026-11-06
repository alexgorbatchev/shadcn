---
created_on: 2026-10-14 06:43
last_modified: 2026-11-06 03:25
status: current
---

# Visual regression testing

For maintainers, `just test-visual` runs selected Storybook stories tagged `visual` and compares their rendered output with committed PNG baselines. The selection covers Button default, outline, destructive, disabled and loading states; Badge default, success and warning; Card default, small and hero spotlight; Input default, disabled and invalid; and ScrollArea native scrollbars. Add an explicit `tags: ["visual"]` to additional deterministic stories to expand coverage. For another component family, also add its story filename to the `test-visual` recipe in `justfile`; the file filters avoid loading the entire catalog.

Each story runs its existing interaction and accessibility checks before screenshots. The suite captures the final rendered state at 1280px and 390px widths, with a 900px viewport height, across light/dark themes and comfortable/compact densities. It captures the document body, including portal content, waits for fonts, uses reduced motion, disables screenshot animations, and hides carets. The comparator permits zero mismatched pixels after its native anti-aliasing/color comparison.

## Run and review

```sh
bun run playwright install --with-deps chromium
just test-visual
```

Baselines live in `__screenshots__/` beside each story subgroup, for example `src/components/stories/actions/__screenshots__/`. Names include the theme, density, story, viewport width, browser, and operating system. Failure images live under `.tmp/visual-attachments/` and include actual/reference/diff images where supported by Vitest.

Use Ubuntu 24.04, the frozen lockfile, and headless Chromium when reviewing or updating the Linux baselines. Browser and font rendering can vary across operating systems; baselines generated on macOS do not replace Linux baselines. CI uses `mcr.microsoft.com/playwright:v1.64.1-noble`, an Ubuntu 24.04 image containing the browsers and system dependencies for the locked Playwright version. Match that container environment when updating CI baselines. The browser installation command above prepares a local host; CI uses the preinstalled browsers. See [Vitest's environment guidance](https://vitest.dev/guide/browser/visual-regression-testing.html#environmental-stability).

For an intentional design change:

1. Run the comparison and inspect the failure images.
2. Run `just test-visual-update` in the baseline environment. To update one component only, run `just llm-docs`, then `bun run vitest run --config .storybook/vitest.visual.config.ts Button.stories.tsx --update`.
3. Review every changed baseline and include the intended PNG changes with the source change. Remove stale images when stories are renamed or deleted; Vitest does not prune them.
4. Run `just test-visual` again without update mode.

Missing baselines fail CI. Update mode is never used by CI, so an unexpected change cannot silently replace an accepted image.

## Automation

`.github/workflows/visual-regression.yml` checks pull requests and pushes to `main`. It uses the Playwright container with Node 24, Just 1.58.0, the declared Bun version, and cached Bun dependency downloads. It runs `just typecheck` and `just lint`, including formatting and native Node 24 unused-code analysis with the default heap, before `just test-visual`. The npm release workflow calls the same workflow and requires it to pass before publishing. The visual recipe generates the LLM documentation assets before starting the Storybook test server. Failed runs upload `visual-regression-failures` artifacts for 14 days. These checks do not publish Storybook or npm packages; publishing remains restricted to published GitHub Releases.

Visual checks complement the existing browser, package rendering, contrast, and coverage suites. They are separate from `just check` and do not establish full catalog visual coverage.
