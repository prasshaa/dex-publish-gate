# Dex Publish Gate — End-to-End Build Roadmap
*Status check · builds on the discovery notes, PRD, and variable inventory*

---

## Phase 0 — Discovery ✅ Done
Understand WalkieTalkie's actual flow, stack signals, personas, and what's confirmed vs. assumed. *(→ 01-discovery-notes.md)*

## Phase 1 — Problem framing ✅ Done
Problem statement, goal, why-now, personas, success metrics (north star/guardrail/leading), v1 scope boundary. *(→ 02-prd.md)*

## Phase 2 — Variable inventory & scope-cutting ✅ Done
Exhaustive breakdown by input modality, tagged by territory (gate vs. production-agent), tiered by actual guest exposure. *(→ 03-variable-inventory.md)*

## Phase 3 — Rubric & decision logic design ✅ Done
Concrete pass/flag/fail criteria per check, organized into six clusters, each tagged with its judgment method (deterministic, LLM-as-judge, or a maintained data dependency). Established the checklist model over a weighted score, since these are independent trust/legal/safety categories, not one quality spectrum. *(→ 05-rubric-and-decision-logic.md)*

## Phase 4 — System architecture ✅ Done
Where the gate sits in the flow, its inputs and outputs, per-cluster processing methods, sync-vs-async handling, and how six cluster results aggregate into one routing decision. *(→ 06-architecture.md)*

## Phase 5 — Human-in-the-loop & review workflow ✅ Done
Reviewer role (the existing production team, repurposed), authority split across clusters, the reviewer's interface, available actions, and the feedback loop back to the contributor. *(→ 07-review-workflow.md)*

## Phase 6 — Edge cases & failure modes — Partially covered
One case is actually implemented, not just discussed: if a judge call fails or returns something unparseable, the eval engine fails safe to "hold for review" rather than silently passing — built and working in the POC. Everything else on the original list is still open, not yet worked through as a set:
- Multi-language or code-switched narration
- Borderline/ambiguous calls where reasonable reviewers might disagree
- Adversarial phrasing designed to slip past a check
- A contributor disputes or appeals a hold — is there a process?
- A tour is edited post-publish — does it need to re-pass the gate?
- Rubric drift over time — who owns updating it, and how do old decisions reconcile with new thresholds?

## Phase 7 — Evaluation & testing strategy ✅ Mostly done
Covered in depth: the offline/online/inline evaluation framework, mapped specifically onto this gate — golden-set construction and per-cluster precision/recall for offline evals, sampling auto-published tours to catch silent false negatives for online evals, and the deterministic layer plus output-validation/fail-safe handling for inline guardrails. Also includes the full four-part LLM-as-judge prompt structure (system instruction, rubric, few-shot examples, output schema) and a worked example tracing one transcript through the whole pipeline. *(→ 08-pipeline-deep-dive.md)*
Still open: the actual golden test set itself doesn't exist yet — the deep dive defines the methodology, not the dataset.

## Phase 8 — Non-functional requirements — Partially covered, scattered
No dedicated doc, but real ground covered elsewhere: latency and the sync/async tradeoff are addressed in the architecture doc; privacy and data retention for raw audio/photo PII are addressed at length across the variable inventory and rubric docs. Cost has not been seriously addressed — no estimate exists for what running four parallel model calls per tour costs at real contributor volume.

## Phase 9 — POC definition & build ✅ Done
Three working builds, not one:
1. The original confidence-routing prototype (the first proof-of-work piece)
2. A contributor/reviewer POC — three views (contributor, reviewer queue with real actions, and a live single-check judge call)
3. A full eval engine — paste any transcript, real deterministic pre-filters, four parallel live LLM-as-judge calls, aggregate decision with reasons and suggested fixes

Honest scope note: the safety/language check is genuinely live and working. The route-walkability check is illustrated with realistic examples in the static POCs but has no real maps API behind it — a convincing mockup, not a functioning check. *(→ poc/01, poc/02, poc/03)*

## Phase 10 — Rollout & phasing plan — Not started
Not yet written: which checks ship first, what runs in shadow mode before being trusted to block anything, and the graduation criteria to move a check from shadow to enforced.

## Phase 11 — Success measurement, for real — Partially started
The metrics themselves are now properly formalized as named metrics with formulas (SAPR, UER) in the PRD, including the caveat that SAPR alone can't distinguish gate performance from upstream content quality. Still open: what the actual data source is for each metric, and — since no reviewer role is confirmed today — what serves as ground truth to measure the gate against once it's live.

## Phase 12 — Stakeholders & sign-off — Not started
Who else this touches beyond product/engineering: legal (defamation, IP, copyright checks), trust & safety if that function exists, and comms/brand for reputational-risk categories.

---

## What's genuinely missing right now: short version

Problem definition, design, and a working proof of concept are all done — discovery, PRD, variable inventory, rubric, architecture, review workflow, and three functioning POCs. What's left is mostly the work of turning a design into an operable system: an actual labeled test set (not just the methodology for one), a real cost estimate, a rollout/phasing plan, and the unresolved edge cases from Phase 6. The single biggest open question across all of it is still the same one from Phase 5 and Phase 11: no reviewer role is confirmed to exist today, which limits both who a held tour goes to and what "ground truth" the gate could even be measured against.
