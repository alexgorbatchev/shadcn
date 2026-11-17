---
name: comprehensive-ui-review
description: Use when asked to comprehensively review a component library or Storybook catalog for visual defects, inconsistent primitives, interaction and motion issues, and source-level diligence.
author: alexgorbatchev
metadata:
  created_on: 2026-10-18 13:51
  last_modified: 2026-10-18 13:55
  status: current
---

Review the complete current catalog and its source. Discover components, stories, states, and configuration from the repository on every invocation; never use a historical component list or count as the scope. A comprehensive review uses no sampling. Explicit user restrictions still apply: label a restricted review accurately instead of claiming comprehensive coverage.

Keep application code, permanent tests, baselines, and dependencies unchanged unless fixes are separately authorized. Temporary fixtures, browser probes, and validation builds may support the review in an owned workspace. This skill does not authorize publishing, committing, or merging.

Ground findings in inspected source, rendered behavior, executed checks, and verified contracts. Historical reports supply hypotheses and investigation techniques, not current defects or expected measurements. Use the available filesystem, browser, image-viewing, and execution tools; no particular model, vendor, or delegation facility is required.

## 1. Establish the review basis

1. Read current repository instructions, manifests, design contracts, and applicable code-review, language, UI, browser, and documentation guidance. Verify installed dependency behavior against its source or official version-appropriate documentation when a conclusion depends on it.
2. Record the revision, relevant uncommitted changes, toolchain, browser engines, and operating environment. A commit identifier alone does not describe a dirty checkout. Use an owned snapshot or worktree when builds or formatters could interfere with concurrent work; include the requested working-tree contents when that is the review target.
3. Use the requested report path when authorized to write it; otherwise choose an unused `review--comprehensive.md` path or a unique suffix. Preserve reports owned by others. Keep scratch work under a dedicated project `.tmp/` child and worktrees under `.workspaces/`. Record ownership of processes and output directories.
4. Read [report-contract.md](references/report-contract.md) before collecting evidence. Maintain its coverage ledger throughout the review, including across resumed sessions.

## 2. Discover the whole inventory

1. Enumerate runtime modules, public exports, component parts, hooks, contexts, themes, styles, fonts, assets, stories, fixtures, tests, preview infrastructure, build/pack scripts, workflows, configuration, and dependency patches. Include relevant untracked implementations. Record explicit exclusions for generated output, dependency trees, binary assets, and resolution data; inspect their configuration and loading paths where relevant.
2. Build a fresh preview from the recorded source. Read its actual story and documentation index, then reconcile it against source stories and exports. Check missing stories, orphaned examples, hidden entries, and components absent from the public API. Test tags and CLI filters must not define review coverage.
3. Define how files, component families, exported parts, stories, Docs entries, and matrix cases are counted. Preserve stable identifiers and source relationships; one source file need not equal one family.
4. Derive each component's states and variants from props, implementations, stories, and contracts. Add newly discovered states to the ledger. Create isolated fixtures for supported behavior missing from the catalog; do not quietly omit components without stories.
5. Fingerprint reviewed files and preview inputs. Repeat discovery on resume and before closing the review. Newly added files, exports, stories, variants, and changed dependencies become pending work. Invalidate affected source readings, captures, and results; rebuild before comparing changed code. If concurrent drift prevents verification, identify the reviewed snapshot and affected pending work explicitly.

Do not measure an existing static build until its correspondence with the review basis is verified. If source and rendered output disagree, resolve that mismatch before reporting a current component defect.

## 3. Read all source and trace contracts

Read every in-scope implementation and supporting file in full. Search and code-navigation results locate relationships; truncated output, selected functions, and automated scans do not complete a file review. Inspect minified patches by formatting both sides and examining every semantic change with its enclosing function, including alternate entry points.

Trace components through shared tokens, composition wrappers, native primitives, context providers, portals, exports, and consumer builds. Read the entire [review checklist](references/review-checklist.md); apply each relevant check and record why any check is inapplicable. Extend the checklist for newly discovered behavior rather than forcing new components into existing categories.

Record source review separately from rendered inspection. A class string is evidence of intent; verify emitted CSS, selector matches, state attributes, and computed styles before claiming its visual effect. Likewise, a passing render test does not establish layout, motion, or hydration correctness.

## 4. Define and execute the rendered matrix

1. Discover supported themes, densities, directions, sizes, variants, responsive breakpoints, and browser targets. Define a finite matrix from these contracts. Include desktop and narrow widths (320px for this repository), short viewports for tall surfaces, and both sides of relevant responsive breakpoints.
2. Cover the full theme × density × viewport × supported direction combinations for every story and supplemental fixture on the declared browser targets. Apply normal and reduced motion to every motion-capable case. Include each documented size, variant, state, and valid state combination, including focused-invalid and disabled-selected controls. Mark genuinely unsupported combinations inapplicable with a contract-based reason; workload is not such a reason.
3. Distinguish initial render, story play completion, explicit interaction states, transition states, and settled output. Wait for verified readiness: assets and fonts loaded, the expected state reached, and finite transitions settled. Use bounded timeouts to surface failures. A fixed delay alone does not establish readiness. For streaming or perpetual animation, define observable checkpoints instead of waiting forever.
4. Exercise every applicable action path: open and close, nested and submenu surfaces, keyboard navigation, pointer interaction, scroll boundaries, validation, submission, loading, completion, interruption, and reset. Use actual user interactions. Do not infer an opened overlay's quality from its trigger or a collapsed state from an expanded capture.
5. Inspect every required rendered case visually. Label captures and contact sheets with story, state, and matrix configuration; record which were actually opened and inspected. Zoom to readable detail and inspect the full scrollable content. Captured images, aggregate metrics, and sheets never opened are unreviewed.
6. Inspect every Docs entry through its full content, including below-fold examples and opened overlays. Verify Docs theming independently of iframe canvases. Treat virtualized content and internally scrolling regions as explicit additional states.
7. Run automated layout/style probes across the same inventory. Record clipping, overflow, overlap, element bounds, typography, spacing, radii, focus treatment, colors, and animation behavior. Treat heuristics as candidates; account for intentional overlap, visually hidden elements, truncation contracts, and transformed bounds before classifying defects.

