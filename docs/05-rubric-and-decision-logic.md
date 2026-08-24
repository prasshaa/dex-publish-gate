# Dex Publish Gate — Rubric & Decision Logic
*Phase 3 · builds on the variable inventory · departs deliberately from the first prototype's weighted-score model*

---

## Design principle: a checklist, not a composite score

The earlier confidence-routing prototype used a weighted average because its checks (spatial, factual, narrative, safety, pronunciation) sat on a real quality spectrum — "how good" is a meaningful question. The checks here are different: they're independent trust, legal, and physical-safety categories. Averaging them together would hide exactly the thing that matters — a tour that's excellent everywhere except one slur is not "92% safe," it's unpublishable. So each check below returns its own **pass / flag / fail**, and the final routing decision reads the *set* of results, not a blended score.

---

## Cluster 1 — Language & tone safety
*(profanity, slurs/stereotypes/discriminatory language, insensitive framing of sensitive subjects, tone appropriateness)*

| Result | Criteria | Example |
|---|---|---|
| **Pass** | No profanity, slurs, discriminatory language, or content trivializing a sensitive/tragic subject | Standard narration describing a landmark's history |
| **Flag** | Borderline tone — a joke or casual phrasing near a sensitive topic that isn't clearly hostile but reads as tasteless | "This spot has a dark past, but hey, at least the coffee's good here now" |
| **Fail (hard gate)** | Slurs, discriminatory language, or content that trivializes violence, tragedy, or a protected group | A joke minimizing a documented atrocity or casualty event |

**Judgment method:** LLM-judge against a written rubric (this is inherently a judgment call about tone, not a lookup). Deterministic keyword/profanity-list filtering as a first-pass, cheap pre-check before the judge runs — catches the obvious cases without spending a model call, but the nuanced tone/insensitivity calls need the judge.

---

## Cluster 2 — Privacy & identifiability
*(third-party PII spoken in audio, identifiable bystanders in photos, identifiable children in photos)*

| Result | Criteria | Example |
|---|---|---|
| **Pass** | No third-party names, contact details, or identifiable strangers/children captured | Narration about the venue itself, photos of architecture/landmarks only |
| **Flag** | A person is visible/mentioned but not clearly identifiable (distant, obscured, back turned) | A photo with a crowd in the background, no individual recognizable |
| **Fail (hard gate)** | A clearly identifiable bystander or child appears in a photo, or a real person's private details (phone number, address, full name in a personal context) are spoken in the narration | A close-up of a stranger's face in a published tour photo |

**Judgment method:** Face-detection/identifiability check for photos (a solvable, largely deterministic computer-vision problem, not a judgment call). Named-entity + pattern detection for audio/transcript (phone numbers, addresses) as a first pass; LLM judge for less structured PII (e.g., "my neighbor Priya's house" — identifying without being a formatted phone number).

---

## Cluster 3 — Legal & rights
*(defamatory claims, copyrighted material recited or in-frame, promotional bias/undisclosed conflict of interest, restricted-photography zones)*

| Result | Criteria | Example |
|---|---|---|
| **Pass** | No claims about identifiable people/businesses presented as damaging fact, no recited copyrighted text, no photography in a marked restricted zone | Neutral historical/factual narration |
| **Flag** | A promotional mention without clear disclosure, or a photo that may include copyrighted signage/art incidentally | "My favorite place to eat nearby is X" without framing as personal opinion |
| **Fail (hard gate)** | A damaging, unverified claim about an identifiable person/business stated as fact; a substantial recited copyrighted passage; a photo taken in a venue's explicitly restricted zone | Narration stating a named business "scams tourists" as fact |

**Judgment method:** LLM judge for defamation/promotional-bias tone (inherently contextual). A maintained restricted-zone list per venue for the photography check — deterministic once that list exists, but note this is a **data dependency**, not just a model capability: someone has to compile and maintain which zones are restricted per venue.

---

## Cluster 4 — Trust & misrepresentation (lightweight, not full fact-checking)
*(opinion stated as fact, photo-to-narration relevance mismatch, translation-introduced issues)*

