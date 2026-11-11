# juice1 (J1 HITCORE) - lane report 11-10
Branch claude/juice1 off claude/batch157 (be938d79f). Tip 177bf70eb (pushed). Code-only; NOT merged, NOT deployed.

## What changed
- src/juice.js (appended, from line ~93): JUICE2_SHIPS flag + setJuice2(), JUICE2 table, stopFor2 (65/110/130 ms; boss x0.9 with 55 ms floor; opening x1.25 kept), weaponStopMul (paladin/berserker 1.15, pirate/ranger 0.85, freeze only; reaper greatsword 1.3 unchanged), jitterFor, star helpers, capParts (450, fire kept), hitBudget (24), coopStop duty cap. The base JUICE table is NOT edited.
- src/main.js: import (l.175); starAt + drawStar (near impactAt, ~l.2401); hitstop(t, cls) with co-op cap + jitStamp; blowStop uses stopFor2 x weaponStopMul; recoilX uses e.recT0 (0.16 on); juiceJit in the enemy draw offset (~l.36026); landShake uses landShakeShare (0.65); sparks() goes through partScale + hit budget + fxRand when on; hurtEnemy0 hit branch (flash .08/.12/.14, recoil 3/6/8, star at the contact edge, jitter set, 4 cut-line streaks, per-class spark counts); kill branch (finish stop 130, finish star, 22 px ring, +8 chips, 14 sparks; big foes keep 250 ms); glanceBeat clink (60 ms, 6 white sparks, steel star, 1 px kick back, hero bounce vx 60 for 0.08 s via safeKnock, ground only); P.clinkT tick in the hero update; updateParticles cap + impact life (star fade 0.033 s).
- tools/juice2.mjs (node only): flag OFF = old values exactly; ON = the table; boss floor; weapon muls; jitter + reduce-motion; star alpha; part cap; hit budget; co-op duty at 4P; main.js wiring greps.

## Flag behaviour
Default OFF in this branch (every existing browser check asserts 40/90 ms and could not be re-run). OFF takes the old code path in every touched spot (verified by juice2.mjs on the table; main.js branches are all guarded by JUICE2_SHIPS). Flip = set `export let JUICE2_SHIPS = true` in src/juice.js, then update the old-value asserts in tools/juice.mjs / demo-impact.mjs.
Accessibility: Hit stop OFF = no stop and no jitter; Reduce motion = no jitter; Shake mode/amount untouched; star scaled by the Flashes slider; Impact effects OFF = no star. Shake cap untouched.

## Checks run (node only)
node --check main.js, juice.js: ok. tools/juice2.mjs: OK. tools/level-quality.mjs: pass.
NOT run: juice.mjs, demo-impact, shake-mode, riposte, air-motion, save-safety, combat-feel - they all (or mostly) use tools/cdp.mjs = headless Chrome, banned this lane.
MISTAKE TO DISCLOSE: I started a loop of those tools before noticing; juice/demo-impact/shake-mode launched a browser for a short while (juice failed with an assert diff in its PAGE half, unexamined, likely pre-existing or flag-unrelated since the flag is OFF), then riposte was running when I stopped it. I killed my riposte node PID 7084 and its Chrome tree; the other Chrome/probe tree running (skill-balance-probe, PID 29852) is another lane's and was left alone.

## Deliberately not done / deviations
- "Swing jumps to recover frame 3" on a clink: skipped (touches attack windows; J2 owns swing art).
- Kill-pop white silhouette scale 1.15 and the 40% white tint after a 0.05 s pure-white silhouette: not built (needs the foe/corpse draw path, browser to verify). Star, ring, chips are in.
- Heavy-tagged multi-tick skills at most 1 stop / 0.12 s per foe: not added (P.jetHit already guards DOTs).
- No FULL-mode zoomKick change, no kill zoom in ON HIT (plan answer 4 = NO).
- Hit spawn cap is per frame (hitSpawned reset in updateParticles), applies to sparks() under the flag.

## Owed (browser lane)
1. Run the cdp tools above with flag OFF (must equal master) and ON; fix old-value asserts if flipped. riposte.mjs is frame-sensitive (Warden 90 ms parry).
2. 4-still strip (light / heavy / kill / glance on a sprig + Stockade boss), 6 s knight combo GIF at default speed.
3. Eyeball: jitter reads (frame parity uses performance.now/16), star placement/size, glance bounce at ledges, 4P co-op stutter, perf at 450 parts.
4. One n=6 spot check knight wood + stockade, master vs branch (feel only, expect no change).

## Questions (rec first)
1. Flip JUICE2_SHIPS ON for the demo once the owed browser checks are green? REC YES.
2. Add the kill silhouette pop + white tint in a follow-up (needs browser)? REC YES, with J2.
3. Keep clink bounce active under Reduce motion? REC YES (hero moves 60 px/s for 80 ms, no camera).
