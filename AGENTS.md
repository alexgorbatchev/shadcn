---
created_on: 2026-10-08 06:13
last_modified: 2026-10-08 12:54
status: current
---

# shadcn-alexgorbatchev

Standalone Bun/TypeScript React component package with a local Storybook preview. This repository owns its design tokens; devhost is a design reference, not a runtime dependency.

## Commands

- Install: `bun install`
- Preview: `bun run storybook` (loopback port 6006, no automatic browser launch)
- Routed preview: `devhost start` (`devhost.toml` serves `https://shadcn.example.com` through the running shared Caddy instance)
- Stop this project's routed preview: `devhost stop --manifest ./devhost.toml`
- Format: `just fix`
- Validate: `just check` (typecheck, lint/format check, declarations/package build, static Storybook build)
- Build package: `just build`
- Prepare local archive: `just pack` (runs the package build and writes `.tmp/packs/shadcn-alexgorbatchev-0.1.0.tgz`)

## Development Setup

- Run commands from this standalone repository, not from the sibling devhost checkout. Use Bun 1.4.0 as declared in `package.json`; `just` is required for the validation and packaging recipes.
- Install dependencies with `bun install` before running the commands above. Keep the single repository `bun.lock` in sync with manifest changes.
- The direct Storybook preview needs no devhost service. The routed preview needs the devhost CLI, a running managed Caddy instance, and the configured hostname resolving to that machine; see [README.md](./README.md#devhost-preview).
- `dist/`, `storybook-static/`, `.cache/`, and `.tmp/` are generated or transient outputs. Edit their source files and regenerate them; keep those directories untracked.
- This repository has no CI or release workflow. `just check` is the local validation entrypoint; do not describe it as CI enforcement.

## Contracts

- Use Base UI primitives and official shadcn Base UI compositions. Prefer maintained libraries for behavior; preserve native accessibility and state contracts.
- Keep the package root API explicit in `src/index.ts`. Components live in `src/components/`, runtime hooks in `src/hooks/`, and stories in `src/components/stories/`.
- Define standalone Tailwind v4 tokens in `src/theme.css`. Keep consumers independent of absolute devhost imports, symlinks, and workspace dependencies.
- Keep React and React DOM external peers. Bun builds browser ESM; TypeScript emits declarations separately. Consumers generate utilities by scanning `dist`, so package class strings must remain discoverable by Tailwind.
- Keep optional font imports in `src/fonts.css`. Preserve shadcn source attribution in `THIRD_PARTY_NOTICES.md` when adding components.
- Follow `src/components/Button.tsx` for primitive props, semantic utility classes, variants, and density overrides; follow `src/components/stories/Button.stories.tsx` for typed metadata and interactive controls. Add public exports to `src/index.ts` and include each component family in the Storybook catalog.
- ThemeProvider owns the document palette. DensityProvider supplies both React context and CSS variables; portal content must resolve density through context.
- Preserve sharp control corners, framed floating surfaces, semantic palette tokens, and reduced-motion behavior. Avoid hardcoded palette classes and scale/bounce transitions.

## Storybook and Validation

- Preserve automatic port allocation in `devhost.toml`. Its explicit shell expands injected `PORT`; `--exact-port` prevents Storybook from silently choosing a different port.
- Preserve `caddy.global.bindHost = "0.0.0.0"` and `http = true` for the external devbox gateway. Storybook itself remains on IPv4 loopback. Restart the stack after changing Caddy global settings; those fields do not hot-reload.
- Merge `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` into both Storybook `core.allowedHosts` and Vite `server.allowedHosts`. Vite configuration alone does not allow the Storybook manager's Host/Origin checks.
- Use typed `Meta` and `StoryObj`, meaningful variants and states, and accessible names for controls.
- Use isolated iframe documentation for default-open overlays; inline examples can interfere through their document-wide portals.
- Scope TypeScript docgen to component source; preview infrastructure and stories are not public component APIs.
- Keep Vite dependency caches and development asset URL prefixes isolated by the actual Storybook port, with a separate production-build cache. Concurrent servers sharing optimized files can mix React instances and fail hooks in Docs; immutable browser caches can retain imports into an older server's cache. After a port changes, reload an already-open preview so it uses the current server's module graph.
- Keep development responses `no-store`. `createPreviewAssetBasePlugin` also prefixes Storybook's root-relative bootstrap scripts; Vite's `base` alone leaves those URLs shared across ports, allowing the external gateway to cache a stale module graph.
- Storybook Docs has an independent theme. Keep `ThemedDocsContainer` connected to theme globals and the shared preview preference through Storybook's native Docs theme API; validate Docs backgrounds as well as story canvases.
- The current preview has no play tests or automated interaction runner. Stories carry `!test`; `just check` verifies compilation and builds, not interaction coverage. Do not report those checks as behavioral tests.
- For future runtime behavior changes, update a corresponding test file and require 90% code coverage, excluding `scripts/`. Establish an executable behavioral runner before claiming that requirement is enforced.
- When an executable behavioral suite exists, reproduce the regression before fixing it, verify the corrected behavior, then temporarily disable only the fix and confirm the regression test fails. Test interactions and rendered behavior rather than static class strings, token values, or raw configuration objects.
- Validate package changes in a separate Bun React consumer installed from the packed archive; repository aliases can hide package export, CSS scanning, and font asset failures.

## Boundaries

- Always consult applicable skills and verified upstream APIs before implementation.
- Always run `just fix` and `just check` before claiming completion; report remaining failures and warnings.
- Always use repository `.tmp/` for transient validation artifacts and stop owned validation servers and browser sessions.
- Start persistent previews only when requested. Temporary validation previews are allowed; keep their ports, caches, and browser sessions separate from other running projects, and never stop unowned processes or the shared Caddy instance.
- Never suppress lint rules or replace native primitives with surface approximations.
- Never modify the devhost source repository as part of this package's work.
- Never publish packages, releases, tags, or production deployments without explicit authorization.
- Persist standing project instructions here; keep task history, progress, handoffs, and dated amendments out of this file.

## References

- [Consumer setup and customization](./README.md)
- [Source and license attribution](./THIRD_PARTY_NOTICES.md)
- [Session handoff and validation evidence](./docs/internal/handoff.md)
