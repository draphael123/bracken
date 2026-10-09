# claude/kraken2 - THE KRAKEN 2 (Drowned Causeway boss): lane report

Brief: scratch/brief-kraken2.md (Daniel 2026-10-08). The first lane died mid-tuning on the night of 10-08 (the coordinator lost
its connection). A resume lane finished it on 10-09.

## Commits
- c66ab2ed **item 0: THE KRAKEN CAN BE BEATEN AGAIN.** On master the fourth arm came up through the beached wreck. Its root was inside the hull. A slam at a hero on the deck, plinth or tower left the arm inside the stone, out of reach of every blade. The fix moves the wreck seaward to 603-609, and he smashes it flat for the climb. New check: tools/kraken-reach.mjs. It fails on master. Per hero, with real keys, it checks that every arm in every phase comes up through open air (ROOTS). It checks that every arm lies on the surface it slammed and can be cut from there (LIES). It also covers the limp arms, the climb and the pin.
- 2e2cbeba **items 1-3, WIP.**
  - P1 THE ARMS: ink blobs with a ring tell, patches that hide arms and slow you to x0.7, three-mark spouts, and THE WAVE. The wave has a red !! tell and a real shove. Brace behind a crate or pier, get up high, or jump its crest. The slam now sends a told AoE shockwave ring along the stones. The arms coordinate: one slams while the far one sweeps.
  - P2: a big BREATH bubble and timer. Bells glint and show their reach. A struck bell sends a ring out to him and knells him when it arrives. A sign teaches the bell.
  - P3 THE CLIMB: an arm you cut through falls as a ramp to his head. His EYE opens with a gold ring and timer for x2 (capped), then a told WARD. He SHAKES the ramp (told, jump) and his BEAK bites its top (told). The waystone pin stays.
  - B15: under the tide and after an opening is paid out he takes 0.4x, with a told clank. With the eye shut or warded he takes 0.4x.
- b844cf9c **resume: the dead lane's uncommitted tuning, read and kept.** Checks were green on it (kraken-reach, kraken-rework).
  - Stage 1 has its own slam (26) and sweep (28) weights, and the co-sweep weighs 26.
  - Arms are 0.24 of him (was 0.3).
  - In stage 1 a cut left alone closes HALF of the damage after 7 s (was all of it after 4 s).
  - Climb arms are 0.5 of a first-stage arm (was 0.6).
  - Health 640 -> 670. Rate logs are in work/kraken2/.
- 3dde65ba **roar 26 -> 23.** The climb's double roar was what killed the warden at 2-9% boss health left (work/kraken2/fight-w4.log). Also the bestiary card: the premise, and the fight as it plays now (item 5).
- 412a54b8 (mash) **the mash bot re-stamped for the causeway, level row first, then boss.** Item 0 moved the wreck, so the level row was stale. The boss is 0/6.

## Numbers (campaign level L20, practiced, 6 seeds a hero)
| profile | knight | warden | pyro | overall |
|---|---|---|---|---|
| WITH FLASKS (human), final | 4/6 | 2/6 | 6/6 | 12/18 = 67% (in the 60-70% band) |
| DRY (human+dry), before roar 26->23 | 0/5 | 0/5 | 2/2 | 2/12 (6 page-init ERR rows: the machine was loaded) |

- Fight length: wins took 94-145 s.
- Knight and warden losses: nearly all were in the climb, with 2-10% boss health left. Warden seed 5 dies in stage 1 every time (65 s, 70% left).
- MASH: 0/6 (knight, warden, pyro x2). The mash bot dies at 55-67 s with 73-86% boss health left.
- Note: the pyro rows are identical run to run (the same seeds give the same fights).

## Checks run
- kraken-reach: ok for all 3 heroes. Totals: lies 127, cut 127, limp 2, roots 11, drawn points 4687, fails 0.
- kraken-rework: ok.
- mash-bot --assert causeway: holds.
- level-quality causeway: ok except `mechanics`. That miss was already there before this lane, and the causeway is not gated.
- Focused check.mjs subset, ALL GREEN: syntax, tells, map-grammar, haunted-coast(+runtime), sea-requests, sea-runtime, boss-openings, boss-fight-end, kraken-rework, kraken-reach, finishers, weak-bosses, level-jump, boss-greed, mash-gate, corpses, boss-read, blow-tags (work/kraken2/check-focus.log).
- normal-health: in the subset it hit a page-init timeout (the machine was loaded); run alone it passes (work/kraken2/normal-health.log).
- The full suite was NOT run (40 min on a shared machine); the integrator runs it.
- curve-gate: the causeway's level-1 curve row is stale, because item 0 moved the wreck. Eight other levels are stale on master too. It was not re-stamped here: it is report-only, and the machine is shared by 8-10 lanes.

