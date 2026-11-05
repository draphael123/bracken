# claude/lance6 - THE QUEEN'S LANCE: HP, gate stun, spears sent back, span zip lines, floating sweep (sonnet, Daniel 11-04 12:05)

## 1. Why he showed 5k+ and the cut
The bar shows base x DIFF.bhp (normal 0.9) x (1 + 0.25 x TIER_BOSS.storm 1.2) = 4650 x 1.17 = **5440**. No phase heal, no plate regen exists. Base cut **4650 -> 3000**: shows **3510** (Queen's 3300 shows 3940, Grubbag ~4300, Windcaller ~1150). Median win was 120 s at 4650 (n=72), so ~75 s expected.
Win rate NOT re-measured (browser gate was up): the cut alone and the x3.5 gate pays will push the pooled rate ABOVE 70%. Dial ready: DUEL_HERO.lance (his damage to the hero: knight 1, pyro 1.42) - raise ~15-25% if n=6 BUILT w/ flasks reads > 70%.

## 2. Bell gate = STUN (x3.5)
- LANCE4.bell.mul 1.6 -> **3.5**, great.mul 2 -> **4** (the bars' own blow still lands whole).
- NEW: he RUNS INTO a dropped tower gate on a charge -> mode `stunned` 3.0 s x3.5 (was OVERRUN x1.5), +30 whole.
- Read: stars over the helm, green ring (lanceOpen), a clock bar + "STUNNED  X3.5" over his head (pinned and stunned), hitstop + zoom + grit.
## 3. Spears (LANCE4.stun.spear)
A volley spear you DODGE comes back: rolled/dashed/i-framed through its landing, or a miss by < 10 px past its point (REC built) -> it flies back in 0.5 s and STUNS him 1.4 s at x2 (+45). Also: STRIKE a stuck spear (1.4 s window) and you hurl it back (the perfect-dodge-then-strike). At most one return per 5 s; not while he is airborne / pinned / stunned. It ignores his shield (his own spear into his flank).
## 4. Zip lines
Three plain SPAN LINES (ids span1/3/5) over the spans the signal ropes do not cover (pier 0->1, 2->3, 4->5): flat, so a hero rides the way he FACES (either way over a gap), a pole on the west lookout, the far end on the next tower's wall; 54 px over the deck (UP from the lookout, a touch from any hero's jump, over his charge's 46 px reach). Never cut. The last span (783-791) has none: a 3-plank gap is a plain jump (all heroes), and the great-bell hoarding is the way over.
## 5. Floating sweep (node-side; level hash 11ab72a47c0b UNCHANGED, no restamp)
tools/floating-geometry, floaters, demo-floats readers, anchor-lint, solid-islands, architecture: the bridge lookouts (towers), lamps (planks), braziers (lookout decks) all stand; found and fixed: the great bell's hoarding (5 cols off its anchor: 2 posts), six one-ended hoardings (330-333 x4 rows, 385,20, 440,14, 438,30: posts), the barbican step's pit (147-150,36-45) showed sky: now backed with masonry ('storm' in DEMO_IDS). NEW gate tools/storm-floats.mjs. Reviewed, kept: the 3 barbican torches (wall sconces on the passage's stone back wall), the arch blocks over the gate passages (flanked by curtain facades). Full scope OWED a screenshot pass.

## Checks (node only; GATE-RUNNING.flag was up)
lance4 (LANCE4_NODE=1) ok (assertions updated: bell/great/stun 3-4x, span lines), stormhold4, watchtowers (rope count excludes span lines), tells, boss-read, answer-tags, combat-feel, goblin-lint, one-new-foe, reach-heroes storm, solid-islands, architecture, storm-floats, demo-floats: green. level-quality storm: only the long-standing bands FAIL (before and after). dangling-paths fails on master too (not mine).
## OWED (browser)
lance4 page part, boss-rates n=6 BUILT w/ flasks (all heroes), before/after shots of his room + prop spots, mash row, hint-shown/textfit (bestiary text grew ~95 chars), a page check of the stun clock, the spear return and the span line pickup per hero (1-4 seats).
## Questions (rec built)
1. Spear return on a near miss as well as a roll (REC built, one per 5 s). ALT: roll/strike only.
2. Spear stun ignores his shield (REC). ALT: shield blocks from the front.
3. Span lines flat (either direction) (REC). ALT: downhill east only like signals.
4. Win band after the cut: re-tune with the DUEL_HERO dial, not HP (REC).

## PROOF 11-04 (sonnet; browser runs, node checks re-run green: lance4 node, storm-floats, stormhold4)
### Rates: storm L18, BUILT (typical card + skills) WITH flasks (kit), human profile, normal; seeds are deterministic, 'crashed' = Chrome crash (memguard/RAM), not a loss
| step | knight | warden | geomancer | ranger | pyro | pooled |
|---|---|---|---|---|---|---|
| after HP cut, no damage change (n=27) | 4/5 | 5/5 | 2/6 | 4/5 | 5/6 | 74% HIGH |
| +warden 1.25 ranger 1.2 pyro 1.75 geo 0.9 | 5/6 | 5/6 | 2/6 | 3/6 | 6/6 | 70% (geo <3) |
| geo 0.7 only | | | 2/5 | | | |
| geo in 1.3x / out 0.85x | | | 4/6 | | | -> 77% pooled HIGH |
| kn 1.2 wa 1.5 py 2.0 (too hard) | 3/6 | 4/6 | 3/5 | 3/6 | 3/5 | 57% [39-73] n=28 |
| **FINAL kn 1.1 wa 1.35 geo 0.85 ra 1.2 py 1.9** | 4/6 | 4/5 | 4/6 | 3/6 | 2/5 + 5/6 (seeds 7-12) = 7/11 | **22/34 = 65%** |
Wins 33-139 s (median ~90 s; the warden's kiting wins are 33-36 s). Every hero >= 3/6 on pooled seeds (pyro 7/11, geo 4/6, ra 3/6). Resist floor untouched (only his damage on heroes moved). Wide intervals (n=6 per hero): the pooled 65% sits in band, individual heroes +-25 pts.
Dials (commit 3de5fd9a / c5d17a79): src/main.js DUEL_HERO.lance {knight 1.1, warden 1.35, geomancer 0.85, ranger 1.2, pyro 1.9}; src/lance-support.js LANCE4.heroDmg geomancer 1.3 (his blows taken by the geomancer's hits up). HP stays 3000. Rate logs: scratch\lance6\rates1-7.log.

### Floating props (DRAWN positions, headless Chrome, shots at every lamp/brazier/torch/bell/checkpoint via tools/storm-props-shots.mjs, 40 props, zoom 6x)
- FOUND: a deck board is drawn 3 px down its tile. Lantern posts on PLANKS already compensate (+3, and they stand: the post's foot is hidden in the light shaft, not floating). BRAZIERS (prop), the great/gate/lance BELLS and decos (signs) on the one-way lookout decks did not: all hung ~3 px above the board (the 4 boss-room braziers 674/710/746/782, the 3 tower bells, 51/225/394/438 road braziers).
- FIXED (2074d725, src/main.js, storm only via curId()): brazier/lancebell/gatebell y +3 on PLANK/ONEWAY, deco onPlank also covers ONEWAY on storm. Level data and hash unchanged. Re-checked after: braziers + bells seat on the boards. Not fixed: the 'sign' ent at 225,17 still hangs 3 px (signs are a separate prop, generic engine; minor, REC leave).
- Nothing clipped; no prop was over air. Torches 101/117/132/593 (barbican) are wall sconces, kept.
### Shots (scratch\lane-reports\lance6-*.png)
lance6-before-/after- brazier-782x26 (his room, east lookout), brazier-710x26, brazier-674x26, brazier-225x17, lancebell-727x26, gatebell-651x26, lanternPost-678x29 (unchanged, stands), room-brazier-wide; lance6-room-gate / room-fight-1..3 (his room, the Lance + a gate tower + zip line), lance6-zip-deck / zip-ride-start / zip-ride-mid (span zip line 1). Raw sets: scratch\lance6\{b7,after,room}.
### Still owed (not done: RAM/time)
Stun clock / spear-return / span-pickup per hero on the page (1-4 seats), hint-shown / textfit page checks (bestiary text grew), mash row. No lance page/doc update: the primer asks none. Merge AFTER the 11-07 demo cut.
### Questions (rec first)
1. Keep the heroDmg geomancer 1.3 + DUEL_HERO per-hero rows (REC); ALT: pooled via a single DUEL_HERO scale. 2. Fix signs on one-way decks engine-wide (REC later, post-demo; 3 px visual only). 3. Re-measure at n=12 per hero before the merge if the band matters (REC: one 25-min run after the demo cut).
