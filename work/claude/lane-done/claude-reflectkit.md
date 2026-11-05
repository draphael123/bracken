# claude/reflectkit - S3 REFLECTKIT: per-hero reflect probes, S2's owed browser list, and the bugs they found - lane report
Lane S3 (Sonnet), 11-04/05. Branch `claude/reflectkit` off `claude/demonking` (b1f75709), worktree `bracken-reflectkit`. Not merged, not deployed. One headless Chrome at a time (>= 3.9 GB free throughout);
every browser closed by its tool. tools/check.mjs NOT run. Nothing is live: the king exists only on the hidden lab `?level=skylab`.

## What changed
NEW TOOLS
- `tools/reflect-probe.mjs` (browser, ~25 s for 9 heroes): loads skylab per hero, freezes the king (mode 'hang'), PARKS a real hellbolt entity at a chest or a high spot and tries 13 verbs (tap, up, air cut, heavy,
  short-held, held C, UP+C, throw, down-air, heavy tier 1/2, the Ranger's steady shot, the Paladin's hammer) at 2 chest distances (20 px melee, 70 px = projectiles only) and 4 high spots; then finds each hero's GUARD
  answer by input (hold / tap / down / release at every lead 0-24 frames) with the bolt REACHING him -> must be a POWER return; then a guard far off the beat -> the bolt pops with no pip. Also: no normal verb may be
  a free power return; the two `powerAlso` verbs must power. Seeded, and a hero's probe is retried up to 3x before a line fails (and a retry is printed as a flake).
- `tools/reflect-kit.mjs` (node, <1 s, **183 checks ok**): 12 rows complete, `classify` for every row incl. the three unplayable heroes, string/array tags, powerAlso (tier / steady), tick/room tags never touch a bolt,
  Rimebinder thrall excluded, the Desert Priest flare (`flareAnswer`), and every hook below present exactly once.
- `tools/reflect-owed.mjs` (browser, ~60 s; shots to work/claude/reflectkit/): S2's owed list, below.

BUGS FOUND AND FIXED (all by the probes)
1. **BLOOD KNIGHT could never POWER-return.** His ward-return (`wardReturn`) hurts the nearest foe = the bolt entity, which `struck()` turned into a NORMAL return before the parry stamp made it a power one.
   Fix in `src/demon-king-hands.js`: `resolving` = the id of the bolt reaching a hero; `struck()` ignores that bolt while the hero's own guard code runs (also covers a flame ward's burn, a light-ward shove).
2. **Tag arrays.** main.js tags a blow with a string OR an array (an arrow is `['heavy','shot']`); `struck()` / `classify()` only understood strings, so `powerAlso` could never match and a burn in an array would have
   counted. `classify` now normalises; `struck()` hands it `tier` (`P.bkTier` for the Blood Knight) and `steady`.
3. **powerAlso wired.** Blood Knight heavy at tier >= 2 and the Ranger's STEADY shot are now POWER returns (probe: Blood Knight heavy / heavy T2 = pow, tier-1 heavy = normal; Ranger steady = pow). The Ranger's drawn
   heavy arrows are ALL `['heavy','shot']`, only the steady one differs, so `src/ranger.js` line ~219 gained a third tag `'steady'` (one token).
4. **Ranger's arrows fell off the world on the drake** (the back is no tile, so they never landed; her quiver emptied inside a minute). `main.js` ranger api `isSolid` now also asks `SKH.solidAt` (one line, comment
   `(claude/reflectkit)`). Verified: an arrow sticks in the back (stuck at 358,240) and walking onto it refills the quiver.
5. **Imps crashed the page** (`updateImp` -> `MG.shots`, MG is null off the Mage's Folly) on their first throw. Off MG their fire is now a plain hostile seed (`bolt:true`, owner = the imp: a shield turns it, a blow
   sends it home to the imp). Verified: an imp throws, the fight runs 150 s with no page error.
6. **A hero FINISHER on the king crashed the page** (`burst` with no palette for 'demonking'), found the moment the AI partner started attacking him. Cause: his `maxHp` gave him a 100 poise bar, so a hero's
   poise break made him a "broken common foe". `demonking` + `hellbolt` added to `POISE_SKIP` (main.js, one token pair): no poise bar, no finisher, his knockdown is his only opening.
7. **A reloaded lab carried the old fight** (beaten / phase 3 / frozen) because `f` outlived the level object. `demon-king-hands.js` now remembers the level it spawned on (`flvl`) and starts a NEW fight when the
   level object changes (a retry / restart-at-mount-up will need this).
