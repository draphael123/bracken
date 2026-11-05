# PYROCHARGE (claude/pyrocharge, off master 9ff9bd70) - tip see git log
FINDING: the Pyro ALREADY had a held fireball (hold C: 0.18/0.9/1.5/2.0/2.5 s = 5 steps; tap C = ward). Missing: a charge meter, smooth growth, anything past full. Built on that; tap/ward unchanged.
## Built
- CHARGE METER over her head, same plate/segment style as the knight's: 5 segments (one per step, each lit in a warmer colour, full one outlined) + a short 6th (orange -> white-flash) for the sun.
- BALL GROWS CONTINUOUSLY while held: radius 3 (at 0.18 s) -> 16 at full charge (2.5 s) = 2x the old "big one" (r 8); sprite, hitbox (b.r) and glow follow. Damage still steps with hold (k x swordDmg).
- Past full: keeps swelling 16 -> 24 up to 10 s, her walk drops to 0.25x run (0.5x at steps 1-4; ~13 px/s with the sun). Old "READY auto-release at 6.5 s" removed.
- 10 s: LITTLE SUN (step 6): r 44, crawls at 38 px/s (life 14 s), "LITTLE SUN" word + rising swell sound while held; release = long whoomp + shake 7 + zoom; one great blast on contact/stone/end of flight: ring r 110, shake 12, flash rings, sparks, own sound (SFX sunStep/sunCast/sunBoom). Hold past 14 s: it just goes (NO blow-up/self-damage, per Daniel's change). Cost 60 stamina at release (fizzles "DROPPED" if short).
- A hit or a dodge during the hold drops it (existing rule). Max 2 balls in flight (existing).
## Numbers (tools/pyrocharge.mjs, sword dmg 11, stockade, heat 0)
- Damage per hit x swordDmg by hold: 0.3 s 1.0 | 0.9 s 1.7 | 1.5 s 3.6 | 2.0 s 4.9 | 4 s+ (full) 7.0 | SUN single foe 20.6 total (direct + pips/burn).
- Sun single target 1.5 swordDmg/s over hold+flight (13.7 s); sun on a pack of 5: 3.7 /s. Staff chain in the same harness: 1.38 /s (crude 5/s press loop; real chain higher). Full ball alone: 7 per ~2.5 s = 2.8/s but cost 50 stamina. So sun ~ staff on one foe, 2.7x on a pack of five - a joke/payoff, not a strategy (10 s helpless, rooted-ish, dropped by any hit).
- Boss: sun capped at sunCap = 6% maxHp per application (direct and each boom part); measured 3.6% on a 5000-HP max-HP foe (resist floors act inside hurtAs, unchanged). A sun per ~14 s => <= ~0.3-0.4 %/s vs boss, well under normal play; spamming is impossible (2 in flight, 10 s hold) and it crawls so a boss walking away is never touched (measured: walking foe lost 0).
- Walk speed (px/s): free ~100+, tap/1 s hold 49, full 26, sun 13.
## Interactions
- Heat/Conflagration spender (Meteor Fall): untouched; balls give heat/pips as before (fbHit). Living Bomb: step>=3 = 2 pips, sun same. Ward: the press is still the ward and folds into the hold. Fire Wall/skills untouched.
- AI companion / lab bots: pyroCharge clamps to step<=5 and drops after ~4 s; no code reaches the sun; AI Pyro taps.
- Co-op: single P object path; no new net state (ball is a normal ember).
## Files / commits
src/main.js (PYRO_KIT.fb numbers, fbRadius/fbSlow, fbTick, castFireball, fbBoom/fbHit caps, drawFbMeter, bloom/draw hooks), src/pyro-art.js (sun(), scaled ball/held), src/audio.js (sunStep/sunCast/sunBoom), tools/pyrocharge.mjs (proof). Commits 625f2957, 6a136216 (tip = see below). Small, contained; no new src files.
node --check main/pyro-art/audio OK. Not run: full suite, tools/pyro-kit.mjs (it expects 5 steps / readyMax; step-6 additions should not break it - owed), level-quality n/a.
## Strips (scratch/lane-reports)
pyrocharge-charge.png (0.3/0.9/1.5/2.0/2.4 s growing + meter), pyrocharge-full.png (2.6/4/6/8/9.8 s full, swelling), pyrocharge-sun.png (sun held, released, crawling, blast on a foe). Numbers: pyrocharge-numbers.txt. No separate blow-up strip (feature dropped).
## Questions (rec first)
1. Sun stamina cost 60 / ball cap 6% boss - keep? Rec: keep.
2. Full-charge "2x" read as 2x the old r8 big ball (r16); if Daniel meant 2x the tap ember, it is already ~5x. Rec: keep.
3. Sun on one foe ~= staff DPS; raise k (11 -> 14) if Daniel wants it to feel mighty. Rec: keep, it is a joke.
4. tools/pyro-kit.mjs asserts to re-run on a quiet box (owed).