## Item 5: premise and look
- PREMISE, written: "For a hundred years the goblins paid the deep a tribute to keep it asleep. The tribute stopped; this is what came up the Long Water to collect it." This ties to the Long Water header in src/level.js. It is on the bestiary card (`sub: 'the sea come to collect'`), and the card now explains the fight as it plays.
- LOOK, for the Sonnet art lane. The parts are in src/redraw/kraken.js:
  - bakeKrakenHead already has a barnacled dome, an eye, and a beak.
  - Still to add:
    - bioluminescent markings on the mantle and arms (cold teal, pulsing slowly);
    - deep-sea LURE-LIGHTS on stalks along each arm (drawn in main.js, on the arm chain);
    - a hooked beak profile;
    - a BARNACLE CROWN ring on the dome;
    - a GLOWING eye (an additive glow when open, gold during the climb's eye opening, dimmed when warded).

## QUESTIONS FOR DANIEL
1. **Warden 2/6 with flasks, while pyro is 6/6.** The overall rate is in band and no hero is at 0, but the spread is wide. The pyro rarely gets hit (he takes 115-187 of 265 hp); the melee heroes lose in the climb with under 10% left. REC: ship as is. If the warden still feels hard live, cut the climb's desperation roar to one wave for a melee hero standing on the ramp. BUILT: as is.
2. **Dry rates are low** (knight 0/5, warden 0/5). Expected under B6: tuning is now done WITH flasks. REC: keep the flask band. BUILT: as is.
3. **Premise sign in the level.** A sign before the arena ("THE GOBLINS PAID THE DEEP FOR A HUNDRED YEARS. THE SEA HAS COME TO COLLECT.") would teach the premise in the world. But any ent edit changes the level hash, which makes the mash and curve rows stale again. REC: add it in the art lane, together with the art changes, and re-stamp once. BUILT: the bestiary card only.

## ART (resume lane, 10-09): the Kraken's new look, and the tribute
Merged origin/master (batch80) first: conflicts in src/main.js (hurtEnemy0 hooks), src/marks.js, tools/boss-greed.mjs, tools/check.mjs. This branch carries the keyscore merge (blow tags, B13/B15 walls) that master does not have, so both sides were kept: master's huntmaster / greatdrill / greathound / minecart hooks now take the blow tag (tools/blow-tags.mjs); the duelist list is the union; marks.js is master's table re-written by `tools/tells.mjs --write`; hint-shown re-baselined (see below).

- LOOK (src/redraw/kraken.js, src/main.js draw only):
  - bioluminescent markings on the mantle (cold teal, baked dim, pulsing slowly in the draw; they flare during the ink / roar / slam / sweep wind-ups) and along the back of every arm;
  - LURE-LIGHTS on stalks on the arm chain (drawKrakLamps): three a arm, dim / lit / flare, a beat apart; in the arm that is about to strike they chase;
  - a hooked beak (the tip comes down past the lower jaw), a barnacle crown on the dome (head bake and the far body), a mantle that is now ringed with lamps;
  - the EYE in the climb is a sprite (bakeKrakenEye): GOLD with a bar pupil and an additive glow on the stone when open, a lidded grey-filmed dull coal when warded, the lid clenched when shut. The far body's eye lights follow the same states (gold / orange / dim).
  - KEYFRAMED WIND-UPS, as poses of the body (far-body frames 5-8): INK (hunched, arms drawn in, siphon swollen), SLAM (road-side arms hauled up over the dome), SWEEP (leaning at the road, arms thrown low and wide), ROAR (mantle flared, beak wide, every arm up).
  - GAMEPLAY ANCHORS PINNED: krakenFarPlace returns `fr` (the drawn pose) and `gf` (the old frame); his eye, mouth and standing place read `gf`, so no number moves.
- PREMISE (Q3, rec accepted): a sign at 559 (THE GOBLINS PAID THE DEEP FOR A HUNDRED YEARS. THE SEA HAS COME TO COLLECT.), a tribute table (open empty chest, tipped bowl, three coins) at 563 and a tribute post (goblin mask, still bones, rust-red cloth) at 557 - new deco kind `tributeCairn` (src/dressing.js allows it for the causeway). Causeway mash rows (level, then boss) and curve row re-stamped once at the end.
- Words: SWEPT, BRACED, INK, THE WAVE, HE SHAKES IT, HIS EYE, THE EYE IS SHUT were being dropped by number()'s filter (never on screen!): they are MOVE_WORDS now; 'HIS ARM FALLS - CLIMB IT' is a routed hint line; the Quartermaster's 'HER GUARD IS UP...' replaces the stale routed line (keyscore).
- Shots: work/claude/kraken2art/before (s1-idle, p3-eye-open) and after (a-s1-*, b-far-*, c-climb-*, d-approach-*).
