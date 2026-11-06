---
created_on: 2026-10-24 07:59
last_modified: 2026-11-06 05:50
status: current
---

# Snapshot gallery

The gallery shows all PNG baselines under `src/components/stories/**/__screenshots__/` on one page. Component headers show source paths relative to the Git root; when no matching component filename exists, the header shows the story path. Each thumbnail includes its snapshot filename and opens the original PNG in a new tab.

Run `just run` to start Storybook and the `snapshots` devhost service. The gallery host is `shadcn-snapshots` followed by `SHADCN_DEV_HOST_SUFFIX`, defaulting to `https://shadcn-snapshots.localhost`. The existing untracked `.env.local` suffix applies to both services.

To start only the gallery through the same environment setup:

```sh
just snapshots
```

Choose a component in the searchable Component dropdown by typing its name or repository-relative path, then selecting a suggestion with the pointer or arrow keys and Enter. Clear the selection with Show all components to restore every component. The separate snapshot text filter matches theme, density, viewport, or any other part of the snapshot filename, and combines with the selected component. Clearing either filter preserves the other. The responsive grid virtualizes rows so only nearby thumbnails are mounted. The default content preview trims outer pixels matching the image’s top-left background pixel, with an eight-pixel margin. Switch Preview to Full frame to inspect original whitespace and alignment. Both modes preserve aspect ratio and fit inside a compact frame; open the original to inspect details at native resolution.

Vite discovers new, removed, and updated snapshots during development. The gallery displays saved baselines, not fresh captures, actual/diff failure attachments, or pass/fail results. Run `just test-visual` separately to compare current rendering against those baselines.

The gallery lives under `scripts/snapshot-gallery/` and does not enter the published component package. `just build-gallery` builds it into `.tmp/snapshot-gallery/`. The production build groups React, React DOM, and Scheduler into a shared runtime chunk, allowing that code to retain its own cache identity when gallery code changes. Other modules retain automatic chunking, and Vite's default chunk-size warning remains enabled. Splitting the runtime does not reduce the total JavaScript needed to load the gallery.

The browser checks run with package verification. Run development and production checks together with `bun test scripts/__tests__/snapshotGallery.test.ts scripts/__tests__/snapshotGalleryBuild.test.ts`. Production checks build into a disposable directory, enforce the resolved build's chunk-size warning limit against emitted JavaScript, and exercise chunk loading, virtual scrolling, keyboard filtering, preview modes, and original PNG access through Vite's preview server. The build runs in a separate process with `NODE_ENV=production` so development-server tests retain their own environment.
