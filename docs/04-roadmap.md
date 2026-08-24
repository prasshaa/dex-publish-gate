# Dex Publish Gate — End-to-End Build Roadmap
*Status check before designing further · builds on the discovery notes, PRD, and variable inventory*

---

## Phase 0 — Discovery ✅ Done
Understand WalkieTalkie's actual flow, stack signals, personas, and what's confirmed vs. assumed. *(→ walkietalkie-discovery-notes.md)*

## Phase 1 — Problem framing ✅ Done
Problem statement, goal, why-now, personas, success metrics (north star/guardrail/leading), v1 scope boundary. *(→ dex-publish-gate-prd.md)*

## Phase 2 — Variable inventory & scope-cutting ✅ Done
Exhaustive breakdown by input modality, tagged by territory (gate vs. production-agent), tiered by actual guest exposure. *(→ dex-publish-gate-variable-inventory.md)*

---

## Phase 3 — Rubric & decision logic design — Not started
For each Tier 1 variable (and hard-gate Tier 2 items), define what "pass," "flag," and "fail" actually mean in concrete, judgeable terms — not just a variable name. This is where "insensitive framing" or "route safety" turns into something a check can actually evaluate consistently. Also: how do individual check results combine into a single routing decision (mirrors the confidence-routing logic from the earlier prototype, but needs to be rebuilt for this specific set of checks, not assumed to carry over unchanged).

## Phase 4 — System architecture — Not started
Where does the gate physically sit (one service after the production agent, or checks distributed at multiple points)? What are its exact inputs (final script text, audio, route coordinates) and outputs (publish/hold decision, flagged spans, reasons)? Which checks are deterministic/rule-based vs. model-judged, and why? Sync or async — does publishing wait on the gate, or does the gate race against a "close enough to instant" review?

## Phase 5 — Human-in-the-loop & review workflow — Not started
WalkieTalkie has no confirmed reviewer role today. If a tour gets held, who does it go to, and what does their interface look like? What can they do — approve, edit, reject, escalate? What's their SLA? This is a real open gap flagged back in discovery — it needs an actual answer, not just a "human reviews it" placeholder.

## Phase 6 — Edge cases & failure modes — Not started
Worth deliberately brainstorming before building, not discovering during testing:
- Gate service is down or times out — fail open (publish anyway) or fail closed (hold everything)?
- Multi-language or code-switched narration
- Borderline/ambiguous calls where reasonable reviewers might disagree
- Adversarial phrasing designed to slip past a check
- A contributor disputes or appeals a hold — is there a process?
- A tour is edited post-publish — does it need to re-pass the gate?
- Rubric drift over time — who owns updating it, and how do old decisions get reconciled with new thresholds?

## Phase 7 — Evaluation & testing strategy — Not started
How do you know the gate actually works before it's trusted with real publishing decisions? Building a golden/labeled test set, measuring precision and recall per check (not just an overall vibe), adversarial red-teaming, and a plan for human calibration if any check uses an LLM judge (does a human agree with the judge's calls often enough to trust it unsupervised?).

## Phase 8 — Non-functional requirements — Not started
- **Latency:** the gate can't quietly undo WalkieTalkie's "under 10 minutes" promise — what's the budget?
- **Cost:** if checks involve model calls at scale across many tours, what does that cost, and does it scale sanely with contributor volume?
- **Privacy & data retention:** flagged directly by the PII/bystander questions earlier — how long is raw audio/photo data kept, who can access it, and does flagging something for review create its own privacy exposure (a reviewer now sees more raw content than a guest ever would)?

## Phase 9 — POC definition & build — Not started
What "a working POC anyone can use" actually needs, concretely:
- A small set of realistic sample tour drafts spanning the routing tiers (clean, flagged, hard-gate-failed) — richer than the three samples in the first prototype, informed by the actual rubric from Phase 3
- The decision logic actually implemented against that rubric, not just illustrative
- Two views, since Phase 5 established there are two users: a **contributor view** (draft + what got flagged and why) and a **reviewer view** (a queue of held tours, with enough context to decide fast)
- A clear, honest label on what's simulated (no real Headout backend, no real contributor data) versus what the logic itself demonstrates

## Phase 10 — Rollout & phasing plan — Not started
Mirrors the "first 30 days" structure from the original case study, but scoped to this gate specifically: which checks ship first (likely the cheapest, highest-confidence hard gates), what runs in shadow mode before it's trusted to actually block anything, and what the graduation criteria are to move a check from shadow to enforced.

## Phase 11 — Success measurement, for real — Partially started
Metrics were named in the PRD (north star/guardrail/leading), but not yet operationalized: what's the actual data source for each, and specifically — since there's no confirmed reviewer role yet — what serves as ground truth to measure the gate against once it's live?

## Phase 12 — Stakeholders & sign-off — Not started
Who else this touches beyond product/engineering: legal (defamation, IP, copyright checks), trust & safety if that function exists, and comms/brand for reputational-risk categories. Worth naming even in a case-study context, since a real senior PM would flag this rather than assume a gate ships in a vacuum.

---

## What's genuinely missing right now, if you want the short version
Everything from Phase 3 onward. The work so far has been entirely *problem definition* — understanding the system, framing why the gate matters, and scoping what it should cover. Nothing yet defines *how a check decides pass/fail*, *what the gate is built of*, *who's on the other end of a flagged tour*, or *how you'd know it's working*. That's normal sequencing, not a gap in the work done so far — but worth naming plainly before moving into design, since Phase 3 (rubric) and Phase 5 (human-in-the-loop) are probably the two with the biggest unresolved surface area.
