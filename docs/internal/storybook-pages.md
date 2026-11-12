---
created_on: 2026-10-12 16:20
last_modified: 2026-11-06 03:32
status: current
---

# Storybook on GitHub Pages

For repository maintainers, `.github/workflows/storybook-pages.yml` publishes the static catalog from a tagged GitHub Release. Manual dispatch retries an existing published release without changing its tag.

## Repository setup

1. Push the repository and workflow to the destination GitHub repository. Before pushing, inspect outgoing files and commits for private internal domains and anonymize them as required by project policy.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Configure the `github-pages` environment's deployment protection rules to allow release tags. A rule allowing only the default branch prevents release-tag deployments. Apply any required reviewers there. Manual retries use a tag ref as well, preserving tag-only deployment protection.
4. Publish a GitHub Release whose tagged commit contains the workflow, or manually dispatch a published release tag for retry. Draft releases, branch pushes, and tag pushes alone do not deploy. Published prereleases also deploy.

The workflow checks out the release tag and verifies that it identifies a published release matching the package version. Its build job uses `mcr.microsoft.com/playwright:v1.64.1-noble` with preinstalled browsers and system dependencies, Node 24 with npm 12.2.0 (matching [release qualification](./npm-releases.md)), Just 1.58.0, and the Bun version declared in `package.json`. It restores cached Bun dependency downloads, installs the frozen lockfile, then runs `just typecheck`, `just lint`, `just test-package`, and `just build-storybook`. Only a successful build can deploy the uploaded `storybook-static/` artifact through GitHub's Pages actions.

## Retry a published release

When the published release tag already contains the required workflow, dispatch that tag. Replace `vX.Y.Z` below with the actual release tag:

```sh
gh workflow run storybook-pages.yml --ref vX.Y.Z -f release_tag=vX.Y.Z
```

If the published release tag lacks a workflow repair, merge and validate that repair on `main`, then create a separate CI tag for the retry. First verify that the source tag supplies every task entrypoint used by the repaired workflow. Tags predating the native Just recipes cannot use the current workflow; they need a compatible workflow revision.

```sh
git tag -a ci-storybook-vX.Y.Z-retry main -m "Retry Storybook workflow for vX.Y.Z"
git push origin refs/tags/ci-storybook-vX.Y.Z-retry
gh workflow run storybook-pages.yml --ref ci-storybook-vX.Y.Z-retry -f release_tag=vX.Y.Z
```

The workflow definition comes from the dispatch ref; the catalog source comes from the `release_tag` input. The published-release and version checks reject draft, missing, or mismatched releases. Rerunning an old failed run uses its original workflow definition. Keep the published package tag unchanged and retain the CI tag as the workflow revision used for recovery.

Every successful deployment replaces the catalog at the same Pages URL; it does not create per-version sites. Publishing an older release can replace a newer catalog. Deployments share a concurrency group and do not cancel an active deployment.

The workflow publishes no npm package and creates no tags or releases. Browser interactions and coverage remain separate local checks. Production asset URLs use Storybook's relative base, supporting repository subpaths without the development proxy.

## Verification

Run `just fix` and `just check` locally. Before publishing, inspect `storybook-static/` for private internal domains. After deployment, open the URL exposed by the `github-pages` environment and verify the catalog, a component canvas, and its Docs page.

See [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [release event semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#release).
