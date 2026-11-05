---
created_on: 2026-10-14 06:35
last_modified: 2026-11-05 01:53
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
npm exec --yes --package=npm@12.2.0 -- npm publish --dry-run
npm exec --yes --package=npm@12.2.0 -- npm publish --access public
```

Review the dry-run file listing before publishing. This first publication is a separate authorized action. Configure trusted publishing afterward, and use a new version for the first automated release; npm versions cannot be republished. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for setup and first-publish expiry requirements.

## Release toolchain

Use npm 12.2.0 for local archive qualification and publication, matching the explicit version installed by `.github/workflows/npm-release.yml`. The workflow runs Node 24; npm 12.2.0 supports Node `^22.22.2 || ^24.15.0 || >=26.0.0`. Bun remains pinned by `package.json` for dependency installation, builds, and tests.

The commands below use [npm exec](https://docs.npmjs.com/cli/v11/commands/npm-exec/) to select the exact npm package without replacing the global client. It caches the requested package and puts its executable on the child process's `PATH`, including nested `npm pack` calls in `just check` and `just pack`. Verify the selected version before qualifying a release:

```sh
npm exec --yes --package=npm@12.2.0 -- npm --version
```

The result must be `12.2.0`. Update the workflow pin and these local commands together when changing npm versions; an ambient npm client can select different archive contents.

## Release procedure

1. Set the intended version in `package.json`. Install Playwright Chromium with `bun x --bun playwright install --with-deps chromium` on a fresh Linux host, and verify the npm version as above.
2. Run the required local checks and dry run. Stop on any failure:

   ```sh
   just fix
   npm exec --yes --package=npm@12.2.0 -- just check
   bun run test:visual
   npm exec --yes --package=npm@12.2.0 -- npm publish --dry-run
   ```

3. Inspect the dry-run file listing before publishing. Confirm the public export targets, executable prototype CLI, generated documentation, licenses, and templates are present, and project patch files and transient artifacts are absent. npm also checks the registry during the dry run and rejects an already-published version; qualify the intended unpublished version. When an archive is needed for inspection, including inspection of an already-published source version, use `npm exec --yes --package=npm@12.2.0 -- just pack`; it writes to `.tmp/packs/` and does not certify publication eligibility.
4. Commit and push the package and workflow. Inspect outgoing content for private internal domains as required by project policy.
5. Create a tag exactly matching `v` plus the package version, such as `v0.0.2`. Publish a GitHub Release for that tag. The tagged commit must contain the workflow and version change.
6. Mark versions containing a prerelease suffix, such as `0.0.3-beta.1`, as GitHub prereleases. Prereleases publish to npm's `next` tag; stable releases publish to `latest`.
7. Verify the workflow and the published npm version. Storybook deployment runs independently from npm publication.

For a failed publication, first check whether the version reached npm. If it is absent, retry the existing release without moving its tag:

```sh
gh workflow run npm-release.yml --ref main -f release_tag=v0.0.14 -F prerelease=false
```

Use the intended release tag and its actual prerelease flag. The workflow definition comes from `main`; both visual validation and publication check out the specified release tag. This permits workflow repairs without moving an existing package tag. The workflow verifies the published GitHub Release and emits npm verbose diagnostics, including token-exchange failures, to distinguish authentication errors from missing packages.

Publication requires the reusable [visual regression workflow](./visual-regression.md) to pass. The publishing job rejects mismatched tags and prerelease versions marked as stable, installs the frozen Bun lockfile and Chromium with its system dependencies, checks types and lint/formatting, and runs package rendering tests in development and production. It also checks the installed prototype runner, generated workspace interactions, CLI line/function coverage, and browser recipe coverage. The visual job's browser installation does not carry over to the publishing job. It runs `npm publish` directly from the repository, letting npm create the package internally. The existing `prepack` hook builds the package; npm selects its contents using `package.json`'s `files` field and automatically includes the README and license.

npm 12.2.0 [excludes the exact patch files declared in `patchedDependencies`](https://github.com/npm/cli/blob/v12.2.0/node_modules/npm-packlist/lib/index.js#L370-L393), even when `files` includes their directory, and [removes `patchedDependencies` from the archived manifest](https://github.com/npm/cli/blob/v12.2.0/node_modules/pacote/lib/dir.js#L89-L128). The source manifest and local patches remain unchanged. Consumers receive the patched runtime implementations bundled into `dist`, not project-local patch instructions. Patched peers remain bundled by `scripts/build.ts`; their optional peer declarations provide the types referenced by generated declarations. Development-only patches affect local build/test tools and are not consumer dependencies.

Package tests install an npm-created archive in isolated Bun consumers. npm publishes with public access and provenance. Re-running an already published version fails rather than overwriting it. Publishing an older stable version can move `latest` backward. The full interaction suite and coverage remain separate local checks.