| Result | Criteria | Example |
|---|---|---|
| **Pass** | Subjective claims are framed as such; a described object matches what's shown/scanned | "Many locals consider this the best view in the city" |
| **Flag** | An absolute, unhedged claim stated as objective fact, or a plausible but unconfirmed photo/narration mismatch | "This is definitively the best view in the city" |
| **Fail** | *(This cluster is soft by design — it doesn't have a hard-fail tier.)* Deliberately excludes deep fact-verification, which is out of v1 scope per the PRD | — |

**Judgment method:** LLM judge, explicitly scoped narrow — checking for hedging language and obvious claim-image mismatches, not verifying whether a claim is actually true. This is the lightweight version of "factual," distinct from the out-of-scope deep-accuracy problem.

---

## Cluster 5 — Spatial & physical safety
*(walkability/path validity, real-world route safety, legal right-of-way, real-time conditions)*

| Result | Criteria | Example |
|---|---|---|
| **Pass** | Route is walkable, legally accessible, and matches current conditions | A public sidewalk route with no known closures |
| **Flag** | A route element can't be fully verified (e.g., no current closure data available for that segment) | A rural or less-mapped area with sparse data coverage |
| **Fail (hard gate)** | Route crosses a closed area, private property without right-of-way, or a route this is not safely walkable (no path, crosses a highway) | The construction-closure example from the earlier prototype |

**Judgment method:** Deterministic — checked against live map/closures data (a routing/maps API), not a model judgment call. This is the most "engineerable" cluster: it's a data lookup problem, not an ambiguous-tone problem. The open question flagged earlier still applies: a one-time publish-time check goes stale if conditions change afterward — this cluster likely needs a periodic recheck, not just a publish-gate check, which is a scope decision to make explicitly rather than default into.

---

## Cluster 6 — Accessibility (soft, informational only)
*(stairs-only routes, no accessible path)*

| Result | Criteria |
|---|---|
| **Pass / Label** | Not a pass/fail at all — this is an informational label ("not wheelchair accessible") shown to guests, not a publish blocker. |

**Judgment method:** Deterministic, from route elevation/step data if available. Explicitly not a hard gate — excluding an inaccessible route from publishing entirely would be the wrong response to an accessibility gap; labeling it accurately is the right one.

---

## Overall routing decision

1. **Any hard-gate fail, from any cluster → Full review.** Non-negotiable, never averaged away — this is the same principle from the original case study, now applied to a checklist instead of a composite score.
2. **No hard-gate fails, but one or more flags → Targeted review.** The reviewer sees only the specific flagged items and their cluster, not the whole tour — this is where the "turn a score into saved reviewer time" principle from the first prototype still applies directly.
3. **No fails, no flags → Auto-publish**, with the accessibility label attached if relevant (that's a label, not a gate outcome).

**What's still open, deliberately deferred to later phases:**
- Exact rubric wording an LLM judge would actually be prompted with (Phase 4 — architecture)
- How disagreement between the deterministic pre-filter and the LLM judge gets resolved (Phase 4)
- Who maintains the restricted-zone list and how it's kept current (Phase 5 — human-in-the-loop, this is a real operational owner question)
- How confident the LLM judge needs to be before a flag becomes trustworthy enough to route on unsupervised (Phase 7 — evaluation)

---

## Appendix — worked walkthrough: Cluster 1, end to end

A concrete trace through the pipeline, using one example, as the template for how the other clusters get built out.

**Pipeline order:** input → deterministic keyword filter → route decision → LLM-as-judge call (if needed) → parse verdict into the checklist.

**1. Input:** the final narration script for one chapter (production-agent output, not the raw transcript).

**2. Deterministic keyword filter:** a maintained list of explicit slurs and unambiguous profanity, checked with plain text matching — no model, no judgment. Fast, free, and its verdict is reproducible every time. What it *can't* do: distinguish "the guide respectfully described a massacre" from "the guide joked about a massacre" — both can use identical vocabulary. The problem is framing, not word choice, which is exactly why this cluster needs a judge at all.

**3. Route decision:** if the filter doesn't hard-fail the script, it goes to the LLM judge by default — for this cluster, almost everything that isn't an obvious keyword-fail requires judgment; there's no further narrowing possible before that.

**Worked example** — script: *"The clock tower nearby marks where, in 1826, a local uprising was put down — the guide adds a light joke here about how 'at least the clock still works,' which sits oddly next to the history."*
- Keyword filter: no matches, passes through — correctly, since no banned word is present.
- Routed to the LLM judge, since nuance is required.

**4. The LLM-as-judge call:** a model is sent three things in one prompt — an instruction that it's evaluating (not generating), the written rubric, and the content itself. Same pattern as an eval pipeline scoring output against a written standard, not producing new content.

Written rubric, as actual prompt text:
> *"You are evaluating a tour narration script for tone and sensitivity. PASS: no profanity, slurs, or content trivializing a sensitive/tragic subject. FLAG: borderline tone — a joke or casual phrasing near a sensitive topic that isn't clearly hostile but reads as tasteless. FAIL: slurs, discriminatory language, or content that trivializes violence, tragedy, or a protected group. Return a verdict (pass/flag/fail), the exact span that triggered it if any, and a one-sentence reason."*

Model output: `{"verdict": "flag", "span": "at least the clock still works", "reason": "Trivializes a documented violent event with a light joke immediately after describing it."}`

**5. Parse the verdict:** becomes Cluster 1's entry in the checklist — here, a flag, which routes this chapter to targeted review with the exact span and reason shown to the reviewer, but doesn't force full review on its own (only a hard fail does that).

**On what the deterministic filter is really for:** it isn't narrowing down what the judge sees in any meaningful way — it's catching the small subset of cases so obviously bad that judgment would be a wasted, slower, costlier model call. Everything else — for a nuanced cluster like this, the large majority of content — goes to the judge regardless.
