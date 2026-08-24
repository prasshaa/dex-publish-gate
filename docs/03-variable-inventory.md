# Publish Gate — Variable Inventory
*Exhaustive brainstorm before scope-cutting · builds on [[dex-publish-gate-prd.md]]*

Key: **Gate territory** = a narrative-optimized production agent has no inherent reason to catch this, so it needs a dedicated check. **Production-agent territory** = already the agent's job by definition (quality/coherence), listed here only so it's explicit what the gate does *not* need to re-check. **Unclear** = plausibly either, needs a decision.

**Priority tiering — not every modality carries equal guest exposure.** What's actually confirmed to reach a traveler in the Dex app: narration audio, music/sound design, and an AI conversational layer — plus checkpoints triggering by the guest's own live location. Nothing in public material confirms that a guide's raw captured *photographs* are shown to guests during playback; at most, a thumbnail or two may appear on a preview/"Experience" screen. So:
- **Tier 1 (confirmed guest-facing, full checklist applies):** final narration script/audio (Section 1), route/checkpoint geolocation (Section 2) — the route matters regardless of whether it's visually shown, since it determines where the guest is physically sent and when audio triggers.
- **Tier 2 (unconfirmed/minimal guest exposure, lighter touch):** photographs (Section 3) — probably only the hard-gate items (NSFW, identifiable bystanders/children, restricted-zone photography) are worth full weight; the softer checks (relevance-to-narration, EXIF metadata) are lower priority until it's confirmed how visible photos actually are to a guest.

---

## 1. Audio → final narration script (and synthesized narration audio, if TTS is used)

Raw audio itself likely doesn't need separate gate treatment once transcribed and re-narrated — the guest never hears the raw capture. The exception is anything the raw audio reveals that shouldn't survive *at all*, even into the transcript.

| Variable | Territory | Notes |
|---|---|---|
| Profanity / offensive language | **Gate** | Not something narrative optimization filters for |
| Insensitive framing of sensitive subjects (tragedy, trauma, conflict) | **Gate** | Flagged earlier — an agent chasing "engaging" can drift toward this, not away from it |
| Slurs / stereotypes / discriminatory language | **Gate** | Hard block, non-negotiable |
| Tone appropriateness for general/family audience | **Gate** | Distinct from "is it well-written" |
| Opinion stated as fact | **Gate (lightweight)** | Not full fact-checking — just flagging absolute claims presented without hedging ("the best in the world," "definitely haunted") as a trust/misrepresentation risk, cheap to check without verifying truth |
| Deep factual/historical accuracy | **Out of scope** (per PRD) | Confirmed out of v1 — different problem, already disclaimed in ToS |
| Third-party PII spoken aloud (names, numbers, identifying details about a bystander or private individual) | **Gate — raw-audio-sensitive** | Risk exists the moment it's *said*, whether or not it survives into the final script. If the agent happens to drop it, fine — but the gate can't assume that, since nothing today verifies it was dropped |
| Defamatory claims about identifiable businesses/people | **Gate** | Legal/reputational risk, invisible to a narrative-quality objective |
| Promotional bias / undisclosed conflict of interest (guide plugging their own business) | **Gate** | Trust issue, not a narrative one |
| Copyrighted material recited (song lyrics, quoted text) | **Gate** | IP risk |
| Narrative coherence, pacing, story arc | Production-agent | Already the agent's core job |
| Relevance / on-topic-ness | Production-agent | Agent already decides "what matters" |
| Language/dialect detection, translation quality | Production-agent (mostly) | Only gate-relevant if a translation *introduces* an unsafe/insensitive phrase that wasn't in the original — worth a light check, not a deep one |

---

## 2. GPS trail → final route / checkpoint sequence

