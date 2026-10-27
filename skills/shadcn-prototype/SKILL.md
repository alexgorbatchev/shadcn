---
name: shadcn-prototype
description: Use when creating, running, editing, or building local React prototype workspaces with the shadcn-prototype command from @alexgorbatchev/shadcn.
author: alexgorbatchev
metadata:
  created_on: 2026-10-27 07:10
  last_modified: 2026-10-27 07:24
  status: current
---

# Local React prototypes

Use the published `@alexgorbatchev/shadcn` package's `shadcn-prototype` executable with Bun 1.4.2. Run `bunx --bun --package @alexgorbatchev/shadcn shadcn-prototype` before the arguments below, or use `bun node_modules/.bin/shadcn-prototype` from an installed consumer.

## Workflow

1. Create a workspace: `shadcn-prototype workspace create ./mockups`. The destination must not already exist. This writes the complete host, three recipes, styles, configuration, local instructions, and package manifest. It performs no installation or network access.
2. Enter the workspace and run `bun install`. This installs the exact component package version used by the runner and the explicitly declared peer and preview dependencies. Commit the resulting lockfile with the prototype source when saving a project.
3. Read `AGENTS.md` and `node_modules/@alexgorbatchev/shadcn/llms.txt`. Read component documentation as needed. All recipe helpers and sample data are included in the workspace.
4. Run `shadcn-prototype workspace start .`. Use the dashboard, projects, and settings recipes as starting points. Copy a recipe directory under `src/prototypes/` to add a screen, then edit its `prototype.ts` title, description, and component. The folder name supplies its URL identifier. Keep component and fixture imports local or use the public package APIs.
5. Compose React components and connect the requested interactions. The shared `ScenarioContent` provides populated, empty, loading, and error examples; specialize these states when the design requires different behavior. Data resets when the canvas reloads or Reset data is pressed.
6. Inspect the running screen in a browser. Exercise its primary interaction, empty/error/loading scenarios, light/dark themes, compact/comfortable density, and mobile width. Fix errors, broken controls, and unintended overflow. Use Open screen for the direct canvas URL.
7. Run `just check` in the generated workspace to typecheck and build. Report the preview location, editable files, observed behavior, and any unverified requirements. Stop servers owned by validation when finished. If a prerequisite fails, report the command and error, try the documented remedy, and continue independent source work.

## Command reference

- `skill`: no arguments or command-specific options. Prints the Skills CLI installation command and this skill's URL, offline, with identical output in human and agent modes.
- `workspace`: parent command; displays the workspace command subtree with `-h, --help`.
- `create` with required `<directory>`: required destination path, resolved relative to the current working directory. Creates missing parent directories; rejects existing destinations, including empty directories and symlinks. A failed copy removes only the destination created by that invocation.
- `start` with optional `[directory]`: directory defaults to `.`. Starts the workspace's installed Vite preview on IPv4 loopback, with live updates, no automatic browser launch, and strict port selection. `-p, --port <number>` accepts integer 0–65535, default 5173. Port 0 requests an available port. SIGINT/SIGTERM stop the owned preview child.
- `build` with optional `[directory]`: directory defaults to `.`. Runs the workspace's installed Vite production build, writing `dist/`. Build does not typecheck; `just check` does both.
- `help [command]`: Commander-generated help; use `help workspace` for the subtree or append `-h, --help` to any command.
- Root `-V, --version`: prints the package version alone.
- `-h, --help`: available on every command. Human output uses a command tree and truncates to terminal width; agent output uses untruncated bullets.

Set `AGENT=1`, `AGENT=true`, or `AGENT=yes` for agent output and an agent-skill alert at the beginning of help. Other values select human mode. `COLUMNS` supplies the human help width when stdout has no terminal width; fallback is 100. Paths in output fold the home directory to `~`. Normal output goes to stdout; errors go to stderr. Help/version succeed with exit 0, argument errors and local failures exit 1, and preview/build commands propagate their child exit status.

Preview tooling reads the workspace's Vite configuration and environment. Vite supports `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` for a trusted reverse proxy. The generated host reads URL query parameters `prototype` (default `dashboard`), `scenario` (`populated`, `empty`, `loading`, `error`), `theme` (`light`, `dark`), `density` (`comfortable`, `compact`), and `canvas=1` (screen without workbench controls). Unknown prototype identifiers show an error. Unknown scenario/theme/density values use populated/dark/comfortable. Viewport selection affects the iframe's actual viewport; a fixed viewport wider than the window scrolls in the preview region.

Missing dependencies: run `bun install` inside the workspace. Missing workspace: pass the directory created by `workspace create`. Port occupied: stop your own server or select another `--port`. This tool operates local source code and sample data; real APIs and persistence require explicit application implementation.