Keep every applicable matrix cell pending until inspected or explicitly blocked. Batch execution as needed without reducing the matrix. Independent tools may run concurrently when isolated; use additional reviewers only when authorized. Require their per-case coverage and evidence under the same rules, and identify delegated observations without presenting them as independent rechecks.

## 5. Compare equivalent primitives and composed surfaces

Build comparison groups from semantic roles and actual composition dependencies, not a fixed list of component names. Include duplicate or competing implementations even when they currently look identical.

Compare equivalent states under identical theme, density, viewport, direction, content, and interaction conditions. Use computed-style tables for control dimensions, text metrics, icon sizes, padding, gaps, borders, radii, fills, focus/invalid/disabled indicators, overlay treatment, and motion. Check adjacent and nested surfaces in realistic compositions as well as isolated stories.

Verify the intended contract before calling a difference a defect. Equal colors, different radii, fixed icon sizes, or a native control are not automatically wrong. Separate intentional differences, documented contract violations, and design questions. Report redundant implementations or conflicting styling ownership as maintenance findings when no distinct rendering failure is established.

## 6. Reproduce and classify findings

1. Reproduce each candidate on the recorded revision in its exact state and configuration. Measure geometry and computed styles, and inspect the relevant source. Use narrow probes for compiled utilities, SSR/hydration, package exports, or patched entry points when required.
2. Establish observed behavior, expected behavior and its basis, user impact, correction location, and evidence strength. Separate direct rendered confirmation, executable source confirmation, source inference, delegated observation, and unresolved diagnostics.
3. Identify whether the cause belongs to a reusable primitive, composition, story, preview, dependency, or build configuration. Do not recommend changing a component contract to compensate for an example's deliberately constrained layout.
4. Deduplicate by root cause and correction target. Combine repeated manifestations with all affected cases listed; split unrelated problems bundled under one component. Give each actionable issue one stable ID. Keep design questions and unverified suspicions outside confirmed-defect totals.
5. Reconcile conflicting measurements by matching revision, state, theme, density, viewport, fonts, browser, and measurement method. Reproduce or retain the contradiction as unresolved; do not choose the more convenient report or higher count.

Describe correction targets without implementing fixes. If visual intent is unresolved, present concrete rendered alternatives only when a decision is necessary, following the project's design-decision workflow.

## 7. Run checks and evaluate diligence

Discover current commands, filters, exclusions, assertions, and CI triggers from the repository. Run required validation and the available full interaction, contrast, reduced-motion, narrow-layout, native-browser, visual-regression, coverage, and package-render suites within the authorized scope. Record unsupported or unavailable checks explicitly. Do not copy historical commands or counts without verifying them.

Run repository-required `just fix` and `just check` in an owned validation copy when formatting could mutate the reviewed source or someone else's work. Report the exact validation basis and any formatter changes; do not silently replace the inspected source. Distinguish a whole command succeeding from its early stages succeeding before interruption.

Inspect what passing tests actually assert and which components their filters include. Determine whether checked-in CI enforces the available checks; do not infer external branch protection from workflow files. Report correctness and security concerns, contract mismatches, dead or unfinished code, duplication, modularity problems, and substantiated performance/API gaps encountered during the full source review. Keep them within the evidence and scope of this audit.

## 8. Handle interruptions and missing capabilities

Preserve the report, ledger, revision, owned fixtures, and relevant verification results. For each blocked item record the missing input or capability, affected cases, failed attempt, recovery attempted, and exact condition needed to resume. Continue independent authorized review work. Browser failure blocks rendered claims, not source inspection; a failed capture is not a component defect.

On resume, reconcile inventory and fingerprints before reusing results. Retake invalid or stale captures. If evidence disappears, reproduce it or downgrade the claim and disclose the loss. Keep raw logs in the execution system and link native check results or existing local evidence where useful; do not create a second evidence bundle. Mark temporary links as local and transient, and include enough reproduction detail for the report to remain useful without them.

## 9. Deliver and verify coverage

Write the report using [report-contract.md](references/report-contract.md), with methodology at the top. Reconcile unique issue counts, source coverage, rendered coverage, test outcomes, and remaining gaps against the ledger. Keep the report independent of model identity and avoid historical hardcoded catalog totals.

Declare the comprehensive review complete only when every discovered in-scope file has been read, every applicable matrix case and Docs section has been inspected, every candidate is resolved or explicitly classified, required checks have finished with their outcomes recorded, and the inventory still matches the stated basis. Defects and failed checks may remain findings; unexecuted required checks and unreviewed cases remain incomplete work. Never claim every possible runtime combination is correct.

Stop owned review servers and browser sessions. Remove obsolete owned scratch artifacts after their last use, preserving requested deliverables and evidence needed for pending work. In the final response link the report, give unique confirmed issue counts and actual coverage, summarize check outcomes and limitations, and include `DUE DILIGENCE` when concerns were found.
