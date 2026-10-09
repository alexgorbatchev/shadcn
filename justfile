storybook:
    bun run storybook

build:
    bun run build

pack:
    bun run build
    bun scripts/pack.ts

check:
    bun run typecheck
    bun run lint
    bun run test:package
    bun run build-storybook

fix:
    bun x --bun oxfmt --write .
