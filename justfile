set dotenv-filename := ".env.local"

export SHADCN_DEV_HOST_SUFFIX := env("SHADCN_DEV_HOST_SUFFIX", ".localhost")

storybook:
    bun run storybook

build:
    bun run build

pack:
    mkdir -p .tmp/packs
    npm pack --pack-destination .tmp/packs

check:
    bun run typecheck
    bun run lint
    bun run test:package
    bun run build-storybook
    bun run test:preview

fix:
    bun x --bun oxfmt --write .

# Install the locked development dependencies
setup:
    bun install --frozen-lockfile
    devhost --version

# Start the devhost Storybook preview
run:
    devhost start
