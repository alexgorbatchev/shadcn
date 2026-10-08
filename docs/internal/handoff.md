---
created_on: 2026-10-08 12:54
last_modified: 2026-10-08 12:54
status: current
---

# Session Handoff

Working state for the next development session in `shadcn-alexgorbatchev`. This is a validation snapshot; inspect the repository and running services again before acting on it.

## Start Here

1. Open `/home/alex/development/projects/shadcn-alexgorbatchev`, rather than the sibling devhost repository.
2. Read [AGENTS.md](../../AGENTS.md) for implementation rules and commands, and [README.md](../../README.md) for consumer setup.
3. Inspect Git status before editing. At capture, the repository has no initial commit and all source/configuration files are untracked. No files are staged. Preserve these files; do not use cleanup or reset commands to establish a baseline.
4. Inspect the existing preview before starting another server. At capture, this project's devhost stack is running Storybook on IPv4 loopback port 34731 through [devhost.toml](../../devhost.toml). Ports are allocated automatically and can change. Other devhost projects also have running services; do not stop those processes or the shared Caddy instance.

## Delivered Scope

- Standalone npm-compatible Bun/TypeScript React package, using official shadcn Base UI compositions and copied design tokens. There is no devhost runtime dependency.
- Twenty-three component families and two providers, with an interactive Storybook catalog, controls, Docs, theme selection, and density selection. The full catalog is in README.md.
- Compact and comfortable densities; light, dark, and system preference; consumer overrides for fonts and accents.
- Local archive installation through `just pack`. No package publication, remote setup, release, or production deployment is authorized by this session.
- Storybook play tests are explicitly deferred. There is no checked-in interaction runner, coverage enforcement, or CI workflow. The 90% coverage rule in AGENTS.md is a requirement for future runtime work, not a claim about current coverage.

## Validation Evidence

These logs are in ignored `.tmp/`; they may be absent in a fresh checkout. They record successful checks from this session, not an automated test suite.

| Check                                                                                                                                                                                                                  | Evidence                                                                  |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| Typecheck, lint/format, package/declarations build, and static Storybook build                                                                                                                                         | [documentation-check.log](../../.tmp/documentation-check.log)             |
| Packed-package Bun React consumer: state updates, control densities, native checked/disabled state, keyboard selection, scalar slider, dialog portal density/focus, theme persistence/system changes, and font loading | [consumer-validation.log](../../.tmp/consumer-validation.log)             |
| All 25 Docs pages render dark backgrounds                                                                                                                                                                              | [react-fix-docs-validation.log](../../.tmp/react-fix-docs-validation.log) |
| Previously failing browser renders Accordion Docs with one React module and dark example frames                                                                                                                        | [react-hook-after.log](../../.tmp/react-hook-after.log)                   |
| Six light/dark/system and persisted-preference cases                                                                                                                                                                   | [react-fix-theme-switching.log](../../.tmp/react-fix-theme-switching.log) |
| Accordion expands while a second preview runs on a separate port                                                                                                                                                       | [react-parallel-server.log](../../.tmp/react-parallel-server.log)         |
| Exact null `useState` error reproduced before the cache fix                                                                                                                                                            | [react-hook-replay-red.log](../../.tmp/react-hook-replay-red.log)         |

The build succeeds with nonfatal dependency `use client` directive and large-chunk warnings. Lint and formatting checks pass.

## Storybook Failure Modes

- Concurrent servers shared optimized dependency files, while the external gateway cached mutable preview JavaScript. The result mixed React module instances and caused the Docs container's `useState` call to fail. A fresh browser alone did not expose the cached-session failure.
- [main.ts](../../.storybook/main.ts) isolates dependency caches and development asset URLs by the actual server port and sets development responses to `no-store`. [createPreviewAssetBasePlugin.ts](../../.storybook/plugins/createPreviewAssetBasePlugin.ts) also prefixes root-relative bootstrap scripts that Vite's base transform leaves shared. Preserve both parts of this fix.
- Verify an already-open browser after restarting on a different port, and verify two concurrent previews. Inspect actual React module URLs and rendered Docs/example backgrounds; a successful static build does not establish those behaviors.
- [ThemedDocsContainer.tsx](../../.storybook/components/ThemedDocsContainer.tsx) follows Storybook globals and the shared persisted preview preference through the native Docs theme API. Docs and story canvases require separate checks.
- Rapid toolbar changes can replace the preview iframe. Validation must wait for navigation/network activity to settle, the preview global to match the selection, and native story renders to finish before asserting colors. A manager toolbar update alone does not establish preview readiness.

## Next Work

Choose the next scope with the user. The deferred Storybook play tests and an executable behavioral runner are the main validation gap. No test, CI, publishing, or remote workflow should be assumed to exist. A Git baseline also remains to be created when committing is explicitly requested.
