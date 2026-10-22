---
created_on: 2026-10-08 06:13
last_modified: 2026-10-21 21:40
status: current
---

# @alexgorbatchev/shadcn

Standalone Bun/TypeScript React component package with a local Storybook preview. This repository owns its design tokens; devhost is a design reference, not a runtime dependency.

## Commands

- Install: `bun install`
- Preview: `just storybook` (loopback port 6006, no automatic browser launch)
- Devhost preview: `just run` (loads `.env.local`, then runs `devhost start`)
- Format: `just fix`
- Validate: `just check` (typecheck, lint/format check, declarations/package build, development/production package rendering, static Storybook build)
- Package verification: `bun run test:package` (builds and installs the archive in isolated consumers; checks declarations and development/production rendering)
- Browser interactions: `bun run test` (Storybook stories tagged `test` in headless Chromium, then native browser checks and package-render tests)
- Text contrast: `bun run test:contrast` (all tested stories in Chromium across light/dark themes and comfortable/compact density; violations fail)
- Visual regression: `bun run test:visual` (selected stories across themes, densities, desktop and mobile widths); review intentional baseline updates with `bun run test:visual:update` on Ubuntu 24.04
- Native browser checks: `bun run test:native` (Chromium checks including Carousel with reduced motion; Drawer also runs in Linux WebKit)
- Reduced-motion interactions: `bun run test:reduced-motion` (full Storybook catalog with native reduced-motion preference)
- Coverage gate: `bun run test:coverage` (Storybook and native browser, hook, and utility tests; 90% statements, branches, functions, and lines across runtime source)
- Build package: `just build`
- Inspect a local archive: `just pack` (npm writes to `.tmp/packs/`; release publication uses `npm publish` directly)

## Development Setup

