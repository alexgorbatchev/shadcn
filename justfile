set dotenv-filename := ".env.local"

export SHADCN_DEV_HOST_SUFFIX := env("SHADCN_DEV_HOST_SUFFIX", ".localhost")

storybook:
    bun run storybook

build:
    bun run build

pack:
    mkdir -p .tmp/packs
    npm pack --pack-destination .tmp/packs

# Generate the LLM index and Storybook reference pages
llm-docs:
    bun scripts/buildLlmDocs.ts

check:
    bash scripts/test-git-hooks.sh .githooks
    bun run typecheck
    bun run lint
    bun run test:package
    bun run build-storybook
    bun run test:preview
    bun run vite build --config scripts/snapshot-gallery/vite.config.ts

fix:
    bun x --bun oxfmt --write .

# Install the locked development dependencies and the publishing Git hooks
setup:
    bun install --frozen-lockfile
    git config core.hooksPath .githooks
    devhost --version

# Start the devhost Storybook preview
run: llm-docs
    devhost start

# Browse saved visual regression baselines through devhost
snapshots:
    devhost start snapshots
