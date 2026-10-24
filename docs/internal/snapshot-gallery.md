---
created_on: 2026-10-24 07:59
last_modified: 2026-10-24 07:59
status: current
---

# Snapshot gallery

The gallery shows all PNG baselines under `src/components/stories/**/__screenshots__/` on one page. Component headers show source paths relative to the Git root; when no matching component filename exists, the header shows the story path. Each thumbnail includes its snapshot filename and opens the original PNG in a new tab.

Run `just run` to start Storybook and the `snapshots` devhost service. The gallery host is `shadcn-snapshots` followed by `SHADCN_DEV_HOST_SUFFIX`, defaulting to `https://shadcn-snapshots.localhost`. The existing untracked `.env.local` suffix applies to both services.

To start only the gallery through the same environment setup:

```sh
just snapshots
```

Filter by component, story path, theme, density, viewport, or any other part of the filename. Clearing the filter restores every baseline. The responsive grid virtualizes rows so only nearby thumbnails are mounted. The default content preview trims outer pixels matching the image’s top-left background pixel, with an eight-pixel margin. Switch Preview to Full frame to inspect original whitespace and alignment. Both modes preserve aspect ratio and fit inside a compact frame; open the original to inspect details at native resolution.

Vite discovers new, removed, and updated snapshots during development. The gallery displays saved baselines, not fresh captures, actual/diff failure attachments, or pass/fail results. Run `bun run test:visual` separately to compare current rendering against those baselines.

The gallery lives under `scripts/snapshot-gallery/` and does not enter the published component package. Its browser checks run with package verification; run them directly with `bun test scripts/__tests__/snapshotGallery.test.ts`.
