# claude/demonking - S2 DEMONKING: THE DEMON KING, THE SKY FIGHT ON THE DRAKE'S BACK - lane report
Lane S2 (Opus), 11-04. Branch `claude/demonking` off `claude/skymount` (merged up to 2c828077, S1's final). Brief: scratch/lane-reports/heartplan.md section 3 + row S2,
scratch/lane-reports/skymount.md (hooks), Daniel 11-04 (knock him DOWN, never kill; any attack returns a bolt, parry/guard = bigger faster return, all 12 heroes;
every 3rd pip a knockdown; chip when he swoops low; three phases; can't fall off).
GREYBOX, node-checked only. Not merged, not deployed, no browser run (node-only lane). Nothing is live: he appears only on the hidden lab level `skylab`.

## What changed
- `src/demon-king.js` (new, PURE): the fight as a state object stepped by `stepKing(f, dt, { heroes, imps })`, talking to the world by EVENTS.
  - `DK` = every number (the tune lane S5's table): 3 bars x 1200 (x main.js's late-game scale 1 + 0.25 x TIER_BOSS, `newFight(back, { scale })`), tells, speeds,
    damage, rally %, knockdown times, imps, bombs, B15 multipliers.
  - THE RULE: `meet(f, bolt, 'normal'|'power')` (a hero hand met it) / `resolveBody(f, bolt, 'power'|'block'|'hit'|'miss')` (it reached a hero). A return homes on him;
    normal = swordDmg x1.2 + 1 pip, power = x2.0 + 2 pips, never batted. 3 pips = KNOCKDOWN: he tumbles 0.6 s onto the back at S1's `kingLandX` (between you and
    the neck; behind you if you are pressed against it; between two co-op heroes), calls S1 `holdBank` for the whole window, DOWNED 4.5/4.0/3.6 s x1.5 (gold read),
    told REPULSE (0.6 s, 6 dmg within 44 px), 2 s ward x0.4 rising, pips reset.
  - B15: `take(f, dmg, tag)` = x0.4 in every mode but downed (x1.5); a return (`tag 'reflect'`) whole; never past the phase's line; P3 never under 1 -> BEATEN.
  - PHASES: P1 bolt + claw swoop; P2 adds FEINT (dim orb, no core, pulled back, the real one 0.4 s later), DOUBLE BOLT, CHAIN WHIP (high = duck / low = jump),
    THE RALLY 40% (+15% a volley, max 3), HIGH ARCS (lobs that come down on the head); P3 IMPS (two glyph rings on the back, then the existing 'imp' foe, cap 2)
    + LAVA BOMBS (told rings) + rally 70%. Phase line = his last fall + scream, then S1 `beginClimb` (5 s, no bank, bolts and imps cleared).
  - B16: `TOLD` (mark, windup pose, release pose, own tell + release sound per move) and `POSE`; `readOf` (B10), `poseOf`, `dkPlan` (the bot's answer for bossLab).
- `src/reflect-kit.js` (new, data): `REFLECT_KIT` rows for all 12 heroes (normal verbs, the POWER answer = the hero's own guard on the beat, block, notes),
  `DEFAULT_KIT` for any future hero, `classify(heroId, meet)`. Blood Knight keeps the plan's tier-2+ heavy and the Ranger her steady shot as `powerAlso`
  (they fall back to NORMAL until S3 wires the field they read - never a free power return). Rimebinder's thralls do not return. THE DESERT PRIEST: power = THE FLARE.
- `src/demon-king-hands.js` (new): the main.js glue. HOW EVERY HERO RETURNS WITH NO PER-KIT CODE: each hellbolt coming at the heroes is a tiny entity
  (t 'hellbolt') in `enemies`, so every blow box and every hero projectile that can hit a foe hits it; hurtEnemy0 hands it to `struck()` first (no damage, no
  number). The bolt REACHING a hero goes through damagePlayer: the hero's own guard branch answers, and on the beat src/riposte.js `RP.parried` stamps
  `P.rpLookAt` -> a changed stamp = POWER. He is one entity (t 'demonking') so blows land through the normal pipeline; `take()` is the last word before
  `e.hp -= dmg`. Returns land via `hurtAs('reflect')` (a ROOM tag: never chipped). Greybox drawing: him (smoke tail, horns, ember veins, per-pose arm/orb,
  prone), bolts with the gold "returnable" ring, feint orb, pale-gold / white-gold returns + trails, red bat flash, glyph + bomb rings, the red swoop line and whip
  band, the B10 gold ring + bar / pale ward, ! / !! marks; HUD: 3-segment bar + 3 pips. Lab handles `BK.demonKing`: `.phase(n)`, `.pips(n)`, `.knock()`, `.read()`,
  `.off()` / `.on()` (S1's lab without him: `BK.demonKing.off()`; a level can opt out with `skyMount.noKing`).
- `src/main.js`: 9 one-line hooks (+9/-0), each commented `(claude/demonking)`: import + `let DKH`; `DKH = makeDemonKingHands(...)` after SKH's; `DKH.update(wdt)` after
  `SKH.update`; hurtEnemy0 `struck` (after the magechase line) and `take` (before `e.hp -= dmg`); updateEnemies and drawEnemies skip his entities; `DKH.draw`
  after `SKH.drawDrake`; `DKH.hud` in render's screen pass.
- `tools/demon-king.mjs` (new): node check, 262 checks, ~5 s. `--lab --n=12` prints the per-hero duel.
- sky-mount*.js: NOT touched (every S1 hook I needed existed: kingLandX, holdBank, beginClimb, surfaceY, walkable, spawnSlots, back()).

## Checks run (node only)
- `node tools/demon-king.mjs` -> **262 ok, 0 failed**: 12 kit rows (each: returns, power on the beat, block, body hit/miss, ticks ignored) + the 9 live heroes'
  riposte looks; B16 per told move; B15 floor in every mode, x1.5 downed, returns whole, phase lines, never 0, late-game scale; pips 1/2, knockdown at 3, landing
  between hero and neck / behind when pressed / between co-op heroes, downed on the surface, no bank while down, repulse range, ward; block pops / miss flies
  on / parry at the body = power; P2 high arc comes down on the head; rally P1 0%, P2 ~40%, P3 ~70%, power never batted, max 3 volleys, +15% each; per-phase
  move sets, imps cap 2, imps land on the back, bombs P3 only, never 3 in a row; feint timing (real bolt at 1.0 s), double 0.35 s apart; swoop/whip catch a
  stander, duck/jump clear them; phase fall -> climb -> P2; P3 -> BEATEN once; the hands end to end with a stand-in main.js (spawn, bolt entity, struck =
  return, lands 45 x1.2 = 54 whole, power via the parry stamp, BLOCKED, hit, take x0.4/x1.5, imps tagged, clean off-level); the 9 main.js hooks present once.
- THE DUEL (`--lab --n=6`, L40, bars 3 x 1980 = tier 2.6, blows x act 3.0, 3 flasks): reading bot (returns 85% of bolts in reach, 35% on the beat, reads 80% of
  swoops/whips/bombs) **29% pooled** (0-4/6 per hero), median fight 139 s, ~7 knockdowns a fight; **MASH bot 0%**, never a power return. Losses are close (5-30%
  of him left). The model is NOT a ceiling the way the drake lab's is (it eats a bolt it fails to read); the BAND is S5's in bossLab. Numbers I moved on the way
  (all in DK): bolt 14 -> 11, swoop 18 -> 15, whip 20 -> 16, bomb 16 -> 13, downed 4.0/3.6/3.2 -> 4.5/4.0/3.6 (the reading bot was 6% with the plan's numbers).
- `node tools/sky-mount.mjs` -> 175 ok (S1 unchanged). `node tools/architecture.mjs` -> ok. `node --check` main.js + the 3 new src files: ok.
- NOT run: tools/check.mjs (the 40-min suite), any browser.

## Owed (browser / page checks - NOT run, node-only lane)
1. `?level=skylab&hero=<id>`: he flies in, bolts fly, a blow returns one for each of the 12 heroes (chest + high), each hero's beat guard gives a POWER return
   (RP.parried fires on a bolt for every kit - the pyro FLAME-CATCH, warden deflect, hook catch, light-ward, rune-ward, TAKE IT, bow-bash, blade bind), a held guard
   pops it. Every hero projectile (arrow, pistol ball, fireball, shard, javelin, hammer, hatchet, frost bolt) meets a bolt entity (some projectile loops may skip
   tiny/odd foes - lane S3's probes).
2. A knockdown reads (tumble, crash on the back, gold ring + bar, repulse ring, ward) and the drake does not bank meanwhile; the phase climb; P3 imps (existing
   imp hover AI - they fly at you, they do not stand on the back yet: S3/S4 can ground them via SKH.solidAt) and bombs; BEATEN (lane SC's scene starts at
   `BK.demonKingBeaten`).
3. Side effects of bolts living in `enemies`: auto-aim / lock-on, the AI partner (it should swat them - good), RX/tokens, foe counters, music "in a fight".
   The riposte module's `rpFoe` may call him the parried foe when he is within 90 px (a short RIPOSTE x2 on him, still under take()'s x0.4/x1.5).
4. The HUD bar position over the level's own HUD; the draw order (he is drawn under the heroes, after the drake).
5. Register `tools/demon-king.mjs` in tools/check.mjs at the integ merge (not added: the list collides with every lane).

## Questions for Daniel (rec first; built as the rec - lanes never block)
1. THE DESERT PRIEST's power return: his tap C is CONSECRATE (a patch), not a guard. REC: THE FLARE (hold C) going off as the bolt lands = his power return
   (it already "stops every wind-up within 3 tiles"); his staff, beam and sunfall ring return normally. Built in the table; S3 adds the RP.parried call to his flare.
2. Blood Knight / Ranger: the universal parry now gives both a beat answer (BLADE BIND / BOW-BASH) = power. REC: keep that as THE power return for both (one rule
   for 12 heroes) and keep the plan's tier-2+ heavy / steady shot as a SECOND power verb (data `powerAlso`, wired by S3). Alternative: drop the extras.
3. Chip outside the knockdown: REC x0.4 in EVERY non-downed mode (the B15 floor), including when he floats high (arrows / up-attacks reach him). Lower than 0.4
   when he is high would break the floor rule.
4. Is he hit by a return during his knockdown / ward? REC yes, whole, and the pips count toward the next knockdown (nothing is wasted).
5. Damage scale: the duel uses main.js's late-game act x3.0 on his blows and tier 2.6 on his health (as the drake lab did); at the plan's numbers a reading bot
   won 6%. REC: ship my softened numbers (above) as S5's starting point; S5 sets the 60-70% band in bossLab with flasks.

## Hand-off
- S3 REFLECTKIT: per-hero probes vs `REFLECT_KIT`; wire `powerAlso` (Blood Knight heavy tier field, Ranger steady flag) into `struck()`'s meet (`tier` / `steady`);
  the Desert Priest flare -> RP.parried; Rimebinder thrall tag `who: 'thrall'`; projectile loops that skip the bolt entities.
- S4 SKYART: POSE/TOLD ids are the sprite + sound list (sounds fall back to existing SFX names in demon-king-hands.js `SND`); the imps' demon-red reskin
  (`m.dkSkin = 'demon'`); bolts/returns/pips.
- SC SCENES: start scene B on `beaten` (hands: `BK.demonKingBeaten`); the Heart level's sky fight = a `skyMount` level (the king comes with it).
- S5 SKYTUNE: `DK` is the table; `dkPlan` is the bot's plan; `tools/demon-king.mjs --lab` is the first read.
