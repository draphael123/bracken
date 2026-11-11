# juice2 (J2 SWINGS + J3 JUMP/LAND/AUDIO) - lane report 11-10
Branch claude/juice2 off claude/juice1 (b5b6be0c9). Tip 40fe1d284 (+ this report), pushed. Code-only; NOT merged, NOT deployed. JUICE2_SHIPS stays OFF (J1's flag; one flip turns J1+J2+J3 on).

## What changed (file:line on the branch)
J2 swings
- src/attack-animation.js: LIGHT2 (ranger [.03,.08,.15,.22], berserker [.05,.10,.17,.24]) + THIRD_ANT .02 + beatsFor() (top of file / before attackPose). Third light cut (combo%3==0, not heavy/heavySwing) = beat[0] + .02, later beats unmoved, so the strike frame still lands on the blow; commit.js windows untouched. OFF: LIGHT[hero] || knight exactly.
- src/swing-smear.js (NEW): SMEAR table, 9 heroes (weapon colour [core, body], radius, 1-3 px width; warden = line), smearOf(): frames 1-2 of the hero's own beat table, alpha .55 -> 0, snaps to 1 on a landed blow; limited to light ground/air cuts (no heavy, rise/sweep/airUp, riposte, plunge, dash cut); thrust (3rd cut, spear) draws a streak. followFrame(): a landed blow holds follow[0] ~1 frame longer. swingHit(): fresh-stamp check.
- src/main.js: import (l.69); drawLightSmear before drawSwing (~l.34668) + one flagged call at the top of drawSwing (additive over the existing arcs; reduce-motion x0.45, Flashes slider scales the snap); follow frame in the hero draw (~l.36230); the hit stamp P.smearHitT/P.smearHitAtk set at the thwack call in hurtEnemy0 (~l.9829) and in the kill branch (~l.9794).
J3 audio / feel
- src/audio.js: imports the flag + jump-feel weights; THWACK table + SFX.thwack(cls) (light 30 ms 2.4 kHz click + 140 Hz body; heavy + 60 Hz sub 90 ms; finish + crunch; pitch +/-6%; 30 ms gate; voice and combat file layers ducked 15% for 90 ms via duckUnder in file()/voice()); SFX.clink() (blk_clash 1.15x + 2.9 kHz / 4.3 kHz ping + noise; flag off = glance()); jump weight layer on pJump (sine chirp 310/w -> 620/w, cloth noise 40 ms for w>=1.1, airy noise for w<=.85) and land weight layer on pLand (thud depth/length/volume grow with w and the fall tier). Both are EXTRA layers under the existing sound, so a recorded jump still plays.
- src/main.js: thwack in the landed-blow branch (before the voice) and the kill branch; glanceSay uses clink; landing: flagged extra shakeCam by weight (drop (w-1)*2.4 px, hop only if w>=1.2 i.e. paladin/berserker; none for light heroes; skipped on Reduce motion).
- tools/juice2.mjs: +~45 asserts (see Checks).

## Flag behaviour
OFF = today's behaviour: beatsFor returns LIGHT[hero] || knight; smearOf null; followFrame the old 0.5 split; thwack/clink/weight layers are no-ops (clink falls to glance); duckUnder = 1; main.js branches all `JUICE2_SHIPS`-guarded. Asserted in tools/juice2.mjs.

## Checks (node only)
node --check main.js, audio.js, attack-animation.js, swing-smear.js ok. tools/juice2.mjs OK (flag off = old exactly; on = the new beats/smear/audio/land maths + main.js and audio.js wiring greps). tools/level-quality.mjs pass. tools/audio-mix.mjs: 197 pools, 0 problems.
MISTAKE TO DISCLOSE: I ran tools/audit-anim.mjs without checking its import chain; it imports audit-lib.mjs -> cdp.mjs, so it launched a headless Chrome for a few seconds (it finished and exited; no wt-juice2 process remains; it wrote the git-ignored audits/combat/anim.json). Output was the usual frame-identity list, nothing new. Please count one short headless browser during the gate.
SKIPPED as owed (cdp/headless): attack-animation.mjs, attack-buffer.mjs, air-motion.mjs, audit-audio.mjs, audio-assets.mjs, juice.mjs, feel-platform.mjs, herofeel-rookery.mjs, level-jump.mjs.

## Deliberately not done
- J1 skip "clink recover frame 3": NOT built (touches the swing/attack windows and needs the browser to see; the clink now has the stop + bounce + sound).
- J1 skip "kill-pop white silhouette / tint": NOT built (needs the foe/corpse draw path and eyes).
- Big-drop 2-frame recover pose hold (plan J3): not built (art, needs eyes; landT is already weight-scaled by jump-feel).
- Light smear is ADDED over the existing generic arcs (they stay); if it reads doubled on knight/paladin/pirate the existing arc can be dropped under the flag after eyeballs.
- Pyro/geomancer/reaper keep their own arcs; the smear sits beside them.

## Owed (browser lane, serial, memguard first)
1. 9-hero strike sheet (frames 0-4 + smear, flag ON) and a GIF of ranger + berserker combos; look at: smear doubling, third-cut beat reads as a beat not a lag, ranger .03 strike.
2. juice.mjs page asserts: old 40/90 ms -> new 65/110 (flag ON) and OFF must equal master; attack-animation.mjs and attack-buffer.mjs OFF and ON (third cut anticipation .06 vs commit window); air-motion.mjs (lean must skip swing keys).
3. 4-still strip (light / heavy / kill / glance) + 6 s knight combo clip with the smear snapping on hit.
4. 20 s audio-on clip: paladin vs pyro jump + landing, a knight combo (thwack level vs voice), a guarded blow (clink). Check peak with 4 layers + music.
5. n=6 spot check knight wood + stockade, master vs branch (feel only, expect no change).

## Questions (rec first; the rec is built)
1. Flip JUICE2_SHIPS ON for the demo after the owed browser proof? REC YES (one line in src/juice.js, then update old-value asserts in juice.mjs / demo-impact.mjs).
2. Drop the existing generic arc under the flag where the new smear doubles it (knight/paladin/pirate)? REC YES if the strip shows doubling.
3. Weight-varied land shake (paladin/berserker only): keep? REC YES (0.6-0.7 px, off under Reduce motion).
4. Build the clink recover frame + kill-pop silhouette in a J4 with the browser? REC YES, small.
