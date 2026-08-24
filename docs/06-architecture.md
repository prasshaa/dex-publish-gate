# Dex Publish Gate — System Architecture
*Phase 4 · builds on the rubric · turns six clusters into one working pipeline*

---

## 1. Where the gate sits

```
Production agent (writes script, picks photos, sequences route)
        ↓
   [ PUBLISH GATE ]  ← new, this is what we're designing
        ↓
   publish decision: AUTO-PUBLISH / TARGETED REVIEW / FULL REVIEW
        ↓
   Dex app (guest-facing)
```

The gate is a single checkpoint the production agent's output must pass through before anything reaches the Dex app — not scattered checks bolted onto different parts of the existing pipeline. One clear boundary, one clear owner.

---

## 2. Inputs the gate receives, per tour

- **Final narration script**, per chapter/checkpoint (not the raw transcript — Cluster 1, 3, 4 run against this)
- **Route/checkpoint geodata** — the sequenced path and coordinates (Cluster 5)
- **Selected photos**, if any made it into the final tour (Cluster 2, 3 — hard-gate items only, per the Tier 2 lighter-touch decision)
- **Raw audio/photo pointers**, kept accessible but not embedded in the main flow — needed only for the raw-capture-sensitive PII/bystander cases flagged earlier, where risk exists even in content the agent didn't select

---

## 3. Per-cluster processing

| Cluster | Runs on | Method | Sync or async |
|---|---|---|---|
| 1. Language & tone | Final script, per chapter | Keyword filter → LLM judge (per the worked walkthrough) | Async-capable — LLM judge calls take longer than a lookup |
| 2. Privacy & identifiability | Script (PII) + selected photos + raw photos | Pattern match / face-detection first pass → LLM judge for unstructured cases | Async — especially face detection on raw photo sets |
| 3. Legal & rights | Script + photos + venue restricted-zone list | LLM judge (defamation/promotion) + deterministic lookup (restricted zones) | Async for judge, sync for the zone lookup |
| 4. Trust & misrepresentation | Script + photo-caption pairing | LLM judge, narrow scope | Async |
| 5. Spatial & physical safety | Route geodata | Deterministic — maps/closures API query | Can be near-sync — it's a data lookup, not a model call |
| 6. Accessibility | Route elevation/step data | Deterministic label generation | Sync |

**Sequencing within a cluster:** deterministic checks always run first and can short-circuit. If Cluster 1's keyword filter finds an explicit slur, that's already a hard fail — there's no need to also spend an LLM call confirming it. The judge only runs on what the deterministic layer didn't already resolve. This isn't two independent opinions being reconciled; it's a cheap filter deciding whether the expensive step is even necessary — which also answers the "disagreement resolution" question from the rubric doc: there generally isn't a disagreement to resolve, because the two don't evaluate the same content in parallel. The deterministic layer's hard fails are final and never need the judge's confirmation.

---

## 4. Sync vs. async, overall

Running all six clusters, several involving LLM judge calls, cannot realistically complete inside the same request that returns "your tour is ready" — that would undercut WalkieTalkie's own "under 10 minutes" promise. The more honest design:

1. Production agent finishes → tour status is **"Processing"**, not yet visible to guests
2. Gate runs all six clusters, in parallel with each other (they don't depend on each other's results)
3. Once every cluster reports in, the aggregation step (Section 5) produces one decision
4. Status updates to **Published**, **In review**, or **Held**

This adds latency between "draft ready" and "actually live," but that's the honest trade-off — the alternative is either slowing down the whole pipeline synchronously, or skipping checks to preserve speed, which defeats the purpose.

---

## 5. Aggregating cluster results into one decision

Each cluster returns a per-chapter (or per-tour, for route/spatial) result: pass, flag, or fail, plus the specific span/reason if not a clean pass. The aggregation logic, applying the routing rule from the rubric doc:

- **Any fail, from any cluster, anywhere in the tour → Full review.** The whole tour is held, not just the offending chapter — a tour with one unpublishable chapter isn't a publishable tour.
- **No fails, but one or more flags → Targeted review.** The tour is held, but the reviewer's queue entry shows only the specific flagged chapters/spans and which cluster raised them — not the full tour to re-read from scratch.
- **All clean → Auto-publish**, with any Cluster 6 accessibility label attached as metadata, not a gate outcome.

---

## 6. Output contract (what the gate produces)

A structured decision object per tour — not a single opaque status. Roughly:

```
{
  "tour_id": "...",
  "decision": "targeted_review",
  "results": [
    {"cluster": "language_tone", "chapter": 3, "verdict": "flag",
     "span": "at least the clock still works", "reason": "..."},
    {"cluster": "spatial_safety", "verdict": "pass"},
    ...
  ],
  "accessibility_label": "not wheelchair accessible"
}
```

This is the contract Phase 5 (human-in-the-loop) builds its reviewer interface against — the reviewer's queue entry is essentially this object rendered, not a re-derivation of it.

---

## Open items this phase surfaces for later

- The restricted-zone list (Cluster 3) and the raw-photo/audio access needed for Cluster 2's raw-capture-sensitive cases both imply **data the gate depends on that doesn't obviously exist yet** — worth flagging as build prerequisites, not just design assumptions.
- Running six clusters in parallel is efficient, but face-detection across raw (unselected) photos in particular could be the long pole in "how long does the gate actually take" — worth a real latency estimate before assuming "async" fully solves the speed concern.
