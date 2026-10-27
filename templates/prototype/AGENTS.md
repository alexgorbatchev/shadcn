# Prototype workspace

Build interactive React screens using the installed `@alexgorbatchev/shadcn` package.

## Commands

- Install: `just setup`
- Local preview: `just run`
- Agent preview: `just run-ai`
- Typecheck and production build: `just check`
- Static output: `just build` writes `dist/`

Read `node_modules/@alexgorbatchev/shadcn/llms.txt` before using components. Resolve its relative links from the package directory.

## Authoring

- Each folder under `src/prototypes/` has a `prototype.ts` default export containing a title, description, and React component. The folder name is the prototype identifier. Copy a recipe folder to add a screen; Vite discovers it automatically.
- Keep components under the recipe's `components/` directory and sample data beside them. Shared host components and scenario rendering live in `src/components/`; all helpers are included locally.
- Compose the package's public components and semantic tokens. Install optional feature peers before importing their entry points. Keep reusable component capabilities in the library instead of overriding its internals.
- `PrototypeProps.scenario` selects populated, empty, loading, or error. Extend the example state handling to match the requested flow. Implement controls and state transitions; declare any simulated backend behavior in the delivery notes.
- The host renders each screen in an iframe so responsive styles and portals use its actual viewport. Open screen exposes a direct URL. Use one ThemeProvider per document; the host supplies theme and density to the canvas.
- Recipe state is in memory. Reset data, changing preview settings, or reloading the canvas restores the fixtures. Implement persistence only when required by the prototype.
- Validate primary interactions, form errors, empty/loading/error states, light/dark themes, both densities, and mobile sizing in a browser. Run `just check` before delivery and report any failures or unverified behavior.
