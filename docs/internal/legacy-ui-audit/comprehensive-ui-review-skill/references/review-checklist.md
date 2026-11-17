# Review checklist

Use these checks for every applicable component, exported part, story, and composed state. Derive additional checks from new APIs and behaviors. Record inapplicability explicitly; the examples below are investigation categories, not a component inventory or a list of presumed defects.

## Layout, alignment, and readable content

- Compare text baselines, icon centers, column headings and cells, label/control alignment, action insets, and mirrored start/end layouts. Measure actual rectangles and text ranges; distinguish visible misalignment from harmless fractional rounding.
- Check all size and density variants for monotonic sizing, fixed padding overwhelming small controls, zero-sized content boxes, stretched indicators, overflowing icons, and inconsistent inline alignment.
- Inspect spacing in grouped controls, separators, choice cards, forms, adjacent panels, output labels, and nested containers. Include external rings, shadows, absolute-positioned badges/reactions, and collapsed margins when evaluating collisions.
- Verify narrow and short viewport behavior: wrapping, minimum versus maximum width constraints, flex shrinking, offscreen controls, trapped scrolling, and reachable close actions. A clipping ancestor can hide a layout defect from an overflow test.
- Test empty, short, long, multiline, and localized content permitted by the API, including RTL text and punctuation. Check placeholder clipping, labels, list markers, table cells, chart labels, and shortcut columns.
- Inspect typography at readable scale: actual font loading and fallback, family, weight, size, line height, letter spacing, cascade layers, inheritance, and clipping of ascenders/descenders.
- Evaluate text contrast using rendered foreground, composited background, opacity, font size/weight, and the applicable verified standard. Record these inputs and the threshold used. Separate text contrast from control boundaries, focus visibility, and distinguishable adjacent surfaces.

## Primitive consistency and visual hierarchy

- Compare all implementations of the same semantic role: standalone and grouped controls, labels, menu items, selection indicators, notification surfaces, floating panels, close/action buttons, and their wrappers.
- Compare fills, borders, radii, shadows, padding, title/body typography, separators, icons, disabled treatments, invalid treatments, and focus indicators in matching states.
- Check nested radius relationships, double borders, compounded opacity, ring collisions, detached active indicators, and surfaces that merge with their surroundings. Judge the complete composition, including borders and spacing, before declaring a hierarchy defect.
- Identify parallel primitives with identical behavior or divergent contracts, repeated variant definitions, duplicate utilities, and multiple owners of the same styling. Document intentional abstraction boundaries; resemblance alone does not establish redundant code.
- Distinguish hover, focus, active, checked, selected, mixed, disabled, readonly, invalid, loading, and completed states. Verify that visible glyphs and activity indicators agree with native and accessible state.

## Interaction, overlays, and direction

- Use keyboard input to reach each focusable control. Verify the actual focus target and visible indicator, including primitives that focus an internal input. Inspect clipping, duplicate outlines, and focused-invalid or disabled-selected combinations.
- Check accessible names, label associations, roles, native form behavior, keyboard order, dismissal, focus containment/return, and disabled behavior through supported primitive APIs.
- Open every overlay-bearing story and applicable nested/submenu state. Check portal content rather than trigger-only captures: anchor alignment, collision handling, available space, scroll affordances, z-order, pointer hit targets, backdrop, body scroll lock, and exit cleanup.
- Exercise theme, density, and direction inheritance through nested providers and portals, including explicit local overrides. Inspect both CSS variables and context-derived behavior.
- Check inline/block direction, physical versus logical offsets, arrows, ordering, end-aligned metadata, sidebar panel/spacer/content relationships, and mirrored navigation behavior.
- Exercise overflowing lists and virtualized or streaming content at start, middle, and end; verify controls, masks, anchors, and loading/completion indicators at those boundaries.

## Motion and visual artifacts

- Inspect entrance, exit, replacement, direction changes, collapse/expand, interrupted transitions, and repeated open/close cycles under normal motion. Use recordings or timed frame inspection where a settled screenshot cannot establish behavior.
- Verify emitted selectors and keyframes, matching native state attributes, transitions on the intended properties, and removal of temporary transforms, masks, scroll locks, and layers after completion.
- Repeat motion-capable states with native reduced-motion preference. Inspect computed animation/transition behavior and usable final state; a local missing override may be covered by global CSS, while an override may lose by specificity.
- Check perpetual indicators, scroll-driven effects, detached fades, flashes, layout jumps, stale animation states, and spinners that persist after success. Confirm whether transforms change painted bounds without changing layout bounds.
- Compare motion conventions against the current project contract. Do not infer valid normal-motion behavior from a reduced-motion test pass or infer visible correctness merely because every animation name resolves.

## Source and package contracts

- Follow props, refs, events, callback-valued class/style functions, controlled/uncontrolled state, native render composition, and semantic element selection through wrappers.
- Check stable initial rendering, effect cleanup, subscription lifecycle, stale state, SSR-safe browser access, and deterministic server/client markup. Label nondeterministic server output separately from a reproduced hydration failure.
- Verify token definitions, utility generation/scanning, selector validity, cascade/inheritance, invalid CSS values, and interaction between library styles and application layers.
- Inspect public exports, declaration generation, peers, module formats, CSS/font assets, and package consumption. When verifying packaging, use the packed artifact in a separate consumer; repository aliases can hide missing exports and assets.
- Inspect all dependency patches, every changed module format, and the actual public dependency path. A broken unused entry point has different scope from a broken shipped bundle.
- Report substantiated correctness/security bugs, stubs, unfinished paths, dead code, excessive coupling, maintainability concerns, and unnecessary work observed in the reviewed implementation. Do not invent performance impact from style preferences or file size alone.

## Catalog and validation integrity

- Compare story titles, args, initial states, play-function end states, and screenshots. A checked story that deliberately toggles off needs separate initial and completed-state inspection.
- Check debug output, merged status labels, unlabeled visible controls, inappropriate placeholders, mismatched examples, and story-specific width constraints. Preserve examples intentionally demonstrating native rendering or custom callbacks when proposing correction targets.
- Inspect all Docs content and independently themed Docs containers. Default-open portals can interfere across examples; verify the isolated canvas when attributing a defect.
- Determine which tests assert visible behavior versus only accessibility attributes. Confirm suite selection, excluded tags, browser coverage, coverage thresholds, visual baseline selection, and CI enforcement from current configuration.
- Reproduce warnings and crashes in isolation before attributing them to components. Separate denied browser permissions, unavailable engines/assets, interrupted play functions, stale builds, and preview-cache contamination from application failures.
