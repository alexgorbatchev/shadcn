---
created_on: 2026-10-21 16:03
last_modified: 2026-10-21 17:00
status: current
---

# Storybook toolchain and bundle budgets

This reference describes the maintained Storybook configuration and its regression checks. The inspected versions are Storybook 10.6.1, Vite 8.3.4, Rolldown 1.2.13, React 19.3.0, Bun 1.4.2, and Node 26.12.0. The loader is also verified under Node 24.22.0. Recheck installed source and upstream releases before removing a dependency patch.

## React interaction warnings

The native ThreadList's Cancel Rename interaction exercises focused-input teardown. Enter and Escape record the requested operation and blur the input; `onBlur` owns commit/cancel and unmounting. Cancellation preserves the title and restores conversation focus. The ThreadList stories spy on `console.error` without replacing its implementation and assert that no errors occur after each interaction.

Run all rename, search, archive, and delete scenarios:

```sh
bun run vitest run --config .storybook/vitest.config.ts --project storybook src/components/stories/assistant-ui/native/conversations/ThreadList.stories.tsx
```

The focused regression is `--testNamePattern 'Cancel Rename'`. Removing the blur-path fix makes that test fail with React's unawaited synchronous `act` warning. This reproduces in a single story; it differs from [Storybook's separate multi-file act-environment issue](https://github.com/storybookjs/storybook/pull/34999).

## Node TypeScript loader

The Bun patch in `patches/storybook@10.6.1.patch` backports the synchronous loader mechanism from [Storybook PR #35337](https://github.com/storybookjs/storybook/pull/35337). On Node 26 with native hook support, it uses [`registerHooks`](https://nodejs.org/api/module.html#moduleregisterhooksoptions), synchronous file reads, and esbuild's synchronous transform. Registration shares a promise across concurrent imports. Node 24 and Bun retain their existing native registration API; Bun 1.4.2 does not expose `registerHooks`.

Verify the actual config with deprecations treated as errors:

```sh
node --throw-deprecation --input-type=module -e 'import { importModule } from "storybook/internal/common"; import { pathToFileURL } from "node:url"; await importModule(pathToFileURL(".storybook/main.ts").href);'
```

The unpatched Node 26 loader exits with `DEP0205`. The patched loader completes. Remove the patch when the supported stable Storybook release contains the fix and the regression tests pass without it. The inspected stable 10.6.3 archive still uses the deprecated call.

Storybook resolves its project root through `import.meta.dirname`, which Node and Bun both support. Node does not expose Bun's `import.meta.dir` alias. The regression builds a source import through the real `@` alias and executes the generated module.

## React directives

`createStorybookViteConfig` registers the installed official `@vitejs/plugin-react` alongside Tailwind. The React plugin owns the browser build's handling of `use client` and `use server` directives. The regression verifies that an unrelated module directive still reaches the configured warning handler. The package's source directives and public build are unchanged.

## Production bundle budgets

Build with Node deprecations treated as errors:

```sh
NODE_OPTIONS=--throw-deprecation bun run build-storybook
```

The preview intentionally includes substantial upstream tools and lazily imported grammars. The largest emitted JavaScript module is approximately 1.53 MB raw. Merely moving these modules between chunks does not shrink them. The configuration retains automatic splitting and all supported features.

`.storybook/constants.ts` declares the preview's measured size budgets:

| Measurement                         | Limit           |
| ----------------------------------- | --------------- |
| Each JavaScript chunk, uncompressed | 1,600,000 bytes |
| Each entry chunk, gzip              | 384 KiB         |
| Each shared or lazy chunk, gzip     | 512 KiB         |

Vite's raw chunk warning uses the same 1.6 MB limit. `createStorybookBundleBudgetPlugin` measures the generated JavaScript and fails the build when either its raw or gzip budget is exceeded. The gzip limits are per chunk, not a combined page-load or network budget. Each successful build reports its largest measured values. This changes the preview's explicit budget; it does not claim a reduction in bundle size.

The regression builds an incompressible exported payload below the raw ceiling and confirms that the transfer budget rejects it. Removing the budget plugin makes that test fail because the oversized build succeeds.

## Build scan and metadata caches

The preview registers `src` and `.storybook` as its explicit Tailwind sources, avoiding unrelated repository files. Docgen uses its native file-system cache in `.cache/storybook/docgen`; the plugin validates source, dependency, compiler, and configuration changes. A production-browser smoke test verifies that Docs still renders generated component props.

Rolldown's [plugin timing diagnostic](https://rolldown.rs/reference/InputOptions.checks#bundlertimings) remains enabled. Cold builds can still emit this performance advisory for Tailwind and TypeScript docgen; the verified warm build emitted none. This advisory is separate from the resolved Node deprecation, React directive, and default chunk-size warnings.

## Validation

```sh
bun test ./.storybook/__tests__/createStorybookViteConfig.test.ts
just fix
just check
bun run test:coverage
```

The toolchain tests exercise concurrent TypeScript config loading under Node and Bun, real alias resolution, React directive handling, unrelated warning forwarding, and production size enforcement. Each corresponding regression fails when its fix is temporarily removed. `just check` includes these tests in package verification and opens the standalone production preview in Chromium.
