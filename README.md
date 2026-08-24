# The Dex Publish Gate

A confidence-routing quality and safety gate for AI-generated Dex tours, designed end-to-end — from discovery on Headout's existing WalkieTalkie hackathon project through to a working evaluation engine.

Built by Prathyusha Vedula as an extension of a case study proposal ("The Dex Quality Layer") submitted for an AI Product Manager role at Headout, in response to a request for proof of work beyond the original case study.

## Why this exists

WalkieTalkie lets guides, venue staff, and eventually untrained local contributors turn a walk into a published Dex tour, with no described review step. That's the whole point of the product — removing the trained-producer bottleneck. But the trained producer was also the implicit quality check. This project designs what replaces that check: a dedicated gate, separate from the AI production agent, sitting between "tour generated" and "tour live for guests."

## How to read this repo

The `docs/` folder is numbered in the order the thinking actually happened — each doc builds on the one before it:

1. **Discovery notes** — what WalkieTalkie actually is, its real user flow, and what's confirmed vs. assumed, sourced from Headout's own public writing
2. **PRD** — problem statement, goal, personas, and success metrics for the gate
3. **Variable inventory** — every failure mode across audio, GPS, photos, and text, tagged by whether it's the gate's job or already the production agent's
4. **Roadmap** — the full 12-phase plan from discovery to a working POC
5. **Rubric & decision logic** — concrete pass/flag/fail criteria per check, and why this uses a checklist model instead of a weighted score
6. **Architecture** — where the gate sits, sync vs. async, how six clusters aggregate into one decision
7. **Review workflow** — who reviews a held tour, their interface, and what actions they can take
8. **Pipeline deep dive** — a full worked trace from a raw transcript through the deterministic layer and LLM-as-judge, plus where offline evals, online evals, and inline guardrails each fit

The `poc/` folder is three working, interactive builds, each one more complete than the last:

1. **Confidence routing prototype** — the original proof-of-work piece, a standalone demo of the routing concept
2. **Contributor/reviewer POC** — three views (contributor, reviewer queue, live check) showing the full human workflow around the gate
3. **Eval engine** — paste any transcript and it runs through real deterministic pre-filters and four parallel live LLM-as-judge calls, returning an aggregate decision with reasons and suggested fixes

## Scope, honestly stated

This covers the transcript/narration surface only — Cluster 1 (language & tone) in full, plus the text portions of Clusters 2 and 3 (spoken PII, defamation/promotion/copyright) and Cluster 4 (opinion vs. fact). Route safety and photo-based checks are designed in the docs but not built into the POC — they need a maps API and computer vision respectively, not a language model, and are documented as open work rather than glossed over.

Everything in this repo is independent analysis based on Headout's public materials (their engineering blog, app store listings, and terms of use) plus reasoned inference, clearly labeled as such throughout. Nothing here assumes access to Headout's actual systems, data, or internal roadmap.
