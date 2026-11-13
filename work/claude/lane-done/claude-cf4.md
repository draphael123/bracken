# CF4 HUD feedback (claude/cf4) - report
Branch claude/cf4 off batch158 d674f4540. Flag CF4_SHIPS = false in NEW src/cf-hud.js; preview ?cf4=on|off. OFF = batch158 paths (every main.js call guarded; old fixed <=30 heart/vignette kept only when OFF). Nothing registered in check.mjs.

## Changes
- src/cf-hud.js: tables + pure fns (pop curve, numScale/quantise 0.25, chip barStep, lowStep hysteresis, hitStep, edge alpha/draw, ladder, coinArc, bump).
- main.js (number() + nums draw, hero HP bar, boss default bar ghost, heartbeat/vignette lines, flask drink, coin pickup x2, flyCoins arc, coin counter, import, ?cf4): all behind CF4.CF4_SHIPS.
- audio.js: import heartGain + APPENDED block SFX.lowHeart (-18 dB), healUp, coinLadder(n) (synth, +n semitones cap 8).
- Number pop 1.6->1.0 over 0.08 s (merged re-pop 1.3, heavy >= 20 internal = 1.25x, gold #ffd36b kill via a same-frame dead-body match; Reduce motion = no pop). Text drawn by canvas scale, kept on screen by its scaled width.
- Chip bar: a white lag bar ALREADY existed (hpShown, exp lerp, no hold) -> tuned, not added: hero bar now uses cf4 state (hold 0.4 s, drain 0.6/s, green heal lead 0.15 s, 1 white frame on flask); boss bar gets the same ghost (default branch only).
- Low HP < 25% max (off > 30%): edge pulse 0.10-0.22 at 1.2 Hz, still 0.16 on Reduce motion, rides Vignette + Flashes; heartbeat every 1.0 s; stops in menus, boss name card, Blood Knight, dead. Hero-hit edge flash 0.12 s / 0.2 s (20+ internal), Flashes only.
- Flask: white bar frame + healUp (the green +N and motes already existed, not duplicated). Coins: 8 px pop arc, counter bump 1.2x 0.1 s, ladder +1 semitone inside 0.4 s (real clock), cap +8.

## Node results
node --check cf-hud.js / audio.js / main.js / tools/cf4.mjs ok; node tools/cf4.mjs -> "cf4: ok" (pop, chip drain maths, hysteresis + exclusions, ladder cap, OFF = old paths, SFX keys, guard greps); tools/juice2.mjs still ok. SHA fe5b32bfb.

## Browser proof owed (after release158, one browser at a time, memguard first)
num-display.mjs, ui-hud.mjs, ui-hud-shots.mjs, hud-default.mjs, textfit HUD/numbers --strict, mobile-perf 60 fps; stills: pop frames, chip mid-drain, low HP at 20%, heal, heavy + gold kill number; clip: coin run + flask at low HP with sound; confirm the scaled number never clips at the view edge and the hit flash is OK in 4P co-op.

## Not done / notes
- Mini-boss bar has no chip yet (only the main boss bar); the other coin pickup sites (10939 fly, acorn) keep coinUp except the two pickups using the shared line.
- Merge: CF4 last. main.js hunks overlap CF3 only at the import/query lines (union).

## Questions (rec = built)
1. Mini-boss + foe bars get the chip bar too? REC: yes, in a follow-up after the proof.
2. Heavy number threshold 20 internal (2.0 shown) - keep? REC: keep; tune after seeing real hits.
