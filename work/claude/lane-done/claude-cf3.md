# CF3 FOES (claude/cf3) - lane report 11-11
Base batch158 d674f4540. Flag CF3_SHIPS = false (src/cf-foe.js), preview ?cf3=on|off. OFF = batch158 (every main.js call is `if (CF3.CF3_SHIPS)`; the one non-guarded edit is `wdtAll`, which reads cfSlowT = 0 when OFF = the old maths).
Code-only: node checks, no browsers, check.mjs untouched.

## Changes
- NEW src/cf-foe.js: tables (CF3) + pure fns: flashPhase, hurtPose, swayDx/pipPoints/openPulseAlpha, tellRise/tellEnd/glintOn, onKill (pop + chips + boss slow/duck), bossHitKind/bossStar, breakRing, FX list (tick/drawFx).
- main.js (small hunks): import + `?cf3=` param; poseOf (STRUCK block -> generic hurt pose only for foes NOT in HAS_HURT; stagger sway; tell rise for common foes on the fallback windup keys); enemy draw (flash curve = white silhouette 0.05 s then 40% white tint fading out via drawTinted; Flashes scales it, Flashes 0 = tint only; break ring; tell glint; dizzy pips while e.stagger > 0 and not already open-starred); spawnCorpse tail (kill pop 2 frames at 1.15x, boss 3 frames at 1.05x, +6 chips on bosses/minis/big/elite, boss-death slow-mo + music duck); hurtEnemy WRAPPER (not hurtEnemy0) after BR.auto: grey-white star for a resisted boss blow (<= 0.6x outside an opening), gold star for an opening, skipped on a glance (the clink stays the guard's); drawFx next to drawDeathFx; tick next to the deathFx filter; wdtAll reads cfSlowT.
- src/poise-break.js: drawOpen gets an optional `pulse` param (gold stars breathe 2 Hz alpha .65-1; off under Reduce motion). Default false = unchanged.
- tools/cf3.mjs (NOT registered in check.mjs).

## Node results
- `node tools/cf3.mjs`: OK (flash curve, Flashes 0/0.5, DOT flashes never white, hurt pose maths 4 px / 0.22 / 1.12x0.90 and 0 lean under Reduce motion, HAS_HURT untouched, sway/pips/pulse, tell rise (commons only, bosses/minis untouched), kill pop frames/scale/chips, boss slow 0.35x 0.6 s only with Hit stop on + not Reduce motion, resist/opening star kinds, ring once per break, drawFx on a stub canvas, wiring greps: every CF3 call guarded, none inside hurtEnemy0).
- `node tools/juice2.mjs`: OK. `node --check` main.js / cf-foe.js / poise-break.js: OK.

## Findings that change the plan
1. Boss-death AND phase-break slow-mo ALREADY exist: queenDies-style defeat paths set slowT = 1.0 (0.3x for 1 s) at 8 sites and the phase roar sets slowT 0.35 (0.3x). The plan's 0.35x/0.6 s would be WEAKER, so CF3 adds its slow only as a fallback (cfSlowT, 0.35x 0.6 s) when no older slowT is running (a boss body that had no defeat slow-mo). Phase break left alone (already slower than the planned 0.5x/0.3 s). Rec: keep as built.
2. Reduce motion also turns off the boss-death slow-mo (same as the Blood Knight parry slow-mo path), not only Hit stop OFF. Rec: keep.
3. Stagger pips skip foes with an open window (drawOpen's stars already ride there) to avoid double stars.
4. burst() for the chips uses the game's existing burst (Math.random inside); not fxRand. Chips only fire on kills of bosses/minis/big foes, a handful per kill.

## Overlap notes (CF1)
- I touched the hurtEnemy WRAPPER (line right after BR.auto), not hurtEnemy0. If CF1 edits that wrapper area, take the union (one added line). tools/cf3.mjs asserts no CF3 token inside hurtEnemy0.
- main.js import block: one added line `import * as CF3 ...` + `import { duckBeat as cfDuck } from './audio.js'` (reads audio.js only; no edit to it).

## Browser proof owed (after release158, one browser at a time, memguard first, >= 1500 MB)
death-fx.mjs, tells.mjs, tellposes-strip.mjs, boss-fight-end.mjs (slow-mo must not stall the end; cfSlowT only runs when slowT is 0), boss-openings.mjs, poise/finishers.mjs; still strip (white frame / tint / hurt pose / stagger pips / kill pop) on 6 demo foes; a clip of Tusker or Stockade phase break + death; boss-rates n=6 on 2 demo bosses OFF vs ON (expect identical, slow-mo is time only). Also confirm: drawTinted white overlay looks right on sets without a .white bake; the demo-level foe list WITHOUT hurt frames (art lane follow-up, Q7) - not generated here (needs the page's HAS_HURT/SPR).

## Questions (rec first, built with the rec)
1. Boss death slow-mo 0.35x 0.6 s default, off with Hit stop OFF: REC YES (built; also off in Reduce motion).
2. Generic squash+lean for foes without hurt frames, real hurt art later: REC YES (built).
3. No new settings rows: REC NONE (built). Flag stays OFF: REC keep OFF until proof.
4. Should the existing 0.3x/1 s boss-defeat slow-mo be shortened to the plan's 0.35x/0.6 s? REC NO (leave live behaviour).
