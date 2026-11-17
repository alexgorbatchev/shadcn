# Coverage and report contract

## Working ledger

Maintain a compact structured ledger in the owned review workspace. Use existing tooling or a table/structured file; a custom framework is unnecessary. Derive totals from its entries rather than typing historical counts.

| Record        | Required fields                                                                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Review basis  | Revision, relevant working-tree contents/fingerprints, preview build identity, environment, start time, latest inventory reconciliation                                                                           |
| Source        | Relative path, content fingerprint, scope/category, whole-file inspection status, related components, finding IDs                                                                                                 |
| Catalog       | Stable story or Docs ID, family counting rule, exported parts, source paths, variants/states, missing-example status                                                                                              |
| Rendered case | Story/fixture/Docs section, action path, initial/play/transition/settled checkpoint, theme, density, viewport, direction, motion, browser, capture status, visual-inspection status, reviewer, evidence reference |
| Candidate     | Stable ID, affected cases, cause/correction target, classification, severity, evidence strength, reproduction result, duplicate/retraction links                                                                  |
| Check         | Exact command, revision, selection/exclusions, completed stages, exit status, pass/fail/skip counts, warnings, execution-result reference                                                                         |
| Blocker       | Affected records, missing requirement, evidence, attempted recovery, preserved resume state, exact unblock condition                                                                                              |

Use explicit states such as pending, reviewed, blocked, and inapplicable. Keep capture and inspection separate. Preserve the IDs of failed and skipped cases instead of counting only successful captures. Only count an inapplicable case when its recorded contract makes it impossible or unsupported.

Retain the source inventory and per-family coverage summary in the report or its existing reporting location. Keep detailed execution data in the working ledger; link it with its local/transient status. A checklist or hash list proves bookkeeping, not that inspection occurred.

## Report order

Place the methodology immediately below the report title and required document metadata. Use the following order, adapting formatting to repository conventions without dropping required information.

1. **Methodology and review basis:** actual steps performed; revision and working-tree basis; inventory derivation; build freshness; tools/browser environment; readiness conditions; source, rendered, Docs, motion, and automated-check methods. Describe completed work in the past tense and planned work as pending.
2. **Coverage and limits:** discovered versus fully read files; families, exported parts, stories, Docs entries/sections; exact matrix dimensions; applicable, captured, visually inspected, blocked, and unreviewed cases; missing stories; exclusions with reasons; inventory drift and evidence-retention limits. Do not collapse screenshot count into reviewed-component count.
3. **Findings:** unique confirmed issues sorted by severity, with design questions and unverified candidates clearly separated. Give totals by severity and ownership layer; do not count diligence repetitions, warnings, or affected-story counts as additional defects.
4. **Validation:** commands and exact outcomes for this basis, including failed, interrupted, skipped, pending, and unrun checks. Link native CI or existing local logs when available. State what passing checks fail to establish.
5. **DUE DILIGENCE:** source/contract, security, duplication, maintainability, unfinished-feature, package, and validation-enforcement concerns. Cross-reference existing issue IDs instead of duplicating findings. Separate confirmed issues from unresolved warnings.
6. **Outstanding work and resume state:** remaining cases, blockers, lost/stale evidence, ownership, and precise next actions. Use “complete for the recorded inventory and matrix” only when the completion conditions hold; otherwise state the incomplete scope.

Do not reproduce raw execution logs, create a redundant evidence bundle, or use model/provider names as part of the methodology or report identity. If the user requests token accounting, use available actual usage records with a cutoff, units, included participants, and cache/reasoning inclusion semantics. Avoid double counting subsets; report unavailable usage honestly and label checkpoints that exclude later work.

## Finding format

Use one stable issue ID per independently actionable root cause. Record:

- **Title and severity:** the observable failure and affected component or surface.
- **Classification and ownership:** confirmed defect, design-consistency question, or unresolved candidate; primitive, composition, story, preview, dependency, or build.
- **Expected behavior and basis:** the relevant contract, verified standard, documented intent, or directly demonstrated usability requirement. Mark inferred intent as a question.
- **Reproduction:** revision, story/fixture, relevant props/content, full matrix configuration, readiness/checkpoint, and numbered interaction steps sufficient to reproduce.
- **Observed behavior and impact:** concrete measurements with units and reference edges, rendered symptoms, and the affected user action. For contrast, include rendered colors/background composition, text metrics, and the verified threshold.
- **Evidence and confidence:** direct browser observation, executable source probe, source inference, or delegated observation; source path and line; native execution or existing artifact reference; any missing evidence or unverified causal link.
- **Scope and correction target:** demonstrated affected cases, related cases not yet reproduced, implementation ownership, and the contract a correction must preserve.

Use severity consistently:

| Severity | Impact                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------- |
| P0       | Demonstrated critical harm or systemic failure requiring immediate response; justify explicitly           |
| P1       | Essential interaction or information inaccessible, a crash, or a severe accessibility/correctness failure |
| P2       | Material clipping, overlap, wrong state, broken motion, or contract failure with bounded scope            |
| P3       | Minor alignment, spacing, typography, or maintenance defect with limited functional impact                |

Base severity on demonstrated impact and reach, not on how striking a screenshot looks. Keep design questions outside confirmed-defect severity totals until their expected behavior is established.

## Reconciliation examples

- Two reports describe the same notification font mismatch under typography and duplicate primitives: retain one root-cause issue with both manifestations.
- Several controls look different: compare matching states and contracts before turning the differences into defects; split unrelated causes even if they share a comparison table.
- A new component is exported without a story: add its implementation and supported states to the inventory, record the catalog gap, and inspect an isolated fixture rather than excluding it.
- A dependency patch fails on one entry point while the shipped bundle uses another: state the demonstrated failing path and the unaffected path separately.
- A suite passes while a visible indicator is missing: retain the reproduced defect and identify the assertion gap. Do not treat the suite pass as contradictory proof.
- Two contrast ratios disagree: compare the actual rendering inputs and states before accepting either conclusion. Preserve an unresolved contradiction if reproduction is unavailable.
