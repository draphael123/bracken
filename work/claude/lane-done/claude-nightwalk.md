# nightwalk: browser proof pass on claude/nightroad (a406f2615 + 3 WIP fixes)
Worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\wt-nightroad, branch claude/nightroad. Flags flipped ONLY in the test page (new env BRACKEN_ROAD=ww,sk,mn,ac in tools/cdp.mjs adds window.__WW/__SK/__MN/__AC to every new document; the *_SHIPS constants stay false). Not merged, not deployed. One browser at a time, free RAM 5.2-5.4 GB before every launch.
Stills + numbers: C:\Users\Daniel Raphael\.claude\bracken-lanes\scratch\lane-reports\nightwalk\ (<area>-scene0..N, -arena-, -boss-NN-<mode>, -dead-<s>s, -foe-, map-<node>.png; <area>.json; pilot-*.log, map-forks-on.log, save-*.log). Tool: tools/nightwalk.mjs <area> (green box = hitbox, cyan dot = hero feet, yellow ring = the Widow's reclaim r14 on lanternAt, magenta = the dead boss's box).

## Three REAL BUGS found and fixed (WIP commits on claude/nightroad)
1. 8d7d24249 - src/main.js lines 121/124: the imports were SWAPPED (SILKART <- skyroad_art.js, SKA <- silk_art.js; it came in with silkart). With ?sk=1 the page DIED while booting (SILKART.bakeSilkSkins is not a function: no window.BK, nothing playable). It also pointed the Sky Road's own SKA.bakeSkySets at silk_art, so master's Sky Road bake would have broken too. Node checks could not see it.
2. 87ec38425 - THE MAGE ACADEMY's imps crashed the page on their first throw (updateImp pushes to MG.shots; MG is the Folly's state and is null in any other level: "Cannot read properties of null (reading 'shots')"). Fix: the Academy sets MG = { shots, shelves, shotsOnly }; the Folly's shot loop and shot drawing are split out of updateMage / drawMageProps (mageShots / drawMageShots, behaviour unchanged) and also run for the Academy. Flag-off path unchanged (MG stays null).
3. 1736d1b11 - src/headmistress.js takeBlow: in her LAST phase (floor 0) the floor clamp set d = hp, rounded it to 2 decimals and left hp at +1e-13: alive, and every later blow clamped to 0.00 - an IMMORTAL Headmistress (400 blows, hp 1.1e-13); about a coin flip per kill in real play. Fix: clamp only when the floor is > 0. She now dies in 85 blows. tools/academy.mjs flag off + on still all ok. The same clamp pattern in the Widow / Mother (floor P1 only) and the Castellan (floors never 0) cannot leave hp at ~0.
Tools only: tools/cdp.mjs (BRACKEN_ROAD), tools/nightwalk.mjs, tools/nightwalk-map.mjs, tools/nightwalk-probe.mjs.

## (a) Walk start to exit
tools/level1-pilot.mjs (fresh knight, play-bot hands, lifts counted), flags on, 1 run each, 0 page errors:
- wispwood: 100% of waypoints, 16 lifts, 8 hits, 1 death (199% hp lost over the run: the pilot is a level-1 knight)
- silk: 100%, 9 lifts, 2 hits, 0 deaths, 28% hp
- manor: 100%, 12 lifts, 2 hits, 0 deaths, 65% hp
- academy: 100%, 9 lifts, 1 hit, 0 deaths, 20% hp (only after fix 2; before it the page crashed at the first imp)
Exit: the boss falls (god-mode hurtEnemy) and the game reaches state 'win' (THE ROAD IS CLEAR, +XP) in all four. The art lanes' transition rows / exitHole / exitStair are still drawn only; the exit is the generic boss-clear (as they said).
Not run: tools/level-walk.mjs (the campaign-level walker; heavier), owed to the n=6 lane.

## Per area
| area | verdict |
|---|---|
| Wispwood | PASS (note: contrast low in absolute terms) |
| Silk Undercroft | PASS with 2 notes (Mother off screen while you stand on the floor; box ~10 px left of the body) |
| Hollow Manor | PASS (note: the back wall is very dark) |
| Mage Academy | PASS after fixes 2 and 3 (note: Headmistress head clipped at the screen top) |

### (b) stills (all under scratch\lane-reports\nightwalk\)
Each area: scene0 (start) + sections 1-4 (+5 for the Academy) + arena + 3-7 boss modes + 5 death frames. Wispwood boss modes: drift, wailTell, wail, handsTell, hands, theftTell, glide. Silk: hang, spitTell, spit, sweepTell, sweep, pounceTell, pounce. Manor: thrustTell, thrust, recover, walk, bashTell, bash, stumble. Academy: lecture, chalkTell, chalk (she only asks; the idle hero never answers).
Map (all four flags, everything cleared): map-burial, map-wispwood, map-silk, map-manor, map-witchlight, map-academy, map-mage.png. The road reads left to right, no plates overlap, the south-east hook is fine (Hollow Manor above Silk, the stair above Manor, Academy north of the stair, Folly east). Real arrow keys: burial RIGHT> wispwood RIGHT> silk RIGHT> manor RIGHT> witchlight RIGHT> academy RIGHT> mage; LEFT walks back, every step.

