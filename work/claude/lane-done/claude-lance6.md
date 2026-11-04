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
