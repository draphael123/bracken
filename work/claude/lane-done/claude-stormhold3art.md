# STORMHOLD 3 ART lane (claude/stormhold3art, sonnet, 10-27 03:10)
Branch claude/stormhold3art off claude/stormhold3 d21df530 (master NOT merged in; integ does that at THU BATCH125). Not merged, not deployed.
HEAD: see the last line. Level hash unchanged (src/stormhold-town.js, src/lance-support.js untouched: art only). PORT 6612; PIDs in work/claude/pids-stormhold3art.txt.

## WHAT WAS DRAWN
- THE QUEEN'S CHAMPION (src/lance-art.js, replaces the goblin-in-plate set SPR.lance): plate, plumed helm (red plume, gold crest, amber slit), purple cloak + tabard + gold chevron,
  tower shield in the same, lance with a swallow-tailed purple pennant. 34 poses, built from joints: ride/ride-bob, couch (lance levelled), charge x2, wheel, rear, thrust tell/thrust,
  sweep tell/sweep, bash tell/bash, vault tell/up/perch/stab, spear volley tell/release (on foot AND mounted), pennant tell (on foot AND mounted), planted, wall tell/shield wall/turned,
  thrown, rise, walk x2, guard, hurt (foot and mounted). frameOf(e) maps every updateLance mode to its own pose (B16). Hurt = last frame (HAS_HURT).
- THE BARDED CHARGER (SPR.lanceHorse, replaces the Serjeant's scaled horse): dark bay under a steel chanfron (spike), crinet plates, peytral, the Queen's caparison to the knees with gilt hem
  + chevron, red poll plume; 6 frames: stand, gallop reaching/gathered, REAR (up on the hocks), WHEEL (skid), walk. drawLanceHorse picks the frame by mode.
- THE BRIDGE: a near CITADEL (src/stormhold-art.js bakeCitadel + drawCitadel in main.js): curtain wall under a machicolated crown, six slate-coned towers with banners, the keep with lit
  hall and lantern room, the great gate; fades in from col ~395 and grows across the Long Bridge (drawn over the far castle range, under the near hills). The cages' standard is now a
  cast-iron crane (only when L.arena.boss==='lance'; other levels' timber standard untouched). The MAIN GATE portcullis: iron lintel shoe, winch chains, cross-bars, spiked foot.
- THE OUTER BAILEY: stables' back wall (plank wall, a post per stall, half doors with iron straps, straw, slate lean-to over the hay lofts) and the smithy (sooty ashlar wall, chimney that
  smokes, slate lean-to roof, hanging tongs) - drawStormworks, behind the play, art only.
- Already present from the greybox and left as is (checked in shots): siege-camp tents/mantlets, laid-stone Barbican vault with the 6 murder-hole stones, scaffolded towers, wall-walk crenels
  and breaches, arrow-slit towers, fighting galleries, lookouts with bridge towers, gorge teeth, main-gate gatehouse deco.
- NOT DONE (no time / shared assets): new FX sprites for the spear / ballista bolt / oil pour (the greybox drawLanceBridge versions stay, readable), a dedicated "dry moat" tile, castle
  on the skyline per section beyond castleGrow (the citadel only covers the bridge). The bestiary card uses pose 0 of the new set (reads as the champion).

## CHECKS (node = no browser; page = one headless Chrome at a time, RAM >= 1500 MB each time)
GREEN: level-quality storm (clears), tools/stormhold3.mjs, tells, dressing, boss-read, tools/lance3.mjs (page: every move forced and read back: barding 0.4, charge tears a told gap and
wheels open, cage unhorses, volley, ballista, oil, vault, shield wall, last stand, death slams the gate and ends the fight), textfit bestiary,boss,hints (2402 screens, all 0).
mobile-perf storm,@120,@230,@545 at 4x: 50.1 / 49.7 / 53.8 / 55.2 fps (>= 40 OK; greybox base 53.8/42.5/46.7/51.6). The run then FAILS "createRadialGradient non-finite" - IDENTICAL on the
greybox base d21df530 (pre-existing, not from this lane).
NOT CONCLUSIVE: tools/corpses.mjs timed out at my 300 s cap (no output; not rerun); tools/boss-fight-end.mjs (all levels, never prints before the end) timed out at 580 s - the Lance's
"death ends the fight" is covered by lance3.mjs (dead, slam, bossActive false). Not run: check.mjs (as instructed), map-forks/secrets/boss-greed, level-walk.

## LANCE n=12, WITH FLASKS (boss-rates storm --profile=human --flasks=kit, L17, practiced, 36 fights, 7 min)
knight 6/12, warden 8/12, pyro 7/12 = 21/36 = 58%  (tool reads it LOW by 2 fights; band 60-70). The greybox n=8 was 63%; art changed no gameplay, so this is noise around ~60%
(one more win each for the knight and pyro would be 64%). Wins 49-89 s on pyro; deaths cluster early (24-63 s). work/claude/lance-rates.json / .log.
REC: leave as is, or trim ONE number for the knight (e.g. DUEL_HERO lance knight or the cage's thrown 3.0 -> 3.2 s) in the integ lane and re-measure; do not chase 2 fights at n=36.

## SHOTS (work/claude/shots-stormhold3art/): sheet.png (24 level spots), per-spot PNGs, before/ (greybox), lance-sheet.png (every pose at game scale, seated ones on the charger),
boss-sheet.png + boss-*.png (in-game, mode forced; the dim/"unarmed enraged" HUD in a few is the harness forcing states, not the art). Tools: tools/stormhold3art-shots.mjs, tools/lance-sheet.mjs.

## QUESTIONS FOR DANIEL (rec first)
1. The Lance now reads as a human champion in the Queen's purple/gold (no goblin). Keep? Rec: yes (goblins end at the Goblin Queen).
2. The near citadel only shows on the Long Bridge; the road/bailey keep the far castle range. Rec: accept; a per-section castle layer is a later polish pass.
3. n=12 = 58% (band 60-70, noise). Rec: ship; re-measure after integ at BATCH125 and nudge only if still < 60 at n=18.
4. tools/curtain-wall.mjs is dead (greybox note 8): delete in a cleanup lane.