### (c) hitbox scale (green box = hitbox)
- Castellan (hit 14x28): art about 40 tall; the box covers legs and torso, the helmet plume rises ~12 px above it; his spear/sweep reaches (216 px wide in the tell) are the told reach, drawn past the box. Blows land on the body. PASS.
- Lantern Widow (hit 14x30): skirt drawn ~20 wide, so the box is her core; the reclaim ring (r14 at lanternAt) sits round the DRAWN lantern (offset ~8 px under its glass, still covering it): a blow on the lantern reclaims. Veil / wail reach drawn to 97 px. PASS.
- Crypt Mother (hit 30x20): legs span ~100 px, body ~28; the box sits on the body's left half, ~10 px left and ~5 px high of the skull. NOTE (minor): from the floor the camera does not frame her: she hangs at y192, the floor is y512; she is on screen from the arena's opening pull-back or from the platforms. Rec: a hang-mode camera bias (tune lane) if Daniel wants it.
- Headmistress (hit 14x30): box on legs/torso; she perches by the rafter and her head is cut by the top of the screen in chalk mode. Rec: lower the perch one row or lean the boss view up (tune lane). Spellbook Flock (18x12): books drawn ~14-16 px wide, in step with the box (seen in the academy boss stills; the tool could not isolate a flock). PASS.
- Thief (hit 10x10): art ~19x10 (wings wider than the box; fine for a thief).

### (d) the dead boss stays drawn
In every area the dead boss stays in BK.enemies() for 8+ s after the kill and its drawBoss runs: the Widow comes apart into blossom and her lantern drops (visible 0.3-3 s); Castellan heap + ghost; Mother and Headmistress fade. The win card (THE ROAD IS CLEAR) covers the screen from ~3.5-4 s, so the end of the animation sits under it. PASS.

### (e) tile contrast under the dark mask (solid surface cells vs air cells, 70+ px from the hero, luminance 0-255)
Wispwood 21.9-29.7 solid vs 21.5-24.7 air (delta -0.1..5.6); Silk 21.9-26.1 vs 20.9-24.3 (-2.5..3.7); Manor 22.4-26.6 vs 20.9-24.3 (-0.7..6.7); Academy 44.9-63.1 solid (delta +9..32, readable). No near-black surface cells in any section (0/N). The numbers are low because the far field is deliberately dark; in the stills every floor, ledge and wall reads (light top edge, mortar, web / frost trims). Wispwood, Silk and Manor are the darkest; the Manor's back wall is close to the floor's brightness, so only the floor line and props separate them at 70 px+. Rec: leave; a gamma pass is one constant per level (L.dark) if Daniel finds them too dark on a real monitor.

## Page tools nightroad skipped (all four flags on: node --import tools/road-on.mjs + BRACKEN_ROAD)
- map-forks: all green (60 nodes reachable by keys, 55 gated levels from their gates, witchlight -> unburied | academy fork, old-save grandfathering ok).
- save-safety: all ok. save-slots: all ok (also flag off).
- Also flag off: road-map (16 combos), architecture, comments ok; tools/academy.mjs flag off + on ok.
- Not run: tools/check.mjs (never), save-future-guard (does not exist), the mapToSaved legacy-id check (owed at ship time).

## Left before n=6 tuning
1. Merge the three fixes (they are on claude/nightroad): the page could not boot with ?sk=1 before.
2. Boss n=6 with flasks: Lantern Widow (3674 hp), Crypt Mother (4246), Castellan (4532), Headmistress. boss-run needs the --ww/--sk/--mn/--ac page flags; BRACKEN_ROAD=ww,sk,mn,ac now sets them for any tool that uses openPage.
3. The bots played a fresh level-1 knight with lifts; tools/level-walk.mjs (campaign-level hero) not done.
4. Headmistress: re-run with a bot that answers her lessons in the page (my idle hero only saw lecture / chalk).
5. Co-op, music, node art / blurb, bestiary cards, transition rows still unseen (as the art lanes said).

## Questions (rec = built; none block)
1. Crypt Mother: frame her from the floor (camera bias up while mode = hang)? Rec: yes, small, tune lane.
2. Headmistress head clipped at the top: lower the rafter perch one row? Rec: yes, level-side one-liner, tune lane.
3. Dark levels: leave until Daniel has seen them on his monitor. Rec: leave.
4. Ship the four as one batch? Rec: yes, after n=6 and the fixes above.
