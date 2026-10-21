---
created_on: 2026-10-14 06:35
last_modified: 2026-10-20 22:28
status: current
---

# npm releases

For maintainers, `.github/workflows/npm-release.yml` publishes `@alexgorbatchev/shadcn` when a tagged GitHub Release is published. Manual dispatch can retry an existing published release. Branch pushes, tag pushes alone, and draft releases do not publish.

## npm setup

Configure the package's npm trusted publisher with these exact values:

- GitHub owner: `alexgorbatchev`
- Repository: `shadcn`
- Workflow filename: `npm-release.yml`
- Environment: leave blank; the job does not use a GitHub environment.
- Allowed action: enable direct `npm publish`.

The workflow uses npm OIDC authentication on a GitHub-hosted runner, with no npm token secret. Package settings must be accessible before configuring its trusted publisher. If the package has not been published, a maintainer must first publish from the repository using their own npm account with permission to the `@alexgorbatchev` scope:

```sh
npm publish --dry-run
npm publish --access public
```

Review the dry-run file listing before publishing. This first publication is a separate authorized action. Configure trusted publishing afterward, and use a new version for the first automated release; npm versions cannot be republished. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for setup and first-publish expiry requirements.

## Release procedure

1. Set the intended version in `package.json`. Run `just fix`, `just check`, `bun run test:visual`, and `npm publish --dry-run`, and inspect the file listing before publishing. Use `just pack` only when a local archive is needed for inspection.
2. Commit and push the package and workflow. Inspect outgoing content for private internal domains as required by project policy.
3. Create a tag exactly matching `v` plus the package version, such as `v0.0.2`. Publish a GitHub Release for that tag. The tagged commit must contain the workflow and version change.
4. Mark versions containing a prerelease suffix, such as `0.0.3-beta.1`, as GitHub prereleases. Prereleases publish to npm's `next` tag; stable releases publish to `latest`.
5. Verify the workflow and the published npm version. Storybook deployment runs independently from npm publication.

For a failed publication, first check whether the version reached npm. If it is absent, retry the existing release without moving its tag:

```sh
gh workflow run npm-release.yml --ref main -f release_tag=v0.0.14 -F prerelease=false
```

Use the intended release tag and its actual prerelease flag. Both visual validation and publication check out that tag. The workflow verifies the published GitHub Release and emits npm verbose diagnostics, including token-exchange failures, to distinguish authentication errors from missing packages.

Publication requires the reusable [visual regression workflow](./visual-regression.md) to pass. The publishing job rejects mismatched tags and prerelease versions marked as stable, installs the frozen Bun lockfile, checks types and lint/formatting, and runs package rendering tests in development and production. It runs `npm publish` directly from the repository, letting npm create the package internally. The existing `prepack` hook builds the package; npm selects its contents using `package.json`'s `files` field and automatically includes the README and license. The package manifest is published without custom rewriting, including its Bun patch metadata; the build bundles the patched implementations.

Node 24 runs npm 12.2.0 for trusted publishing; Bun remains the install, build, and test tool. Local `just pack` also requires npm and writes the archive to `.tmp/packs/`. Package tests install an npm-created archive in isolated Bun consumers. npm publishes with public access and provenance. Re-running an already published version fails rather than overwriting it. Publishing an older stable version can move `latest` backward. The full interaction suite and coverage remain separate local checks.