8. **HUD:** his bar sat at y 10, exactly on the level timer (y 2-15, top-centre, on by default). Moved to y 19. (Shot h1 / h2.)
9. **Table:** the Ranger's row said a late bash pops a bolt; it does not (her bash is a parry only; off the beat the bolt hits her, 5 of 9). Row text fixed (see Q1).

## THE 12-HERO TABLE (browser probe, final run; `--json` has the per-spot detail)
"chest/high" = how many of the 13 verbs returned a parked chest / high bolt (all >= 1 required). "guard" = the lead (frames before the bolt lands) at which the hero's own answer became a POWER return, by input.
"shots@70" = verbs whose PROJECTILE met a bolt 70 px out (melee cannot reach that far).
| hero | chest | high | shots@70 | guard on the beat = POWER (input: first lead, n leads that work) | extra power verb | guard far off the beat |
|---|---|---|---|---|---|---|
| knight | 6 | 7 | none (no shot in the kit) | hold C: lead 1 (x13); tap C: 0 (x1) | - | held 60 f: pops |
| warden | 7 | 8 | javelin (held C), heavy, short-held | hold 1 (x12), tap 0 (x12) | - | tap, 14 f late: pops |
| pyromancer | 7 | 8 | fireball (held C, all steps) | hold 1 (x9), tap 0 (x9) | - | tap 14 f late: pops |
| freebooter | 7 | 6-7 | pistol (held X) | hold 1 (x6), tap 0 (x6) | - | tap 14 f late: pops |
| paladin | 9 | 9 | verdict, hammer (UP+C), short-held | hold 10 (x12) | - | held 60 f: pops |
| geomancer | 5 | 5 | stone shard (short-held) | hold 7 (x6), tap 5 (x5) | - | held 60 f: pops |
| blood knight | 9 | 9 | heavy (crescent wave) | tap 1 (x8), release 1 (x15) [after fix 1] | **heavy tier 2+ = POWER** (tier 1 = normal) | held 60 f: pops (or the ward BREAKS: half the blow, still no pip; ~1 run in 6) |
| berserker | 7 | 8 | none probed (hatchet needs a rack) | hold 1 (x16), tap 0 (x16) | - | held 60 f: pops (price 1 hp) |
| ranger | 7 | 7 | arrow tap, drawn, steady | hold 1 (x13), tap 0 (x14) | **steady shot = POWER** (drawn heavy = normal) | NONE: a late bash is a hit (Q1) |
| rimebinder | not playable in main.js | | | data row; `classify` incl. thrall exclusion checked in node | | |
| demon hunter | not playable in main.js | | | data row checked in node | | |
| desert priest | not playable in main.js | | | data row + `flareAnswer(age, dx, dy)` (power if the flare went off <= 0.2 s before the bolt lands, bolt within 3 tiles) | | |
Every one of the 9 playable heroes has >= 1 verb that returns a chest bolt and >= 1 that returns a high bolt (up attack, air cut or a lobbed shot), a guard answer that is a power return, and no free power return.
"projectiles meet bolts": warden, pyromancer, freebooter, paladin, geomancer, blood knight and ranger projectiles all meet a bolt entity with no per-kit code. (The knight has no projectile; the berserker's only
projectile is the rack hatchet - owed.)

## S2's owed browser list, answered (tools/reflect-owed.mjs, all ok)
1. THE KNOCKDOWN LOOKS RIGHT: tumble@31 > downed@72 > repulse told@343 (the !! mark and the black ring) > rise (pale ward) > float@500 frames; one knockdown, pips reset; the drake held its bank 6.2 s. Shots
   `work/claude/reflectkit/k1..k6` (k1 = the return in flight, k2 tumble, k3 crash + gold ring + bar, k4 downed open, k5 repulse tell, k6 ward rising).
2. IMPS + BOMBS: `phase(3)` runs the fall + climb (747 frames) into P3; imps summoned, cap 2 never exceeded, they carry `dkSkin 'demon'` (still the mage's pink imp: S4's reskin), they throw (fix 5); bombs fall
   (rings told). Shots i1 (an imp + red ring on the back), i2.
