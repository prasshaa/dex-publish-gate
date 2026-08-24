# Dex WalkieTalkie — Discovery Notes
*Working doc · Prathyusha Vedula, for the Headout confidence-routing project*

---

## 0. Status check — what this actually is today

WalkieTalkie is a **42-hour internal hackathon build** ("Hackin' 2026," July 2026), by a three-person team called Lukewarm — Neil (product vision + iOS capture app), Anurag (backend, AI agent, DAW integration, infra), Ajith (design/brand). It won the "Partner Pass" category. There is no public confirmation it has shipped broadly to production teams, guides, or venue staff yet — treat it as validated-in-demo, not validated-at-scale.

---

## 1. User flow (as Headout has described it)

1. **Capture** — guide opens the iOS app, starts walking, narrates the place freely ("as though showing it to a friend"), photographs anything of interest, scans a placard when useful. No checkpoints, scripts, or Dex Studio knowledge required.
2. **Raw stream** — audio, GPS trail, photographs, timestamps, and scanned text, all captured in real time and inherently messy/non-linear.
3. **Transcription** — the recording is transcribed.
4. **Checkpoint inference** — the system identifies which moments in the stream should become tour checkpoints.
   - *Confirmed:* Headout describes the problem, not the mechanism — the agent had to work out "which moments deserved to become checkpoints, how the guest should move between them, and what larger story the person had been trying to tell while walking."
   - *Not disclosed — validate, don't assume:* the actual signals, weighting, or decision logic. A plausible (unconfirmed) hypothesis is multimodal fusion — pace changes, narration emphasis, photo/placard-scan timestamps, and transcript content considered together, since GPS alone can't signal narrative significance — but this is an open question to ask the WalkieTalkie team, not a fact to build on.
5. **Path inference** — infers the walking path connecting those checkpoints.
6. **Handoff to a production agent** — which decides what matters, sequences it into a coherent story, writes the tour script, and layers in narration, music, and sound design.
   - *Open question — validate, don't assume:* Headout's own phrasing ("...passes the material to a production agent. The agent works out what matters...") reads as a handoff between two stages, but it's not confirmed whether the checkpoint/path-inference step (4–5) and the production agent (6) are genuinely separate systems, or one agent described across two sentences for readability. This matters for design: if they're separate, there are potentially *two* handoff points a quality layer could sit at — after structuring, and after production — not one.
   - *Design note:* "deciding what matters" (narrative curation) and "is this safe to publish" (content-safety filtering) are different jobs, even if the same agent performs both today. An agent optimized for cinematic, engaging narration has no inherent reason to also catch insensitive content — and the two objectives can conflict: content that reads as narratively "interesting" (edgy jokes, dramatized framing of sensitive events) is exactly the kind of thing a safety check exists to catch. Even if the underlying model has generic safety training from its provider, that's not a substitute for an explicit, dedicated, auditable safety gate Headout controls — relying on implicit model behavior for this is the same anti-pattern the original case study named: never let one system's behavior silently stand in for another's job.
7. **Output** — a link to a playable Dex tour, opens directly in the Headout Dex app.

Target: a 20-minute walk → a complete first draft in under 10 minutes. Hit during the demo.

---

## 2. What it leverages / stack signals

**Confirmed:**
- iOS capture app (no Android mentioned anywhere)
- GPS trail capture during the walk
- On-device photo capture + text scanning (placards)
- Speech-to-text transcription
- An "AI agent" that does checkpoint inference, path inference, script writing
- DAW (digital audio workstation) integration for narration/music/sound design
- Hands off into the existing Dex production pipeline → playable inside the existing Dex consumer app

