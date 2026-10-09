# claude/herokeys - HERO-KEYFRAMES (look only; timing untouched)
Branch claude/herokeys off origin/claude/batch80 36c83412. Strips: work/claude/herokeys/{before,after}/<hero>-strip.png (real page, every 2-3 ticks), baked frames work/claude/herokeys/after-frames/<hero>-frames.png (4x), before sheets before-*.png.

## What changed (src/chars.js, src/hero-poses.js, src/main.js 1 line)
- The heroes were already drawn poses, but the blade just rotated between beats with no arc. Frame bakers now keep each blade's drawn hand + tip (c.wp); `smearPass` reads the beat BEFORE each strike beat and fills the arc the blade swept in hard pixels (bright core, checker dither, sparse tail, 1px rim, crescent taper), only onto empty pixels, never past the blade's own length. Straight thrusts (Warden spear, Pyro/Geomancer staff thrusts) get two speed lines along the shaft instead. Applied to beats 1-2 of atk / atkB / atkC / air and heavy, all 7 heroes (steel / gold Paladin / fire Pyro / blood Reaper / amber Geomancer).
- Anticipation: every hero's light-attack wind-up frame sinks 1px (dy 1 / Pyro sit 1), as does the backhand/thrust wind-up shared by comboArcs.
- Fall -> land pop: new art-only BRACE (`P.nearFloor`, set in the draw: falling > 140 px/s within 7 px of a solid tile) shows the landing set's 3rd (knees-bent) frame a beat before touch-down; heroes with 3 land frames only (all seven).
- Existing: take-off / apex / 3-beat landing already existed; run->jump untouched.
- Tools: tools/hero-keys-strip.mjs (real-page strips + per-tick attack-box/stamina fingerprint JSON), tools/hero-keys-sheet.mjs (all heroes' baked strike frames on one page load).

## Timing proof
Green, unchanged: ability-poses, attack-animation, tells, combat-part2, attack-tokens, hero-ledger, knight-rework, combat-feel, geomancer, skins, weapon-skins, dances, crouch-feet, slide, gear-tiers, modulepreload, dangling-paths.
Attack-box live windows (atk time range + rectangle per swing kind) identical before/after for all 7 heroes, light chain and heavy (the knight chain gains one box x only because the pinned foe/knight drifted between runs - after vs after2 differ the same way).
boss-rates wood --profile=human, knight/warden/pyro x 2 seeds: base (batch80) and this branch print IDENTICAL lines (same win/death, seconds, damage taken, 83%).

## Not done / notes
- Paladin's maul head hides most of its smear; Reaper's is a big blood crescent - judge by eye.
- No extra frames inserted into the attack arrays (frame indices are keyed to beats everywhere); the follow-through is the existing beat 3 plus the smear on beat 2.
- 'attack -> idle' pop left as is: recovery already holds the settle frame.

## QUESTIONS FOR DANIEL
- Smear colours/strength OK, or want it fainter / only on the heavy? (built: all light + heavy beats)
- Want real extra drawn follow-through frames per hero (needs a beat-table change in attack-animation.js, still art-only)? Rec: yes, a later lane.
