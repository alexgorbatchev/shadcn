---
created_on: 2026-10-12 16:20
last_modified: 2026-10-12 16:20
status: current
---

# Storybook on GitHub Pages

For repository maintainers, `.github/workflows/storybook-pages.yml` publishes the static catalog from a tagged GitHub Release.

## Repository setup

1. Push the repository and workflow to the destination GitHub repository. Before pushing, inspect outgoing files and commits for private internal domains and anonymize them as required by project policy.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Configure the `github-pages` environment's deployment protection rules to allow release tags. A rule allowing only the default branch prevents release-tag deployments. Apply any required reviewers there.
4. Publish a GitHub Release whose tagged commit contains the workflow. Draft releases, branch pushes, tag pushes alone, and manual workflow dispatch do not deploy. Published prereleases also deploy.

The workflow checks out the release commit using the event's SHA, installs the Bun version declared in `package.json` with the frozen lockfile, checks types and lint/formatting, verifies package rendering, and builds Storybook. Only a successful build can deploy the uploaded `storybook-static/` artifact through GitHub's Pages actions.

Every successful deployment replaces the catalog at the same Pages URL; it does not create per-version sites. Publishing an older release can replace a newer catalog. Deployments share a concurrency group and do not cancel an active deployment.

The workflow publishes no npm package and creates no tags or releases. Browser interactions and coverage remain separate local checks. Production asset URLs use Storybook's relative base, supporting repository subpaths without the development proxy.

## Verification

Run `just fix` and `just check` locally. Before publishing, inspect `storybook-static/` for private internal domains. After deployment, open the URL exposed by the `github-pages` environment and verify the catalog, a component canvas, and its Docs page.

See [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [release event semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#release).
