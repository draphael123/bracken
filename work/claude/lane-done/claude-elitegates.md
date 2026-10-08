# claude/elitegates - ELITE GATES for the Glass Sea and the Sky Road (Daniel 10-07, off master 3595a284 + origin/claude/skyroad2)

## What was built
- **Merged origin/claude/skyroad2** first (one conflict in tools/check.mjs's test list, resolved by keeping both sides' lists; `skyroad-stuck` is in).
- **GLASS SEA - THE ALPHA HUNTER** (cutthroat, nighthunter skin, `elite`, UNSTOPPABLE) in THE DARK CUT (cols 505-540, the cold flats): stands at 530 EAST of the boiling crack (520-522), so the crack and the dark are behind you; the portcullis is at 539 under the ridge's east end. The relay mirror is the rule's answer to the cold, not to him: firelight still freezes the pack, never the alpha (src/glass-sea-hands.js `if (e.elite) return false`). Difficulty v2: the second cut hunter and the thrower made way for him. **Checkpoint after**: 548, beside flatsFire4 (cp 446 -> 548 -> 600).
- **SKY ROAD - THE CRAG TROLL** (troll, `elite`, THORNED) on THE FAR CLIFF (the first footing the roost chain's thermals feed; the last roost's air is under the cloud bank behind you, the cloud sea under the west edge): at 277, gate 290 over the cliff's east end (bridgehead + sun-disc). Replaces the cliff's shield. **Checkpoint after**: 294 (was 278, in his yard); the Eyrie door shrine 383 -> 384 so the four shrines stay 90+ apart (tools/skyroad.mjs's own rule). Shrines: 72 / 181 / 294 / 384.
  - First tried the east tower (333-345): the level-quality bar (>= 90 route tiles a checkpoint) and tools/skyroad.mjs (90+ columns apart) cannot take a fifth shrine, so the elite went to the cliff where its post-fight shrine REPLACES one.
- src/elite-kit.js AFFIX_AT: `glasssea|cutthroat` UNSTOPPABLE, `skyroad|troll` THORNED.
- tools/elites.mjs: `glasssea`, `skyroad` out of PENDING (ksar left). The glass sea's rule lays its own road (beams fuse the beds), so the plain fill stopped at col 47: the tool now judges the level WITH its rule solved (`solvedRule`: every bed bar the optional vault stair fused, the slide gap crossed - the slide is measured with real keys by tools/glasssea-slide.mjs). The gate is still shut on top of that and must hold: both gates pass "can be walked round" (nothing relaxed).
- tools/skyroad.mjs: the two coordinates that name moved shrines follow them (278 -> 294, 383 -> 384); same assertions.

## Checks (PORT 8754, alone, all green)
elites, checkpoints, checkpoint-gaps, skyroad, skyroad-probe, skyroad-aloft, skyroad-stuck, glasssea, glasssea-aloft, glasssea-slide, stuck (static + runtime), level-walk-selftest, level-quality glasssea + skyroad (CLEARS THE BAR), mash-gate, curve-gate.

## Re-stamps (docs/mash-bot.json, level1-pilot.json, level1-curve.json)
- glasssea: mash level (written first) knight/warden/pyro all die (lowest hp 0%); then boss 0/6. Pilot: knight, 39 hits, 6 deaths, walked 100%. Curve: act 5, 291% lost, 6 deaths (in band).
- skyroad: mash level all three die (lowest 0%); boss 0/6. Pilot: knight, 24 hits, 3 deaths, walked 100%. Curve: in band.
- Other levels' stale curve rows (spore, kings, storm, unburied, canal, redgorge, underwell) were stale before this lane; untouched.

## QUESTIONS FOR DANIEL (rec built)
1. Troll on the Sky Road repeats the Crag Troll of scree/spire/moor; alternative kinds (archer captain, pike) are one-line swaps in src/sky-road.js + AFFIX_AT. Built: troll (heavy, knocks toward the drop, told).
2. The human-bot rate for these two elites in their rooms was not measured separately (the elite lab rows for troll 10/12 and cutthroat 10/12 are the kind's); a Daniel playtest of both gates is advised.
3. The alpha is NOT frozen by firelight (so the dark cut's relay does not trivialise him). Say if you want him frozen.
