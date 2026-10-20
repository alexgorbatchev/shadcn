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

fix:
    bun x --bun oxfmt --write .
