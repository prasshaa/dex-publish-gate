# Dex Publish Gate — Pipeline Deep Dive
*From a raw transcript to a decision · deterministic vs. LLM-as-judge, in full · offline / online / inline evals mapped onto this specific system*

---

## Part A — Starting point: a raw, messy transcript

WalkieTalkie's own writeup is explicit that captured audio doesn't arrive as clean, structured checkpoints — it's a person talking while walking, doubling back, pointing at things. A realistic ~10-minute raw transcript for one segment of a walk might read like this (compressed here, but representative of the actual texture):

> *"...okay so if you keep going straight — actually wait, hang on, let me just — okay yeah, keep going straight past this shopfront. So this whole street used to be the tanning district, like, leather tanning, back in the 1800s, which — yeah, it smelled absolutely terrible, apparently, like genuinely one of the worst jobs you could have back then. There's a plaque here, let me scan it... okay it says 1834, founding date, matches what I thought. Anyway keep walking, there's a courtyard coming up on the left, past that food stall — the guy who runs it, Marco, actually he's been here like thirty years, his number's on the awning if anyone ever wants to order ahead, ha. Okay so this courtyard — this is where it gets kind of heavy actually, there was a fire here in 1891, a bunch of workers died, it's genuinely awful, but honestly the building's been rebuilt so many times you'd never guess, and if I'm honest the ghost tour version of this stop is way more fun than the real history, so, take that as you will..."*

