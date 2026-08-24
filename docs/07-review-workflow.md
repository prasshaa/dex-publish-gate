# Dex Publish Gate — Review Workflow
*Phase 5 · builds on the architecture's output contract · resolves the "who reviews it" gap flagged since discovery*

---

## 1. Who reviews — a grounded assumption, not a guess

WalkieTalkie's own premise is that it frees the internal production team from doing recces by hand. That same team is the most qualified reviewer candidate available — they're the people who used to catch exactly these problems firsthand, and WalkieTalkie has already freed up their time to do something else. So v1's reviewer role is **the existing internal production team, repurposed from producing tours to reviewing flagged ones.**

This deliberately doesn't solve the harder version of the problem yet: once WalkieTalkie opens to external guides, venue staff, and eventually untrained local contributors (the city-scale vision from discovery), tour *volume* grows past what a small internal team can review, even in targeted-review form. That's a real v2 problem — worth naming now rather than pretending v1's answer scales indefinitely, but not solving prematurely before v1 even proves itself.

---

## 2. Reviewer authority isn't uniform across clusters

Not every hard-gate fail needs the same kind of judgment. A production reviewer is well-placed to judge tone and insensitivity (Cluster 1) — it's the same call they'd have made in the field. But a defamation claim (Cluster 3) is a legal risk question, not a production judgment call, and arguably shouldn't be resolved by the same person or authority level.

**v1 approach:** production reviewers handle Clusters 1, 2, 4, 6 directly. Cluster 3 (legal/rights) fails route to the reviewer queue same as others, but carry a flag requiring legal sign-off before they can be cleared — the production reviewer can still reject or send back for edits, but can't unilaterally approve a legal-risk item. Cluster 5 (spatial) hard fails are mostly unambiguous data facts (a route is closed or it isn't), so they don't need the same escalation — but a spatial fail that's disputed (contributor claims the closure data is wrong) should have a path to a second check, not just a reviewer's word against a data source.

---

## 3. The reviewer's interface

The queue entry **is** the structured decision object from the architecture doc, rendered — not a re-derivation of it. Concretely, for a tour in the queue:

- Which chapters are clean vs. flagged vs. failed, at a glance
- For each flagged/failed item: the exact span, which cluster raised it, and the one-sentence reason the judge or check returned
- Full chapter context available on demand (the reviewer can see the whole chapter, not just the isolated span, since tone judgments especially need surrounding context)
- The original audio/photo the flagged text or image derived from, for cases where the reviewer wants to hear/see the raw capture rather than trust the transcript alone

**Queue ordering:** oldest-held-first as a default, but hard fails surfaced above flags — a tour blocked entirely is a bigger problem than one waiting on a soft flag, and shouldn't sit behind a backlog of minor holds.

---

## 4. Actions available to the reviewer

- **Approve as-is** — overrides the flag/fail, publishes unchanged. Every override is logged with the reviewer's name and a required one-line reason — not a silent bypass, especially for hard-gate overrides, since those are exactly the decisions worth being able to audit later.
- **Edit, then approve** — the reviewer fixes the flagged span directly (rewording a tasteless joke, cropping a photo) and publishes the corrected version. Likely the most common action for Cluster 1/4 flags, which are often a wording fix, not a fundamental problem with the tour.
- **Reject, with reason** — sends the tour back to the original contributor with the specific reason, so they can re-capture or re-record rather than the reviewer doing all the fixing themselves.
- **Escalate** — for Cluster 3 legal-flagged items per Section 2, or anything a production reviewer doesn't feel qualified to resolve alone.

---

## 5. Feedback loop to the contributor

A guide or venue staff member who gets a reject needs to know *why*, specifically — not "your tour was rejected," but the same span-and-reason detail the reviewer saw, so they can fix it and resubmit rather than guessing. This matters more as WalkieTalkie opens to less experienced contributors (the whole point of the tool) — vague rejection is exactly what would make an untrained local contributor give up rather than try again.

---

## 6. SLA and speed

WalkieTalkie's entire pitch is speed — a 20-minute walk to a 10-minute draft. A review step that takes days quietly breaks that promise even though the gate itself runs fast. v1 target: flagged tours get a reviewer decision within one business day, not left in an unbounded queue. This is also a leading indicator worth tracking from the PRD's metrics (reviewer minutes per flagged tour) — if the queue backs up, that's a signal the gate's flag rate is miscalibrated, not just that reviewers are slow.

---

## Open items this phase surfaces for later

- v1's reviewer model (existing production team) doesn't scale to the external-contributor future WalkieTalkie is explicitly building toward — worth flagging as a known limitation rather than a solved problem.
- Legal escalation (Cluster 3) assumes Headout has some legal/trust-and-safety function able to take these — unconfirmed, same category as the restricted-zone list from architecture: a dependency, not just a design detail.
- The disputed-spatial-data case (Section 2) doesn't yet have a real resolution path — noted, not solved.