3. BOLTS AS FOES, SIDE EFFECTS: no leak (bolt entities == bolts in flight every frame over 70 s; a returned bolt keeps its entity through the hit-stop, up to ~8 frames, harmless); no hellbolt outlives its bolt; no
   page error in 70 s fights alone or with an AI partner. NEARFOE/WARDFOE name a bolt as "the foe" (fix 1's cause); RP.parried on a bolt entity just reels a throwaway entity. There is no auto-aim/lock-on in the
   engine beyond those two foe pickers. THE AI PARTNER swats bolts that come into its reach (a parked bolt in front of it returned in 3 frames), and ONCE ACTIVE IT FIGHTS THE KING: warden AI + a still knight:
   15 returns, 2250 of his 3600 hp gone in 70 s (god mode, so a ceiling) - see Q4. (Before fix 6 it crashed the page.)
4. HUD: the bar + label + 3 pips at the real 320x180 view are readable; his bar was on the level timer (fix 8). Shots h1 (default HUD), h2 (minimal). The "PRESS A KEY FOR SOUND" plate in the shots is the test
   page (audio off), not the game.
5. Register in check.mjs: NOT added (see Owed).

## Checks run
- `node tools/reflect-kit.mjs` -> 183 ok. `node tools/demon-king.mjs` -> 262 ok (S2's, unchanged, still sees its 9 main.js hooks). `node tools/sky-mount.mjs` -> 175 ok. `node tools/architecture.mjs` -> ok.
  `node --check` main.js + the 3 src files + the 3 new tools: ok.
- `node tools/reflect-probe.mjs` -> ok (4 full runs in the final state; early runs flaked on a loaded machine, hence the retry + report of flakes; none needed a retry in the last runs).
- `node tools/reflect-owed.mjs` -> ok (knock, imps, side, hud).
- NOT run: tools/check.mjs (the suite), any boss win-rate run (not in the brief).

## Owed (for the integ merge / other lanes)
1. Register in tools/check.mjs: `reflect-kit` (node, 1 s) and `reflect-probe` + `reflect-owed` (browser, ~25 s / ~60 s) beside `demon-king`. NOT done here: check.mjs holds its node list as one ~3,000-char line
   (line 279) that every lane edits, so it is not a clean one-line registry entry; add the three names at the integ merge, with S2's `demon-king`.
2. main.js touches this lane added (all one-liners, commented `(claude/reflectkit)`): the ranger api `isSolid`, the imp `else seeds.push`, two tokens in `POISE_SKIP`. They collide with nothing S2/S1 added.
3. Berserker's rack hatchet vs a bolt (needs WCH + a held hatchet): not probed. It goes through hurtAs('throw') like the Warden's javelin, so it should return; confirm in the war-cairn lab.
4. Rimebinder, Demon Hunter, Desert Priest are rows only (no hero in main.js, no `HEROES` entry; the priest is "not wired in" per src/sun-priest.js). When one is wired: its guard hook must call `RP.parried`
   (the probe's HEROES list + the table row then cover it); the priest's flare calls `flareAnswer` and `RP.parried` on 'power'.
5. S4: the imps still draw as the mage's pink imp (the skin tag is set); the knockdown / return / pip pictures are greybox.
6. S5: the AI partner is a strong fighter in the sky (Q4); returns land on a still ranger's reach only; tune with an AI seat in the band runs.

## Questions for Daniel (rec first - the rec is built; lanes never block)
1. The Ranger has no held guard: her bash is a parry only, so a bolt met a beat late HITS her (the table's old "a late bash pops" was wrong). REC (built): keep it - the Ranger is the dodge hero, her
   power return is the bash on the beat or a steady shot. Alternative: give the late bash a block (a Ranger lane change, not an S3 one).
2. The king's bar: I moved it under the level timer (top, y 19). Every other boss's plate is at the BOTTOM of the screen (y VH-28). REC (built): keep the top for the lab; when S4 art lands, decide if the sky
   fight should use the standard bottom plate (toasts already stay clear of it for `bossActive`). The timer is a player setting and can be off.
3. No poise bar on the king (his knockdown is his one opening; a poise break would have let a FINISHER run on him). REC (built): yes. A ripostes-break-his-guard rule on him is not wanted.
4. The AI partner takes the sky fight apart in the first pass (15 returns / 70 s, 2250 hp, god mode). REC: leave it for S5 to see in bossLab with an AI seat; if too strong, AI returns count half a pip. Not
   built (a design call).
5. A second Blood Knight oddity: a held ward 60 f long can BREAK on a bolt (the ward's own rule: half the blow finds him, no pip). REC: accept - it is his ward's price, not a reflect bug.