This single stretch already contains, in miniature, most of what the variable inventory flagged: a placard-derived factual claim, an unprompted third-party phone/contact reference (Marco's number, spoken aloud), a genuinely sensitive historical event (a fatal fire), and — right at the end — exactly the kind of borderline tonal drift Cluster 1 exists to catch: undercutting a fatal event with "the ghost tour version is way more fun."

---

## Part B — Segmentation: taking a portion forward

Turning this into checkpoints/chapters is the production agent's job (steps 4–6 in the discovery notes), not the gate's. For this walkthrough, assume it's already split this stretch into two chapters: **"The Tanning District"** (the street history) and **"The Courtyard Fire"** (the 1891 fire, including that final line). We'll carry **"The Courtyard Fire"** forward through the rest of this walkthrough, since it's the one with something to actually catch.

Final script the production agent hands to the gate for this chapter:

> *"This courtyard was the site of a fire in 1891 that killed several workers — a genuinely difficult moment in the building's history. Though if you ask around, the ghost tour version of this stop is honestly more fun than the real one."*

---

## Part C — The deterministic layer, concretely

This is a maintained, versioned list — not a model, not a judgment call. Structurally, it's a set of exact strings/patterns checked against the text with plain matching:

```
BLOCKLIST_EXPLICIT = [ <explicit slurs>, <explicit profanity>, ... ]
# a maintained list, reviewed periodically — not shown in full here,
# since the content of a slur/profanity list isn't itself useful to reproduce

function deterministic_check(text):
    for term in BLOCKLIST_EXPLICIT:
        if term found in text (case-insensitive, word-boundary aware):
            return FAIL, matched_term
    return NO_MATCH
```

Running this against "The Courtyard Fire" chapter: **no matches.** There's no profanity or slur in the text at all — the problem is the *framing* ("more fun than the real one" right after describing deaths), and a word list has no concept of framing. This is the exact limitation named back in the rubric doc, now shown against a real example instead of asserted abstractly.

**What this layer is actually worth:** near-zero latency, near-zero cost, and a verdict that's identical every time it runs — which matters, because it means the small set of unambiguous violations never depend on model variance. It's also where **inline guardrails** live in this system (more in Part G).

---

## Part D — The decision fork

- Deterministic layer returns `FAIL` → short-circuit straight to Full Review. The judge never runs — there's nothing left to adjudicate.
- Deterministic layer returns `NO_MATCH` → proceed to the LLM-as-judge call. This is the branch our example takes.

---

## Part E — LLM-as-judge, in full

This is structurally the same pattern as the evaluation pipeline you built at Arintra: a model scoring content against a written standard, not generating anything new. Four parts to the actual call, not just "send a prompt":

**1. System/role instruction** — tells the model it's a judge, not a conversationalist:
> *"You are a content-safety evaluator for tour narration scripts. You do not generate content. You apply the rubric below exactly and return a structured verdict."*

**2. The written rubric** (same as before, shown here for continuity):
> PASS: no profanity, slurs, or content trivializing a sensitive/tragic subject.
> FLAG: borderline tone — a joke or casual phrasing near a sensitive topic that isn't clearly hostile but reads as tasteless.
> FAIL: slurs, discriminatory language, or content that trivializes violence, tragedy, or a protected group.

**3. Few-shot examples** — this is the part missing from the earlier version, and it matters for consistency. A judge given only a rubric description will interpret it slightly differently run to run; a judge given 2–3 labeled examples anchors its calibration:
> *Example 1 — Text: "The battle claimed hundreds of lives, and the field remains a memorial today." → PASS (grave subject, respectful treatment).*
> *Example 2 — Text: "At least the clock still works, right?" (said right after describing an uprising being put down) → FLAG (dismissive joke immediately after a serious event, not hostile but tasteless).*
> *Example 3 — Text: "[slur] used to live in this neighborhood before they were pushed out." → FAIL (discriminatory language).*

**4. The content to evaluate**, plus a strict output schema:
> *"Return ONLY JSON: {verdict, span, reason}. No other text."*

**Running the actual call** against "The Courtyard Fire" chapter:

```json
{
  "verdict": "flag",
  "span": "the ghost tour version of this stop is honestly more fun than the real one",
  "reason": "Undercuts a fatal historical event with a dismissive comparison immediately after describing it — tasteless but not hostile or discriminatory, so flag rather than fail."
}
```

**A parameter worth naming explicitly:** this call should run at low temperature (close to deterministic sampling), not the default creative-writing temperature. A judge is supposed to be consistent, not creative — the same input should reliably produce the same verdict, which is a different goal from the production agent's own generation, which *wants* some variation.

---

## Part F — Where offline, online, and inline evals each fit

This is the part that was named as a metric ("evaluation strategy") back in the roadmap but never actually laid out. Mapped onto this specific pipeline:

### Offline evals — before this ever runs on real tours
Build a labeled golden set: real (or realistic) chapters spanning clean, borderline, and clear-violation cases across all six clusters — not just Cluster 1. Run the judge against it, compare its verdicts to human labels, and measure precision and recall *per cluster*, not one blended number (a judge that's excellent at catching slurs but weak at catching subtle tonal drift needs to be known as such, not averaged into a single "looks fine" score). This is also where the few-shot examples in Part E get chosen and refined — pick the examples that best correct the judge's actual failure modes on the golden set, not arbitrary ones.

### Online evals — after this is live
The uncomfortable truth about auto-publish: by definition, a clean-verdict tour never gets human eyes on it. If the judge has a blind spot, nothing in the normal flow ever surfaces it. So online eval means periodically sampling a random slice of auto-published tours — not just the flagged ones — for human spot-check, specifically to catch silent false negatives the offline golden set didn't anticipate. This is the safety net for the safety net, and it's the part most systems like this skip, because everything upstream of it *looks* like it's working.

### Inline guardrails — running every single time, in real time
The deterministic layer from Part C is one inline guardrail. There are others worth naming that weren't explicit before: **output validation** — does the judge's response actually parse as the required JSON? If not, that's a failure mode of the check itself, not of the content, and the safe default is to treat a malformed response as an automatic hold for human review, never as a silent pass. Same logic for a timeout or API error — fail toward caution, not toward publishing. These are runtime protections around the *mechanism*, distinct from Parts C–E which evaluate the *content*.

---

## How the three fit together, as one system

Offline evals decide whether the judge is trustworthy enough to launch with, and what its rubric/few-shot examples should actually say. Inline guardrails run on every single tour, every time, deciding fast/cheap cases without the judge and failing safely when the mechanism itself breaks. Online evals are the ongoing check that the offline calibration hasn't quietly gone stale as real content — messier and more varied than any golden set — starts flowing through. None of the three substitutes for the others; a system with only inline guardrails has no idea if its judge is any good, and a system with only offline evals has no way of knowing if it's still good six months and a model update later.
