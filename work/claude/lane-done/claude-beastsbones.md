# claude/beastsbones - THE WOLF PAIR + THE BEAR + THE SKELETON SET (code only, ALL FLAGS OFF)

Lane: BEASTSBONES build lane (sonnet), 11-09, unattended. Plan built: `scratch/lane-reports/wolves-plan.md` (opus plan 11-08; Daniel approved 11-08 14:46-14:49), every open question built as its recommendation.
Branch `claude/beastsbones` off master `85d152eb8`, worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-beastsbones`. Not merged, not deployed. Pushed.
Status: **PARTIAL** - code complete and node-verified; NOTHING was run in a browser (barred while the release gate owns the RAM), so every in-page behaviour below is unverified.

## What was built, per foe (numbers are BASE; the act dial multiplies them automatically - see Q2)

Files: `src/beasts.js` + `src/beasts-hands.js` + `src/redraw/beasts_art.js` (snowrunner, greymane, bruin); `src/bones.js` + `src/bones-hands.js` + `src/redraw/bones_art.js` (skelsoldier, skelarcher, skelmage);
`src/bones-placements.js` (exact rows); `src/foe-pen.js` (dev pen); `tools/beasts.mjs`, `tools/bones.mjs`, `tools/beasts-mock.mjs` (a mock game for the hands). Flags: `BEASTS_SHIPS = false` (src/beasts.js), `BONES_SHIPS = false` (src/bones.js).
Pure module = numbers + `newX / xStep(s, world, dt) -> events / xStruck / xParried`; hands module = damage, marks, sounds, pack, projectiles, drawing (the `gobgeo-hands` / `wicker-man-hands` pattern).

| foe | hp | blows (told -> mark -> answer) |
|---|---|---|
| SNOWRUNNER 18x10 | 18 | SNAP 0.40 s, 6, yellow ! block/parry (parry: yelps, flung, open 1.0 s), then RUNS OUT (hit and run); THROAT LEAP 0.55 s, 8, red !!, HIGH -> duck (arc peaks ~20 px, 0.4 s flight, a miss lands behind you and skids open 0.5 s). Small poise: any blow cancels a tell. Chill 0.15 via a shim. |
| GREYMANE 26x15 | 70 | CRUSHING BITE 0.65 s, 12, yellow !, block (push 20 px), parry staggers him 1.2 s; POUNCE-PIN 0.85 s, 14 + PIN 0.6 s, red !!, dodge out of the frost RING (locked at tell start, 90-140 px out); miss = WINDED 1.0 s. Medium bar: light cuts do not flinch him; a heavy blow or the 22% bar breaks it. |
| BRUIN 28x16 | 120 | MAUL 0.9 s (STANDS AND ROARS), 14, yellow !, parry = staggered 1.5 s; CHARGE 0.8 s (lane scraped on the floor), 16 + knockdown, red !!, dodge/roll (hop of 30 px does not clear him); dazed 1.2 s at a wall, skid 0.6 s in the open. Heavy bar (POISE_HEAVY); braced (no flinch, full damage) while charging. |
| SKELETON SOLDIER 10x20 | 44 | THRUST 0.5 s, 10, yellow !, block, parry opens him 1.2 s; SHIELD RUSH 0.7 s, 8 + shove, red !!, jump it (his back is open 0.6 s). GUARD: x0.4 into his front (WARDED, clank, never immune); a HEAVY blow (1.5 s), a parry, a blow from behind or a plunge all land whole. |
| SKELETON ARCHER 10x20 | 22 | AIMED SHOT 0.8 s + glint line, 9, yellow !, block or duck (HIGH); ARC VOLLEY 1.0 s, three bone-dust marks, 3 lobbed arrows x 6, red !!, dodge. Keeps 100-200 px, backs off. Small poise. |
| SKELETON MAGE 10x20 | 18 | BONE WISP 0.9 s, 9, yellow !, slow weakly-homing (<=60 deg/s, 2.5 s life), block or strike it (POPPED); GRAVE ROW 0.8 s, 10, red !!, travelling line 180 px/s for 160 px, jump the crest; BACKSTEP (told green puff 0.3 s, blinks 80-120 px clear of ALL heroes, floor + no wall, cooldown 4 s). Any blow cancels a cast. |

Pack (hands): one runner bites at a time (others orbit at 60-110 px both sides), runners hold while Greymane tells/pounces, hesitate 1.2 s (EARS DOWN) when he dies, spread over 1-4 heroes (`pickTarget` with taken ids). Pin: held via rootT, mash (each press = -0.18 s) or an ally's blow on Greymane frees. Targets are upright heroes only.
Tables: EHP, MARK (BY_HAND + `tells --write`), ANSWER, HEIGHT, threat (2.5 / 6 / 7.5 / 4 / 3 / 3.5), told-attacks SIG, foe-react (COVER/RANGED sets, ROSTER act 4 + a new act 6 row), death-fx (bone / fur), audio CAST voice rows (stand-ins), level-quality ROLES, bestiary short names + COLS + cards (cards only while the family flag is on), poise families (snowrunner/skelarcher/skelmage `small`, bruin POISE_HEAVY), corpse fling, MOVE_WORDS (WARDED, GUARD BROKEN, PINNED, WINDED...), `tools/blow-tags.mjs` NOT_BOSS rows for the two take hooks, `tools/check.mjs` node list (+beasts, +bones).
Art = palette-block placeholders in the right silhouettes (13 / 14 / 16 frames; 13 / 12 / 14 frames), last frame = death (HAS_HURT).
Placements (`src/bones-placements.js`, applied only when BONES_SHIPS): Mage's Folly 3 swaps, Falling Tower 4 swaps; flag off = the same ents array comes back (level hash does not move). Beasts have no placements (mountain lanes).
Dev pen (dev-only): `?dev=1&pen=wolves|bear|bones|all` jumps to THE STOCKADE, clears it, sets the pen down; `BK.pen(name)` the same as a test hook. Without ?dev=1 it does nothing.

## Checks run (Node only; no browser, no check.mjs)
- `tools/beasts.mjs` ok, `tools/bones.mjs` ok (tell lengths and marks vs src/marks.js, struck-in-tell cancels, ward x0.4 + the three breaks, rush back-open, blink clear of heroes / floor / wall / cooldown, wisp turn cap + life, grave row speed / length / jump, volley marks, ring / pin / winded, leap arc + skid, charge lane / dazed / skid, 1-4 seat spread, pack rules, tables, flag OFF = no live level places any of the 6 ids, placement rows find their targets; and the HANDS driven in a mock game).
- `tells --write` (MARK regenerated, 1144 rows; `tells` ok), `answer-tags` ok, `blow-tags` ok, `foe-pass` ok, `foe-cast-lint` ok, `one-new-foe` ok, `death-fx` ok, `comments` ok, `architecture` ok, `threat-holes` ok, `spawns` ok, `goblin-lint` ok, `skins` ok, `sprinkle-cap` ok, `elites` ok, `level-quality mage fallingtower` ok (flag off), `node --check` on every file touched.

## Owed
- **BROWSER (everything in-page is unverified):** the main.js wiring (spawn, dispatch, draws, `ctx.hit`, pin via rootT, frame maps), sprite bake in the page, the pen URL (`levelJump('stockade')` + a 400 ms `penSet`), a page-error check. Run `?dev=1&pen=all` once, then `tools/beasts-shots.mjs` / `tools/bones-shots.mjs` (NOT written: stills per tell / release / hit per foe from the pen).
- `BK.fightLab({ levels:['stockade'], foes:[6 ids] })` n=6 per hero row (target: runner 2-3 cuts, Greymane / soldier a real 1v1, Bruin the room's anchor; no blow over 25% of a campaign hero's bar).
- Placement WALK of Mage's Folly + Falling Tower with a real hero, curve restamp, `tools/level-quality.mjs mage|fallingtower` with the flag forced on - all BEFORE `BONES_SHIPS` flips.
- Art lane: 6 sprite sets to the Frog King bar, bestiary art, Bruin frost recolour (`cnSkin:'frost'` not built), bespoke SFX (stand-ins now), mountain placements for the beasts, `blow-census --walk` at the tune lane, the full suite (`tools/check.mjs`) at integ.

## Questions for Daniel (each built as the recommendation; none blocks)
1. **Pack logic is inside the hands, not src/attack-tokens.js.** Module foes (the Hornsman too) bypass the generic token / squad loop, so "one runner bites at a time" is the hands' own rule. Rec: keep, and fold into the purse when the mountain lane places the wolves.
2. **No DMG rows.** The plan listed DMG rows + COMMON_BLOWS; the Hornsman precedent passes its blows straight from its table and `RX.tier` (damagePlayer0) already scales any non-boss foe by the act dial, so nothing was added. Rec: keep (same result, less churn).
3. **A runner closes a few strides to snap.** Its orbit is 60-110 px but the snap only reaches ~62, so when it picks a snap it steps in (never from afar), winds up told, bites, and runs out. Rec: keep (it is the hit-and-run).
4. **Bruin's "too tall to jump" is a 30 px vertical window** on the charge's body hit; the real hero jump apex was not measured (no browser). Rec: the tune lane measures the apex and sets the window so a normal jump cannot clear, the roll can.
5. **Which blows break the soldier's shield?** Built: `P.heavy` or a `heavy` tag (the knight's held cut), plus a parry, a back hit, a plunge. Skill / ultimate blows (swordDmg x k) are NOT special-cased. Rec: yes, let a skill or finisher blow count as heavy (one line in `hurtEnemy0`), decided after the walk.
