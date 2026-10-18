# claude/church3tune - LIT CHURCH 3 TUNE + ART GAPS (sonnet, 2026-10-18)
Base: claude/church3art ce3c552b. Port 8746, one page at a time.

## TUNING (src/paladin-boss.js)
- hp 2100 -> 1850; brazier falter WARD wardT 3.0 -> 2.0 (falter 3.4 s, x1.7, cap 15% unchanged; resist floors 0.4x unchanged, no new immunity).
- Per-hero duel: heroHp knight 1.4->1.35, warden 0.72->0.64, pyro 1.5->0.95; heroDmg (his blows on that hero) knight 2.0->2.6, warden 1.0->1.4, pyro 1.35->2.0.
- Tried first (hp 1850, hp scales 1.35/0.64/1.25, dmg 2.2/1.25/1.6): 83% (too easy, pyro still 185 s). Second (dmg 2.8/1.7/2.2): about 50%. Third = shipped.

## RATES (tools/boss-rates.mjs church, practiced, profile human, flasks kit, campaign L26)
| Hero | Before (church3) | After |
|---|---|---|
| knight | 7/12, 129 s | 9/12, mean fight 105 s |
| warden | 8/12, 193 s | 6/11 (1 fight errored), 144 s |
| pyro | 7/12, 192 s | 7/12, 140 s |
| k/w/p total | 61% | **63% (22/35), in act IV band 57-63** |
| ranger (6 seeds) | 5/6 | 4/6, 178 s |
| paladin (6 seeds) | 4/6 | 6/6, 143 s (no per-hero scale for ranger/paladin: they take base hp 1850, so paladin is easy now; add scales if Daniel wants) |
Mean fight time is over all fights (wins and deaths). Warden and pyro are now inside 90-150 s.
**Deacon re-measure** (church:mini, 12 seeds, flasks): knight 12/12 (35 s), warden 9/12 (66 s), pyro 6/10 (65 s; 2 fights hung/killed) = 27/34 = **79%** (band 75-85). Untouched by this lane's tune.

## ART
- DEATH FRAMES: Order Paladin, Undead Paladin and Undead Priest sheets gain a real corpse frame (last frame, src/redraw/church3_foes_art.js paladinDead / priestDead; paladin on his back with mace flung out and shield across him, the dead one's visor dark; priest a collapsed robe, skull rolled from the cowl, censer on its side with a last thread of smoke). src/main.js C3_DEAD: they fall in the hurt pose (R.length-2 on hurt, as before) and lie as the death frame (c.kn) when they land. Preview: work/tmp-church3tune/dead.png (uncommitted scratch).
- BRAZIER vs ALTAR PROP: the sanctuary reredos altar prop (src/redraw/church_set.js line 250) moved 295.5 -> 292.5 (3 tiles left) so the middle brazier (col 296) no longer stands inside it. Art only; no geometry.

## MASH
`mash-bot church --seeds=2 --write`: boss 0/6 (knight/warden/pyro all dead, boss left 90/79/45%), mini 0/6 (83/64/56%). docs/mash-bot.json restamped.

## CHECKS (all green)
paladin-boss 170, church3-foes 35, lit-church 369, tells (marks agree), hint-shown OK, boss-fight-end (64 fights end on the kill), textfit bestiary,boss --strict (0 overflow; 2 OFFSCREEN = flotilla/hurricane, not this lane), corpses ok.
Not run: full suite, a visual pass of the moved altar and the new corpses in the live arena.

## REDS (not mine)
Church CURVE (level-quality): L1 knight 14 deaths vs 12 - for the curve-fix lanes, untouched.

## VERDICT: READY FOR LIVE (boss 63% in band, fights 105-144 s k/w/p, Deacon 79%, mash 0/6), with the caveat that the corpse frames and altar nudge got no in-game screenshot.

## QUESTIONS FOR DANIEL (rec, built)
1. Paladin/ranger hero scales: rec add heroHp/heroDmg for ranger and paladin so paladin is not 6/6; built: none (4/6 and 6/6 at 6 seeds).
2. Ranger fights run 178 s; rec accept (not a target hero); built: nothing.
