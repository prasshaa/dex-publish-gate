# The Dex Publish Gate
*Product framing · Prathyusha Vedula · working doc, builds on [[walkietalkie-discovery-notes.md]]*

---

## 1. Problem statement

WalkieTalkie is designed to let people who are not trained producers — guides, venue staff, and eventually historians, food obsessives, and residents — turn a walk into a published Dex tour with no review step described anywhere in how it works today. That is the entire point of the product: remove the skill and time barrier so Headout can get hyperlocal depth at city scale.

But the thing that removal quietly deletes is the one implicit quality check that existed before: a trained producer, present for the whole recce, catching a wrong date, a bad route, or a tasteless joke before it ever reached a guest. WalkieTalkie replaces that person with a production agent optimized to make the tour *good* — coherent, cinematic, engaging. Nothing in that objective is about whether the tour is *safe* to publish. Those are different jobs, and right now, only one of them is being done.

Every tour that ships today already carries some of this risk — Dex's own terms of use concede that facts and historical interpretation "may vary across references" and that the product doesn't account for real-time conditions like closures or construction. WalkieTalkie doesn't introduce this risk category; it removes the last human checkpoint that was implicitly catching it, at the exact moment Headout is trying to open the funnel to more, and less trained, contributors.

**The problem:** there is currently no dedicated, auditable step between "the production agent has generated a tour" and "the tour is live in the Dex app," and the number and variety of people who can trigger that publish step is about to grow.

---

## 2. Goal

Give every AI-produced Dex tour a dedicated safety and quality gate — separate from the production agent that writes it — so that opening tour creation to non-producer contributors does not mean opening the Dex app to unreviewed content.

Concretely: whatever review happens today — informal, human, partial, or none of the above, since that's genuinely unconfirmed — this gate should raise it to something Headout can rely on: automated by default so it doesn't bottleneck on a person's availability, fast enough to preserve the speed that makes WalkieTalkie valuable, comprehensive enough to catch the specific failure modes a narrative-optimized agent has no reason to catch on its own (unsafe or insensitive content, known hard failure modes like impassable routes), and consistent — the same tour gets the same verdict regardless of who happens to be reviewing it or whether anyone is. The gate should slow down the tours that need it and stay invisible on the ones that don't.

---

## 3. Why now

- WalkieTalkie exists today as a hackathon build with no described review step — the gap is real and current, not hypothetical.
- Headout's own stated ambition for WalkieTalkie is to extend capture to guides, venue staff, and eventually untrained local contributors — each expansion increases the volume and variance of unreviewed input at the exact rate the implicit human checkpoint (a trained producer) is being removed.
- A gate is far cheaper to design now, while WalkieTalkie is small and pre-scale, than to retrofit after it's carrying real contributor volume and guest-facing tours.

---

## 4. Who this is for

| Persona | How the gate affects them |
|---|---|
| Guide / venue staff (capturer) | Gets a fast, clear signal on their draft — approved, or told specifically what to fix — instead of silence or a slow manual review |
| Future local contributor (historian, resident, food expert) | The gate is what makes it *responsible* for Headout to accept their content at all without a trained producer in the loop |
| Producer / reviewer (if one exists, or is introduced) | Reviews only what's flagged, not full drafts — the gate turns their time into a scarce resource spent where it matters |
| Guest / traveler | Never sees an unreviewed tour; unaffected when things go well, protected when they don't |
| Headout (brand/trust) | Reduces exposure to a bad-publicity moment — an insensitive tour live at a real venue — as a direct cost of scaling contributor-generated content |

---

## 5. Success metrics

**North star:** Share of AI-generated tours that reach guests without a human ever needing to review them — i.e., how much of the volume the gate can respond to on its own, safely.

**Guardrail:** Unsafe-content escape rate — instances of flagged-category content (offensive language, insensitive framing, inappropriate material) that reach a published tour, per tours published. This must not be traded off against the north star; a gate that lets more through by tolerating more risk has failed.

**Leading indicators:**
- Time from production agent output to publish/review decision (speed shouldn't regress from what WalkieTalkie promises)
- Reviewer minutes spent per flagged tour (should trend down as the gate gets more precise, not up)
- False-flag rate — safe tours incorrectly held back (a cost in contributor trust and producer time, even though not a guest-facing risk)

---

## 6. Scope for v1

**In scope:**
- A dedicated safety/content check sitting after the production agent, before publish — covering unsafe or offensive language, insensitive framing of sensitive subjects, and inappropriate material in narration/text output
- A hard-gate decision (block/hold for review) that cannot be averaged away by an otherwise-good narrative score, consistent with the routing principle from the earlier case study
- Basic real-world hazard checks inherited from the earlier confidence-routing design (e.g., route/spatial validity) where they're cheap to include alongside the safety gate

**Explicitly out of scope for v1 (not being solved here):**
- Deep factual/historical accuracy verification — Headout's own terms already treat this as a "varies by source" category, not a hard-safety one, and it's a separate, larger problem
- Reviewing anything upstream of the production agent (i.e., not redesigning checkpoint/path inference)
- Any change to WalkieTalkie's capture experience itself

---

## 7. Open design questions to carry into the next section

- Does this gate check text/audio only, or does it need to cover the photographs/video a contributor captures too, given the app permissions mention user-generated content?
- Where exactly does "hold for review" send a tour if WalkieTalkie has no confirmed reviewer/producer role today — who is the human in the loop, if one doesn't yet formally exist?
- What's the right unit to gate at — the whole tour, or per-chapter/per-checkpoint, given tours are described as built from sequenced checkpoints?
