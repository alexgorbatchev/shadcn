`shadcn-alexgorbatchev` is a standalone React component library for Bun applications that need the sharp, monospace devhost design language. Install it as an npm-compatible package and explore its components in the local interactive Storybook catalog. Consuming apps do not depend on the devhost project.

# What It Does

- **Consistent controls**: Provides buttons, forms, selections, navigation, overlays, and loading states.
- **Two densities**: Offers compact 20px controls and comfortable 28px controls, with provider and component overrides.
- **Theme choices**: Supports light, dark, and system preference, with customizable accent colors and fonts.
- **Interactive reference**: Shows component variants and states in Storybook with editable controls and source examples.

# How It Works

1. Install the package archive in a Bun React project and import its theme into your Tailwind stylesheet.
2. Wrap the app in a theme provider and a density provider, then compose the exported components.
3. Open the local Storybook catalog to explore components, switch palettes and densities, and inspect examples.

# How it Really Works

1. The stylesheet supplies semantic tokens and base body styling. Your Tailwind build scans the installed package to generate component utilities. Font loading is optional; importing `fonts.css` serves JetBrains Mono through your app's asset pipeline.
2. Theme preference persists in browser local storage, and system mode follows the operating system color preference. The theme provider sets `data-theme` and `color-scheme` on the document root, so dialogs and menus share that palette. Use one provider per document. Density also follows components into their portals. A component's `density` prop overrides its own presentation; nest a `DensityProvider` to change a subtree and its popups together. `useTheme()` throws outside `ThemeProvider`.
3. Storybook's Theme and Density toolbars change the component examples. Docs backgrounds and example frames follow the selected palette; the preview starts in dark mode with comfortable density.

# Prerequisites

- [Bun](https://bun.com/docs), validated with 1.4.0.
- [React](https://react.dev) and React DOM 19.3, as specified by the package peer dependencies.
- [Tailwind CSS](https://tailwindcss.com/docs/installation) v4; the consumer build must process the imported theme.

The package targets client-rendered Bun React applications.

# Installation

Install the local archive from a consuming project:

```sh
bun add /home/alex/development/projects/shadcn-alexgorbatchev/.tmp/packs/shadcn-alexgorbatchev-0.1.0.tgz
```

The archive must exist before installation. Package preparation and contributor commands are documented in [AGENTS.md](./AGENTS.md#commands). Its filename includes the package version.

# Quick Start

For Bun's native HTML server, install its Tailwind plugin:

```sh
bun add -d tailwindcss bun-plugin-tailwind
```

Register the plugin in your app's `bunfig.toml`:

```toml
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

In `src/styles.css`, import the theme after Tailwind and explicitly scan the installed package. The `@source` path is relative to this stylesheet; Tailwind excludes `node_modules` from automatic scanning. See [Tailwind source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources).

```css
@import "tailwindcss";
@import "shadcn-alexgorbatchev/theme.css";
@import "shadcn-alexgorbatchev/fonts.css";
@source "../node_modules/shadcn-alexgorbatchev/dist";
```

Omit the `fonts.css` import if your app supplies its own font. Bun's plugin registration is documented in [HTML and static sites](https://bun.com/docs/bundler/html-static#tailwind-css).

Import that stylesheet from your app entry, then render:

```tsx
import { useState, type ReactElement } from "react";
import { Button, DensityProvider, ThemeProvider } from "shadcn-alexgorbatchev";
import "./styles.css";

export function App(): ReactElement {
  const [count, setCount] = useState(0);
  return (
    <ThemeProvider defaultTheme="system">
      <DensityProvider density="comfortable">
        <Button onClick={() => setCount(count + 1)}>Clicked {count} times</Button>
        <Button density="compact" variant="outline">
          Compact action
        </Button>
      </DensityProvider>
    </ThemeProvider>
  );
}
```

# Configuration

| Option                       | Type                            | Default                         | Description                                                            |
| :--------------------------- | :------------------------------ | :------------------------------ | :--------------------------------------------------------------------- |
| `ThemeProvider.defaultTheme` | `"light" \| "dark" \| "system"` | `"system"`                      | Initial preference when storage has no saved value.                    |
| `ThemeProvider.storageKey`   | `string`                        | `"shadcn-alexgorbatchev-theme"` | Local storage key for the preference.                                  |
| `ThemeProvider.forcedTheme`  | `"light" \| "dark"`             | unset                           | Overrides the displayed palette without changing the saved preference. |
| `DensityProvider.density`    | `"compact" \| "comfortable"`    | `"comfortable"`                 | Density for descendants and their portals.                             |
| Component `density`          | `"compact" \| "comfortable"`    | inherited                       | Local override on styled components that expose the prop.              |

`useTheme()` returns `theme`, `resolvedTheme`, and `setTheme`. Call `setTheme("light")`, `setTheme("dark")`, or `setTheme("system")` from a component inside the provider.

Override tokens after the theme imports. This example uses the existing success palette as the primary accent:

```css
:root,
[data-theme="light"],
[data-theme="dark"] {
  --ag-font: ui-sans-serif, system-ui, sans-serif;
  --primary: var(--success);
  --primary-foreground: var(--success-foreground);
  --ring: var(--success);
}
```

# Component Catalog

| Area                     | Components                                                                                        |
| :----------------------- | :------------------------------------------------------------------------------------------------ |
| Actions and status       | Button, Badge                                                                                     |
| Forms and selections     | Checkbox, Combobox, Field, Input, InputGroup, Label, RadioGroup, Select, Slider, Switch, Textarea |
| Structure and navigation | Accordion, Card, Separator, Tabs                                                                  |
| Overlays                 | AlertDialog, Dialog, DropdownMenu, Popover, Tooltip                                               |
| Loading                  | Skeleton                                                                                          |
| App configuration        | DensityProvider, ThemeProvider                                                                    |

Use the composed parts exported from the package root, such as `DialogTrigger`, `DialogContent`, and `DialogTitle`. Storybook provides working compositions, variants, disabled states, and action callbacks. The local preview starts with `bun run storybook` and binds to `127.0.0.1:6006`.

Use the Theme toolbar to select light, dark, or system palettes; Docs and example frames follow that selection. Local and routed previews can run on separate ports with independent dependency caches. Reload an open preview after restarting it on a different port.

# Devhost Preview

From this repository, start the configured Storybook service:

```sh
devhost start
```

Open [shadcn.example.com](https://shadcn.example.com). The manifest allocates a port automatically and serves Storybook through the shared devhost HTTPS proxy. The hostname must resolve to the machine running devhost, and the managed Caddy instance must be running (`devhost caddy start`).

Storybook binds to IPv4 loopback and allows the configured hostname in both Storybook and Vite. Caddy listens on all interfaces and serves HTTP as well as HTTPS, so the external devbox gateway can reach it. The direct `bun run storybook` preview remains available on `127.0.0.1:6006`.

# Troubleshooting

- **Components render without styling**: Check that your app imports the stylesheet, processes it with Tailwind v4, and registers the package's `dist` directory with `@source`. Adjust that path if your stylesheet lives somewhere other than `src/styles.css`.
- **The custom font does not appear**: Import `fonts.css` for the bundled font, or override `--ag-font` with your app's font stack.
- **Theme controls throw a provider error**: Render components that call `useTheme()` inside the document's `ThemeProvider`.
- **Docs use an unexpected palette**: Select the desired Theme toolbar option. System uses the saved preview preference when one exists, otherwise the operating system preference. Reload an open preview after its server restarts on a different port.

# License

[MIT](./LICENSE). See [third-party notices](./THIRD_PARTY_NOTICES.md) for component and font attribution.
