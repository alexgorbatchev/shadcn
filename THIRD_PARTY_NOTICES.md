# Third-party notices

Component sources are adapted from the official shadcn/ui `base-nova` registry (https://ui.shadcn.com/), retrieved on 2026-10-08. Local changes cover design tokens, density, module organization, scalar slider thumb handling, native aspect-ratio geometry, semantic prop types, preservation of Base UI state callbacks, native pagination links, drawer transitions without scale or bounce, the native Base UI navigation trigger icon, OTP placeholder presentation, cmdk selection styling, DayPicker's native root and day-button focus lifecycle, directional carousel keyboard navigation, reduced-motion behavior, framed notification surfaces without scale transitions, chart colors connected to the document theme, native chart payload formatting/sorting, and sharp conversation surfaces with native interactive rendering and logical reaction positioning.

The palette, radii, typography, and density metrics are derived from the devhost design references (Copyright (c) 2026 Alex Gorbatchev, MIT). They are copied into this package; there is no devhost runtime dependency.

Message and Attachment are adapted from the same official registry. Local changes preserve start-aligned message headers, measure footer geometry for avatar placement, preserve native attachment action callbacks, and keep vertical media full-width across sizes. MessageScroller uses the native `@shadcn/react` 0.3.1 provider, parts, and hooks; local presentation uses fade-only controls, reduced-motion scrolling, and normal row layout for stable message jumps/history preservation. The shimmer, horizontal and bottom scroll-fade, and scrollbar utilities in `src/theme.css` are adapted from the MIT-licensed `shadcn` 4.21.4 published `dist/tailwind.css`, retrieved on 2026-10-08 (https://unpkg.com/shadcn@4.21.4/dist/tailwind.css). They use semantic text colors and native direction selectors; the upstream legacy shimmer compatibility rule is excluded.

Marker separator content retains native flex shrinking so long labels wrap inside narrow conversation columns. Decorative icons and short separator labels retain their centered composition.

JetBrains Mono is supplied by `@fontsource-variable/jetbrains-mono` under OFL-1.1. The dependency includes its font license, and font files are served locally by the consuming app. Other runtime dependencies retain their own licenses in their installed packages.

Questionnaire adapts the official registry's fifteen styled parts around `@shadcn/react` 0.3.1 native form primitives. Local changes provide sharp controls, semantic colors, density-aware inputs/actions, distinct radio/checkbox indicators, and reduced-motion transitions. The native input reset implementation is patched to restore default text when an unselected freeform input is detached from its form. MessageScroller's native root composes caller refs with internal registration using the package's native ref helper. Its viewport routes pointer-down through the existing reader-interruption handler while preserving caller callbacks, allowing text selection to release live following. Its row position helpers use layout offsets, including offset-parent borders and intermediate scroll offsets, so transform entrances do not change anchoring or preservation coordinates. The package bundles these corrected implementations; React remains an external peer. The version-pinned patch is included under `patches/`, and the upstream MIT notice below covers the bundled source.

## shadcn/ui

Sidebar adapts the official provider and styled parts, preserving custom render/ref contracts, keyboard toggling within each provider, consumer-owned persistence, and native mobile Sheet behavior. Local changes support density, cancelled toggle events, observation without controlled state, inert offcanvas panels, configured mobile widths, and centered icons with accessible collapsed labels. Separator uses Base UI's current orientation attributes, and Tooltip preserves native state callbacks.

Field preserves the official form composition and filters empty error messages before rendering an alert. Popover preserves native className callbacks on its popup, title, and description. Storybook form, date picker, and data table examples follow the official composition guides; the data table uses TanStack Table v9's native API.

Calendar and PersianCalendar share the adapted shadcn presentation. PersianCalendar uses the maintained `@daypicker/persian` 10.0.2 native component, retaining its Solar Hijri arithmetic, locale labels, numerals and Gregorian Date selection values. Its native month formatter remains intact rather than applying the Gregorian Calendar formatter.

Carousel uses native Embla 8.6 behavior and events. Local presentation uses up/down icons for vertical controls in both text directions and preserves caller reduced-motion breakpoint options while disabling animation. The autoplay examples use `embla-carousel-autoplay` 8.6.0 with explicit start/stop controls; the plugin remains an optional consumer dependency.

Chart uses the MIT-licensed `cssesc` 3.0.0 runtime dependency for identifier escaping during both server and browser rendering. Its native Recharts composition permits shrinking inside grid tracks without replacing responsive measurement. Tooltip and legend portals retain the chart's direction and color-variable scope through context. Guide examples preserve native custom data keys, axis reversal, series selection, initial tooltip state and value-label rendering.

The optional `src/typeset.css` stylesheet adapts the official shadcn/typeset source at `apps/v4/app/(app)/(typeset)/typeset.css` in https://github.com/shadcn-ui/ui, retrieved on 2026-10-08. It retains native semantic HTML, container-relative sizing, low-specificity component-layer rules, logical spacing, responsive tables, and append-stable flow. Local changes use this package's font/density and semantic highlight tokens and guard Typeset root styles inside opted-out subtrees. The upstream MIT notice below covers this stylesheet.

Checkbox and Switch preserve native state-based className callbacks. Switch uses logical inline positioning for its thumb so both sizes stay within the track in RTL.

Table forwards explicit direction to its native table and overflow container, uses inline-start header alignment, and clears checkbox-cell padding at the inline end. Tabs uses logical leading/trailing icon padding, a one-pixel list inset and full-height triggers so compact icons remain inside their controls while preserving the native density height.

MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Sonner

The package bundles Sonner 2.0.8 from https://github.com/emilkowalski/sonner. The version-pinned patch in patches/sonner@2.0.8.patch measures notification height after each render, skips removed notifications, and preserves unchanged height state. This corrects density changes without remounting the native host or replacing its timers, callbacks, IDs or notification store. Both ESM and CommonJS implementations are patched.

MIT License

Copyright (c) 2023 Emil Kowalski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Input OTP

The package bundles input-otp 1.5.0 from https://github.com/guilhermerodz/input-otp. The version-pinned patch in patches/input-otp@1.5.0.patch consumes defaultValue when initializing native internal state and excludes it from forwarded input props. Both ESM and CommonJS implementations preserve controlled value precedence and native input editing. React remains an external peer.

MIT License

Copyright (c) 2024 Guilherme Rodz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## assistant-ui

The optional assistant-ui catalog adapts actual component sources from https://github.com/assistant-ui/assistant-ui and the official registry at https://r.assistant-ui.com/. Native adapters retain the published assistant-ui runtime and primitives. Local changes integrate this package’s Base UI controls, semantic theme tokens, densities, native portal containers where supported, reduced-motion behavior, and explicit module entrypoints. Upstream dependency packages retain their own notices.

MIT License

Copyright (c) 2026 AgentbaseAI Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Vitest Istanbul coverage

The development-only patch backports the upstream counter-retention fix from https://github.com/vitest-dev/vitest/pull/11529. It is distributed under the following license.

MIT License

Copyright (c) 2021-Present VoidZero Inc. and Vitest contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