- Run commands from this standalone repository, not from the sibling devhost checkout. Use Bun 1.4.2 as declared in `package.json`; `just` is required for the validation and packaging recipes.
- Keep the single repository `bun.lock` in sync with manifest changes. Local package verification also requires npm.
- For routed preview prerequisites and hostname configuration, see [README.md](./README.md#devhost-preview). The direct Storybook preview needs no devhost service.
- `dist/`, `storybook-static/`, `.cache/`, and `.tmp/` are generated or transient outputs. Edit their source files and regenerate them; keep those directories untracked.
- `just check` is the local validation entrypoint, including a browser smoke check of the built standalone preview. `.github/workflows/storybook-pages.yml` validates and deploys static Storybook only when a GitHub Release is published; see [Pages setup](./docs/internal/storybook-pages.md). It does not run on branch pushes or pull requests.

## Contracts

- Use Base UI primitives and official shadcn Base UI compositions. Prefer maintained libraries for behavior; preserve native accessibility and state contracts.
- Add missing reusable consumer capabilities to this package's public components instead of applying consumer-side overrides or styling hacks.
- Keep shared UI patterns in this package. Drag/drop sources, targets, coordination, and badge previews use the public `DragDropProvider`, `DragSource`, `DropTarget`, and hooks. Native browser drag tests participate in the main coverage project; consumers supply domain validation and keyboard-accessible equivalent actions.
- Keep the core API explicit in `src/index.ts` and optional feature APIs in their `src/components/<feature>/index.ts` entry points. Never re-export optional features, hooks, or dependency-bearing types from the root. Components live in `src/components/`, shared runtime hooks in `src/hooks/` and feature hooks in their feature folder’s `hooks/`, and stories in `src/components/stories/`.
- Define standalone Tailwind v4 tokens in `src/theme.css`. Keep consumers independent of absolute devhost imports, symlinks, and workspace dependencies.
- Keep React and React DOM external peers. Bun builds browser ESM with production JSX (`jsx.development: false`); TypeScript emits declarations separately. Consumers generate utilities by scanning `dist`, so package class strings must remain discoverable by Tailwind.
- Keep one root `tsconfig.json` for development and typechecking. The package build derives declaration compiler options from it and emits declarations from the public entry points; do not add a separate build tsconfig.
- Build all public JavaScript entry points together with code splitting so shared React contexts retain their identity across imports. Optional feature peers stay external; keep their development copies installed for Storybook and tests.
- Prefer `peerDependencies` whenever possible and reasonable to minimize consumers' `node_modules` disk usage. Make feature-only peers optional with `peerDependenciesMeta` and isolate them behind feature entry points so consumers install only what they use. Consider the transitive install size when adding or upgrading dependencies; tree shaking does not reduce `node_modules`. Use regular dependencies only when runtime ownership or correctness requires them, and document the reason for each exception.
- When upgrading `sonner`, `input-otp`, or `@shadcn/react`, check whether upstream resolves the patched issues. For each resolved package, remove its obsolete patch and bundled-build exception and move it to optional `peerDependencies` with `peerDependenciesMeta`, retaining a development dependency. Verify declarations, shared contexts/stores, and regression tests before removing its bundled implementation.
- Keep optional font imports in `src/fonts.css`. Preserve shadcn source attribution in `THIRD_PARTY_NOTICES.md` when adding components.
- Follow `src/components/Button.tsx` for primitive props, semantic utility classes, variants, and density overrides; follow `src/components/stories/actions/Button.stories.tsx` for typed metadata and interactive controls. Add public exports to the appropriate core or feature entry point and include each component family in the Storybook catalog.
- Group Storybook by relocating story files under functional subdirectories of `src/components/stories/`; derive titles from the package name and story path, omitting `src/` and `stories/`. Keep runtime module locations, flat public exports, optional feature boundaries, and tree shaking independent of sidebar organization.
- ThemeProvider owns the document palette. DensityProvider supplies both React context and CSS variables; portal content must resolve density through context.
- Keep rectangular corners at 4px or less through the `--radius-*` tokens in `src/theme.css`; reserve `rounded-full` for circular and pill shapes such as avatars, radio indicators, slider thumbs, and scrollbar thumbs. Preserve framed floating surfaces, semantic palette tokens, and reduced-motion behavior. Avoid hardcoded palette classes and scale/bounce transitions.
- Drive pointer-following effects, such as the Card `hero` spotlight (`useCardSpotlight` with the `card-spotlight` theme utility), by writing CSS variables to the element once per animation frame; never store pointer positions in React state. While the pointer is inside, recompute on scroll, viewport resize, and element resize; browsers send no pointer events when content moves under a stationary pointer. Leave forced colors to the browser, which drops gradient backgrounds and restores the native border; never opt out with `forced-color-adjust`.

## Storybook and Validation

- Keep private hostnames in untracked `.env.local`. `devhost.toml` derives the Storybook host from `SHADCN_DEV_HOST_SUFFIX`, which the justfile defaults to `.localhost`; document new variables in `.env.example`.
- Share previews as devhost HTTPS URLs on the configured Storybook host, started with `just run`. Never give IP addresses or loopback ports as preview links.
- Preserve automatic port allocation in `devhost.toml`. Its explicit shell expands injected `PORT`; `--exact-port` prevents Storybook from silently choosing a different port.
- Preserve `caddy.global.bindHost = "0.0.0.0"` and `http = true` for the external devbox gateway. Storybook itself remains on IPv4 loopback. Restart the stack after changing Caddy global settings; those fields do not hot-reload.
- Merge `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` into both Storybook `core.allowedHosts` and Vite `server.allowedHosts`. Vite configuration alone does not allow the Storybook manager's Host/Origin checks.
- Use typed `Meta` and `StoryObj`, meaningful variants and states, and accessible names for controls.
- Use isolated iframe documentation for default-open overlays; inline examples can interfere through their document-wide portals.
- Scope TypeScript docgen to component source; preview infrastructure and stories are not public component APIs.
- Keep Vite dependency caches and development asset URL prefixes isolated by the actual Storybook port, with a separate production-build cache. Concurrent servers sharing optimized files can mix React instances and fail hooks in Docs; immutable browser caches can retain imports into an older server's cache. After a port changes, reload an already-open preview so it uses the current server's module graph.
- Keep development responses `no-store`. `createPreviewAssetBasePlugin` also prefixes Storybook's root-relative bootstrap scripts; Vite's `base` alone leaves those URLs shared across ports, allowing the external gateway to cache a stale module graph. Reload open Docs after dependency optimization changes as well as port changes; an already-loaded React module can differ from the renderer's new dependency graph.
- Storybook Docs has an independent theme. Keep `ThemedDocsContainer` connected to theme globals and the shared preview preference through Storybook's native Docs theme API; validate Docs backgrounds as well as story canvases.
- Use the Storybook Vitest addon with Playwright Chromium for browser interactions. Enable new tested stories with `test`; stories carrying `!test` are excluded. Install browser binaries with `bun x --bun playwright install chromium webkit` when needed; WebKit also needs Playwright's system dependencies on Linux. Native Drawer checks run both engines; Linux WebKit does not exercise the iOS-only touch-callout CSS feature. `just check` verifies compilation and builds; run the browser and coverage commands separately and report exclusions and coverage failures.
- For runtime behavior changes, update corresponding behavioral stories or tests and require 90% code coverage, excluding `scripts/`. The coverage command measures runtime source, excluding story/test infrastructure and type-only files; a passing build does not establish coverage.
- Reproduce the regression before fixing it, verify the corrected behavior, then temporarily disable only the fix and confirm the regression test fails. Test interactions and rendered behavior rather than static class strings, token values, or raw configuration objects.
- Keep browser-test dependency caches separate from previews and static builds. Pre-optimize imported primitives in the Vitest configuration; optimization during execution can reload the test module and invalidate the run.
- Scope Storybook Vitest runs with CLI file filters; the addon ignores Vitest's `test.include`. Match reduced-motion selector specificity to state-dependent animation rules and validate using native browser preference emulation.
- Preserve Base UI function-valued `className` and `style` props by evaluating them with native primitive state. Passing those functions to `cn` silently discards the callback.
- Validate package changes in a separate Bun React consumer installed from the packed archive; repository aliases can hide package export, CSS scanning, and font asset failures.

## Boundaries

- Make all changes directly on `main`; do not create feature branches or linked worktrees for this repository.
- Use `.github/workflows/npm-release.yml` for authorized npm releases; follow [the release procedure](./docs/internal/npm-releases.md). Consumers use published npm versions rather than vendored archives.
- Always consult applicable skills and verified upstream APIs before implementation.
- Always run `just fix` and `just check` before claiming completion; report remaining failures and warnings.
- Always use repository `.tmp/` for transient validation artifacts and stop owned validation servers and browser sessions.
- Start persistent previews only when requested. Temporary validation previews are allowed; keep their ports, caches, and browser sessions separate from other running projects, and never stop unowned processes or the shared Caddy instance.
- Never suppress lint rules or replace native primitives with surface approximations.
- Never modify the devhost source repository as part of this package's work.
- Pull and push external dependency repositories modified for this app; verify the remote and preserve concurrent changes.
- Never publish packages, releases, tags, or production deployments without explicit authorization.
- Always record new standing user instructions here; check with the user before changing conflicting instructions. Keep activity logs, task history, progress, handoffs, and dated amendments out of this file.

## References

- [Consumer setup and customization](./README.md)
- [Optional assistant-ui catalog and source inventory](./docs/internal/assistant-ui.md)
- [Source and license attribution](./THIRD_PARTY_NOTICES.md)
- [Storybook contrast testing and manual-review limits](./docs/internal/accessibility.md)
- [Visual regression baselines and CI](./docs/internal/visual-regression.md)
- [npm release procedure](./docs/internal/npm-releases.md)
