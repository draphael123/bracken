# drpolish (DEEP RAILS polish) - branch claude/drpolish, worktree bracken-drpolish, base master 42a1d4cd
Tip: e22283d92 (pushed). NOT merged/deployed. BROWSER OWED (coordinator 08:15: no headless browsers) - not browser-proven, so it can NOT ride BATCH145 until the proof lane runs the list below.

## Changes
1. GREAT DRILL slower attacks (src/great-drill.js, numbers only, no HP cut): tells +0.2 s: dynTell .5->.7 (fuse 1.3->1.5), lungeTell 1.0->1.2, chainTell .9->1.1, cutterTell .9->1.1, ladleTell .9->1.1, rockTell 1.1->1.3, clawTell 1.1->1.3, collapseTell 1.25->1.45, revTell 1.25->1.45 (P3 factor .85->.92); move gap [.45,.35,.25]->[.55,.45,.35]. Hands read DRILL.* so the tell drawing stretches with it. Damage, hp, armour 0.4 floor untouched.
2. GEOMETRY: all minecart lints are fine in the sense that matters: level-quality CLEARS, floaters ok. The floating-geometry/anchor-lint hits (41/45) are almost all rails on trestles + drawn roof timbers/ledges (seen in stills: posts drawn). Real gaps fixed: two block() slabs (archer gantry 655-660 row B-7, tippler perch 737-742 row B-7) had no drawn support -> added 'ledge' decor (posts), decor only (no tile/hash change). anchor-lint still lists minecart 45 (it counts routeSupports, which minecart does not use; report-only). Not found by lint, may remain: sign at col 116 (set down by groundEnts onto slope). Clipping not found in node; needs eyes (owed).
3. FOREMAN (src/foreman.js + minecart-hands.js): smoother = drift builds up (driftAcc 420) instead of snapping, pull-away eases in/out (awayAcc 300), cart pace drawn from the eased speed; driftTell .4->.5, pickTell .6->.7, gaps +0.1 s. NEW MOVE (10-31 'points switch' adapted - his loop is one line so no second line to throw): THE POINTS, from his first stomp: lever flashes on his cart ('!! THE POINTS: JUMP THE GAP', .85 s), then a 44 px GAP in the rail runs down the line at you; a grounded cart falls in (22 dmg + bump back 44), a cart in the air is clear. In chains 1 and 2 (after boom). Bot (foremanPlan, cart-pilot) jumps it via the lump path.
4. tools/drpolish-shots.mjs (stills, browser, not in suite).

## Checks run (node)
- node tools/minecart.mjs: 619 checks ok (+4 new: points told/hit/air-clear, eased drift).
- level-quality minecart: CLEARS THE BAR; floaters: ok; floating-geometry/anchor-lint: REPORT only (45 listed, gate levels ok).
- node tools/drill-gears.mjs started a browser by itself and crashed (page crash, low RAM) - no data.

## Rate table: OWED (no browser)
| fight | needed | target |
| Great Drill | boss-rates minecart (boss) --profile=human, n=6 knight/warden/pyro with flasks, then more only near edge | pooled 68-70% (60-70 band), floor .4 |
| Foreman | boss-rates minecart:mini --profile=human n=6 | 75-85% (B6 mini) |
| cart-pilot | tools/cart-pilot.mjs Foreman ride | still completes with THE POINTS |
| Look | stills: Foreman points tell+gap, 737-742 and 655-660 ledges, any visible floating/clipping | eyes |
Expect Drill up a few points (+0.2 s tells, +0.1 gaps); if > 70% pooled, roll back half of the tell bump, else keep. Foreman gains a move but gets longer beats: watch it does not drop below ~75%.

## Questions (rec first)
1. Foreman new move: the 'points switch' needs two lines; the loop has one. I built a rail GAP instead (jump). Rec: keep. Alt: add the second line (bigger rework).
2. Floating geometry: which spot did Daniel see? Rec: keep the lint-level sweep; send a photo/time of the specific spot if any remain.
3. Add the minecart to the anchor-lint gate after proof? Rec: no, yet (routeSupports not used here).
