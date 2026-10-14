---
created_on: 2026-10-14 06:35
last_modified: 2026-10-14 12:33
status: current
---

# npm releases

For maintainers, `.github/workflows/npm-release.yml` publishes `@alexgorbatchev/shadcn` when a tagged GitHub Release is published. Branch pushes, tag pushes alone, draft releases, and manual dispatch do not publish.

## npm setup

Configure the package's npm trusted publisher with these exact values:

- GitHub owner: `alexgorbatchev`
- Repository: `shadcn`
- Workflow filename: `npm-release.yml`
- Environment: leave blank; the job does not use a GitHub environment.
- Allowed action: enable direct `npm publish`.

The workflow uses npm OIDC authentication on a GitHub-hosted runner, with no npm token secret. Package settings must be accessible before configuring its trusted publisher. If the package has not been published, a maintainer must first publish the prepared archive using their own npm account with permission to the `@alexgorbatchev` scope:

```sh
just pack
npm publish ./.tmp/packs/alexgorbatchev-shadcn-0.0.2.tgz --access public --ignore-scripts
```

Use the archive for the intended version; its filename changes with `package.json`. This first publication is a separate authorized action. Configure trusted publishing afterward, and use a new version for the first automated release; npm versions cannot be republished. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for setup and first-publish expiry requirements.

## Release procedure

1. Set the intended version in `package.json`. Run `just fix`, `just check`, `bun run test:visual`, and `just pack`, and inspect the archive before publishing.
2. Commit and push the package and workflow. Inspect outgoing content for private internal domains as required by project policy.
3. Create a tag exactly matching `v` plus the package version, such as `v0.0.2`. Publish a GitHub Release for that tag. The tagged commit must contain the workflow and version change.
4. Mark versions containing a prerelease suffix, such as `0.0.3-beta.1`, as GitHub prereleases. Prereleases publish to npm's `next` tag; stable releases publish to `latest`.
5. Verify the workflow and the published npm version. Storybook deployment runs independently from npm publication.

Publication requires the reusable [visual regression workflow](./visual-regression.md) to pass. The publishing job rejects mismatched tags and prerelease versions marked as stable, installs the frozen Bun lockfile, checks types and lint/formatting, and runs package rendering tests in development and production. It publishes the archive created by `scripts/pack.ts`, which omits development scripts, dependencies, and Bun patch-install metadata from the consumer manifest. The build already bundles the patched implementations.

Node 24 supplies npm for trusted publishing; Bun remains the install, build, test, and packing tool. npm publishes with public access and provenance. Re-running an already published version fails rather than overwriting it. Publishing an older stable version can move `latest` backward. The full interaction suite and coverage remain separate local checks.
