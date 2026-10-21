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

# Start the development preview
run *args:
    bun run storybook {{ args }}