**Not publicly specified (don't assume):**
- Which ASR/LLM models power transcription, checkpoint inference, or script generation
- Whether path inference uses a maps/routing API (Google/Apple Maps) or is purely custom logic over the raw GPS trail
- Any confidence scoring, verification, or review step between "agent produces tour" and "tour opens in Dex app"

**Related but separate effort:** a different hackathon project, "Automated Dex Onboarding," uses robotics-inspired spatial mapping to turn raw venue footage into spatial maps for onboarding *indoor* venues (e.g., museums) — confirming GPS-based capture is known to break down indoors, and that Headout is solving indoor onboarding as a **separate** problem from WalkieTalkie's outdoor walking-tour capture.

---

## 3. Prerequisites

- iOS device (capture app is iOS-only as described)
- Usable outdoor GPS signal — this is a walking-route tool, not built for GPS-denied indoor spaces
- A person physically present, walking and narrating the route in real time
- The existing Dex Studio / production-agent / Dex app infrastructure to receive and play the output

---

## 4. Personas

| Persona | Status |
|---|---|
| Internal Headout production team (the original recce-doer) | Confirmed — this is who WalkieTalkie was built to unblock first |
| Guides & venue staff | Confirmed — named explicitly as target capturers |
| Local knowledge holders (historians, food obsessives, long-time residents) | Named as the *aspirational* persona for the "city-scale" vision — not confirmed as onboarded yet |
| End guest / traveler | Consumer of the finished tour, inside the existing Dex app — unchanged by WalkieTalkie itself |
| **A reviewer / editor / QA role between capture and publish** | **Not mentioned anywhere in public material** |

---

## 5. Strengths (Headout's own framing)

- Collapses two trips (recce + inevitable return trip) into one
- Compresses days of manual work into minutes; 20-min walk → <10-min draft in demo
- Removes the Dex Studio skill requirement, so non-producers can contribute
- Opens a content strategy a central team and a generic internet-trained AI both structurally cannot replicate: hyperlocal, lived-in knowledge at city scale

---

## 6. Gaps

**Explicitly named by Headout:**
- Their own writeup says the app itself wasn't the hard part — "turning the walk into an itinerary was." The difficulty they describe is entirely about *structuring* messy, non-linear input (scattered audio, noisy GPS, off-angle photos) — not about verifying whether the final output is *correct*.

**Not addressed anywhere in public material (inferred — needs validation, not assumed):**
- No mention of any review, correction, or approval step between the agent's output and the tour going live in the Dex app. Their success description stops at structural completeness ("the finished tour opened inside Dex, with checkpoints, narration and music intact") — not correctness.
- No mention of how a guide's or resident's off-the-cuff factual claims get verified before reaching paying guests — especially once contributors are explicitly *not* trained producers.
- No mention of tone/safety review for freeform narration at sensitive sites.
- No mention of walkability/route validation (e.g., a path crossing a closed area).
- Indoor/GPS-denied venues are out of scope for WalkieTalkie as described — handled by a separate tool entirely.
- Android capture isn't mentioned.

---

## 7. Does confidence-routing sit at the biggest gap — and where in the flow?

**Reasoned case (not confirmed by Headout — to validate):**

Their own narrative arc goes: capture (solved) → structuring/inference (hard, solved well enough for a demo) → publish (undescribed). The seam between step 6 (production agent output) and step 7 (tour is live in the Dex app) is exactly where a confidence-routing quality layer would sit — and it's the one part of the flow Headout has published zero detail on.

The trust stakes rise, not fall, as WalkieTalkie succeeds at its own stated goal. Opening capture to guides, venue staff, and eventually historians/residents removes the one implicit quality gate that existed before: a trained producer doing the recce themselves. "More contributors" under the current described flow means "more unreviewed content reaching paying guests," unless something sits between agent output and publish.

---

## 8. Working assumption for the solution

No public evidence that safety/tone/content-moderation review exists for WalkieTalkie output today — and this is being treated as a **working assumption to design against**, not something requiring outside confirmation first. Reasoning:

- It's a 42-hour hackathon build with no public mention of a review step of any kind (Section 6).
- Dex's own Terms of Use disclaim *factual and historical* accuracy — <cite index="50-1">"Dex does not claim academic accuracy... historical facts, events, and cultural interpretations... may vary across references"</cite> and that <cite index="50-1">Dex does not account for real-time conditions such as crowd levels, weather, construction, accessibility changes, closures, or emergencies</cite> — but this disclaimer is silent on inappropriate language, insensitive content, or unsafe material. An accuracy hedge is not a content-safety hedge; the two are separate obligations, and one being absent from a legal disclaimer says nothing about the other.
- Given that, basic content filtering (bad language, insensitive commentary, inappropriate imagery) is treated as **in scope by default** for the solution, not something to scope out pending confirmation — worst case, Headout has already built this internally, and the solution demonstrates independently arriving at the same problem, which is itself a useful signal.

---

*Sources: Headout Studio blog ("Building tours at the speed of a walk," "Inside Headout's Hackin' 2026," "What it takes to keep people exploring"), Dex app listings (App Store, Google Play), dex.headout.com.*
