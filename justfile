mod prototype "cli/justfile"

set dotenv-filename := ".env.local"
set positional-arguments

export SHADCN_DEV_HOST_SUFFIX := env("SHADCN_DEV_HOST_SUFFIX", ".localhost")
export NODE_DISABLE_COMPILE_CACHE := "1"

default:
    @just --list

storybook *args: llm-docs
    bun run storybook dev --host 127.0.0.1 -p 6006 --no-open "$@"

build:
    bun scripts/runValidation.ts bun scripts/build.ts

pack *args: build
    mkdir -p .tmp/packs
    bun scripts/runValidation.ts npm pack --pack-destination .tmp/packs "$@"

# Build before npm creates the archive, including publish --dry-run
publish *args: build
    bun scripts/runValidation.ts npm publish "$@"

# Generate the LLM index and Storybook reference pages
llm-docs:
    bun scripts/buildLlmDocs.ts

check: typecheck lint test-prototype test-package build-storybook test-preview build-gallery

typecheck:
    bun run tsc --noEmit

lint: lint-source fmt-check unused

lint-source:
    bun run oxlint --deny-warnings src .storybook scripts cli templates/prototype/src templates/prototype/vite.config.ts

fmt-check:
    bun run oxfmt --check .

unused:
    bun run ts-unused check tsconfig.json

# Run the ordinary browser, native, prototype, package, and preview suites
# PrototypeWorkbench runs in test-prototype; DragDrop runs in test-stories
test: llm-docs test-prototype test-stories (test-native "--exclude" ".storybook/__tests__/PrototypeWorkbench.test.tsx" "--exclude" "src/components/__tests__/DragDrop.test.tsx") test-package build-storybook test-preview

test-prototype:
    just prototype test
    bun scripts/runValidation.ts bun run vitest run --config .storybook/vitest.prototype.config.ts --coverage

test-stories *args: llm-docs
    bun scripts/runValidation.ts bun run vitest run --config .storybook/vitest.config.ts "$@"

test-native *args:
    bun scripts/runValidation.ts bun run vitest run --config .storybook/vitest.native.config.ts "$@"

test-package: build
    bun scripts/runValidation.ts bun test scripts/__tests__ ./.storybook/__tests__/createStorybookViteConfig.test.ts

build-storybook: llm-docs
    bun scripts/runValidation.ts bun run storybook build

test-preview:
    bun scripts/runValidation.ts bun test scripts/storybookPreview.test.ts

test-coverage *args: llm-docs
    bun scripts/runValidation.ts bun run vitest run --config .storybook/vitest.coverage.config.ts --coverage "$@"

test-contrast *args: llm-docs
    bun scripts/runValidation.ts bun run vitest run --config .storybook/vitest.contrast.config.ts "$@"

test-reduced-motion *args: llm-docs
    bun scripts/runValidation.ts bun run vitest run --config .storybook/vitest.reduced-motion.config.ts "$@"

test-visual *args: llm-docs
    bun scripts/runValidation.ts bun run vitest run --config .storybook/vitest.visual.config.ts Button.stories.tsx Badge.stories.tsx Card.stories.tsx Input.stories.tsx ScrollArea.stories.tsx "$@"

test-visual-update:
    just test-visual --update

build-gallery:
    bun run vite build --config scripts/snapshot-gallery/vite.config.ts

fix:
    bun run oxfmt --write .

# Install the locked development dependencies
install-dependencies:
    bun install --frozen-lockfile

install-browsers:
    bun run playwright install chromium webkit

# Prepare all test browsers and check the local preview prerequisite
setup: install-dependencies install-browsers
    devhost --version

# Start the devhost Storybook preview
run: llm-docs
    devhost start

# Browse saved visual regression baselines through devhost
snapshots:
    devhost start snapshots
