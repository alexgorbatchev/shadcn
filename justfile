storybook:
    bun run storybook

build:
    bun run build

pack:
    mkdir -p .tmp/packs
    bun pm pack --destination .tmp/packs

check:
    bun run typecheck
    bun run lint
    bun run build
    bun run build-storybook

fix:
    bun x --bun oxfmt --write .