| Variable | Territory | Notes |
|---|---|---|
| Walkability / path validity (paved, accessible, not crossing a closed area) | **Gate — hard gate** | This is the spatial hard-gate from the earlier prototype. Not something a narrative agent has any signal to catch |
| Real-world safety of the route (unlit at night, unsafe crossing, high-traffic road with no crosswalk) | **Gate — hard gate** | Same category, physical safety rather than content safety, still squarely gate territory |
| Legal right-of-way (crosses private property) | **Gate** | Legal exposure, not a narrative concern |
| Real-time conditions (construction, closures, events) | **Gate, with a caveat** | Explicitly disclaimed in Dex's ToS as unhandled today. But "real-time" means a route valid at production/publish time can become invalid by the time a guest walks it — a one-time gate check at publish doesn't fully solve this. Open question to carry forward: does this need a recurring/live recheck, not just a publish-time one? |
| GPS accuracy/drift (signal noise producing a slightly wrong trail) | Production-agent (inference stage) | This is a data-cleaning problem for checkpoint/path inference (steps 4–5), not a publish-time safety concern — unless the *result* is an invalid path, in which case it shows up as the walkability check above anyway |
| Accessibility (stairs-only route excludes wheelchair users) | **Gate — soft flag, not hard block** | Real inclusivity concern, but probably a flag/label rather than a block — worth a decision, not an automatic reject |

---

## 3. Photographs → final selected/embedded images

| Variable | Territory | Notes |
|---|---|---|
| Inappropriate/NSFW/graphic imagery | **Gate — hard gate** | Same category as unsafe language, just a different modality |
| Identifiable bystanders in frame (privacy/consent) | **Gate — raw-photo-sensitive** | Easy to overlook. A stranger's face published without consent is a real exposure, and — like the audio-PII case — this risk exists in the *raw* photo regardless of whether the agent "selects" that exact photo, because even unselected raw photos may be stored/reviewable, and selected ones go straight to guests |
| Identifiable children in frame | **Gate — hard gate, elevated severity** | Same as above with higher stakes; likely deserves its own explicit hard-gate line rather than folding into general bystander privacy |
| Restricted-photography zones (venue prohibits photos in certain areas) | **Gate** | Legal/venue-compliance issue the agent has no way to know about unless told |
| Copyrighted material in frame (a museum's copyrighted artwork, branded signage) | **Gate** | IP/licensing risk |
| Relevance of photo to narration (does the image actually show what's being described) | **Gate — lightweight** | Same category as "opinion stated as fact" above: not deep verification, just catching an obvious mismatch between claim and image as a trust/misrepresentation issue |
| Image quality (blur, poor lighting, unusable) | Production-agent | Already the agent's job to select usable photos for the story |
| EXIF/geotag metadata leakage | **Gate — minor, worth a mention** | Unlikely to matter for guest-facing content itself, but worth confirming metadata is stripped before anything is stored/served |

---

## 4. Timestamps

| Variable | Territory | Notes |
|---|---|---|
| Sequencing/ordering signal | Production-agent | Purely an internal input to inference (steps 4–5) — not guest-facing content on its own |
| Any downstream sequencing error | Folds into GPS/path validity check above | Timestamps don't need a separate gate check; if bad timestamp data produces a broken route or nonsensical order, that surfaces as a walkability/coherence issue already covered elsewhere |

**Conclusion: timestamps are not a separate gate category.** Flagging this explicitly so the exhaustive list doesn't manufacture a check where none is needed.

---

## 5. Text scanned along the route (placards)

| Variable | Territory | Notes |
|---|---|---|
| OCR accuracy (garbled scan) | Production-agent | Data-quality issue, not a safety one |
| Content risk once folded into the script | **Same surface as audio → narration** | A placard's content becomes source material for the final script exactly like transcribed audio does — meaning it doesn't need its own separate check *if* the gate checks the final assembled script (see the framing note below). It does need its own check if the gate only checks raw inputs independently before assembly |

---

## The one design fork this whole exercise surfaces

Everything above resolves cleanly **if the gate checks the final assembled tour** (script, route, selected photos) rather than each raw collectible independently — that's simpler, and covers most of the list.

But three items above don't fully resolve that way, because the risk lives in the *raw* capture, not just what survives into the final output:
1. Third-party PII spoken in raw audio, even if the agent doesn't use that portion of the transcript
2. Identifiable bystanders/children in raw photos not selected for the final tour, if those raw files are stored or reviewable anywhere
3. Real-time route conditions, which can change after the one-time gate check has already passed

These three are worth carrying forward as the harder design questions, rather than assuming the "check the final output" simplification covers everything.
