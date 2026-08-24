# The Dex Publish Gate
*Product framing · Prathyusha Vedula · builds on [[walkietalkie-discovery-notes.md]]*

---

## 1. The problem

WalkieTalkie lets guides, venue staff, and eventually local residents turn a walk into a published Dex tour, without a trained producer involved. This is the product's core value: it removes the skill and time barrier so Headout can cover a whole city, not just its landmark tours.

But removing the trained producer also removes a safeguard. Previously, that person would catch a wrong date, a bad route, or an inappropriate joke before a tour reached a guest. Today, an AI agent writes the tour instead. That agent is optimized to make the tour good — clear, engaging, well-paced. It is not optimized to make the tour safe. These are two different requirements, and only one currently has an owner.

This risk is not new. Every Dex tour today already carries some of it — Dex's own terms of use note that facts can vary by source and that conditions like closures are not tracked. WalkieTalkie does not create this risk category. It removes the one checkpoint that was catching it, at the same time Headout plans to open contribution to people who are not trained to catch it either.

**The problem, directly stated:** no step currently exists between "the AI has generated a tour" and "the tour is live." If any informal human review happens today, it is unconfirmed — and even if it does exist, it cannot scale. The number of tours able to trigger that "live" step is about to grow well beyond what manual review capacity could ever absorb.

---

## 2. The goal

Build a safety and quality check that sits between the AI writing the tour and the tour going live — separate from the writing agent itself, since generating good content and verifying safe content are different responsibilities.

This is a safety goal and a scale goal at once, not two separate ones. If the gate depends on manual review, protecting guests requires proportionally more reviewer hours every time contributor volume grows — a cost that outpaces what any team can absorb. An automated gate is what lets those two goals coexist: guests stay protected without review capacity needing to grow at the same rate as contributors.

The current review process, if any exists, is unconfirmed. The gate should be designed to stand on its own merits rather than as a marginal improvement on an unknown baseline. It should be:

- **Automated by default**, so it does not depend on a person's availability
- **Fast**, so it does not undo the speed advantage WalkieTalkie is built on
- **Thorough**, catching failure modes a quality-optimized agent has no reason to notice — offensive content, or a route that is not physically usable
- **Consistent**, producing the same verdict for the same tour regardless of who or what is reviewing it

The majority of tours should pass through unaffected. Only tours with an actual issue should be slowed down.

---

## 3. Why now

- WalkieTalkie is currently a hackathon build with no review step described. This is a present gap, not a future risk.
- Headout's stated plan for WalkieTalkie is to extend contribution to guides, venue staff, and eventually untrained local contributors. Each expansion increases unreviewed volume at the same rate the one existing safeguard — a trained producer — is being removed.
- Designing this now, while WalkieTalkie is small, costs far less than retrofitting it once real contributor volume and guest-facing tours are involved.

---

## 4. Who this affects

| Who | Effect of the gate |
|---|---|
| Guide or venue staff (records the tour) | Receives a fast, specific response — approved, or a clear reason to fix — rather than no response or a slow manual review |
| Future local contributor (historian, resident, food expert) | The gate is what makes it responsible for Headout to accept their content without a trained producer in the loop |
| Reviewer (current or future role) | Reviews only flagged tours, not every tour, so their time is spent where it is needed |
| Guest / traveler | Never receives a tour that has not been reviewed |
| Headout | Reduced exposure to reputational risk from unsafe or inappropriate content reaching a real venue |

---

## 5. Success metrics

**North star: Safe Auto-Publish Rate (SAPR)**
`SAPR = Tours auto-published without human review AND later confirmed safe ÷ Total tours submitted to the gate`
Measures how much volume the gate can safely handle on its own.

*Caveat:* SAPR is affected by two separate factors — the actual riskiness of submitted content (outside the gate's control) and the gate's own calibration (within its control). A drop in SAPR alone cannot distinguish between them. Track it alongside the gate's precision and recall against a fixed labeled test set — if that stays stable while SAPR drops, the cause is upstream content, not the gate.

**Guardrail: Unsafe Escape Rate (UER)**
`UER = Tours with unsafe content that reach guests ÷ Total tours published`
Takes priority over SAPR. A gate that raises SAPR by tolerating more risk has failed, not succeeded.

**Leading indicators:**
- Time from the AI's output to a publish or review decision — should not increase over time
- Reviewer time spent per flagged tour — should decrease as the gate improves
- Rate of safe tours incorrectly held for review — a cost to contributor trust and reviewer time, even without guest-facing risk

---

## 6. Scope for the first version

**In scope:**
- A dedicated safety check after the AI generates the tour, before publication — covering offensive language, insensitive content, and inappropriate material
- A hard rule: any failure on this check holds the tour for review, regardless of the tour's overall quality elsewhere
- Basic real-world checks, such as route walkability, where they can be added at low cost alongside the safety check

**Explicitly out of scope for this version:**
- Deep factual accuracy verification — Dex's own terms already treat this as source-dependent, and it is a separate, larger problem
- Any change to how the AI decides what content to generate
- Any change to the WalkieTalkie capture experience itself

---

## 7. Open questions for the next section

- Does the gate need to check only text, or also photos and video?
- If a tour is held for review, who reviews it? No reviewer role is confirmed today.
- Should the gate evaluate a full tour at once, or each chapter/checkpoint individually?
