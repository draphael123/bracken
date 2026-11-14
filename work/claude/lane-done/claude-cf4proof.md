VERDICT: READY TO RELEASE ALONE
# CF4PROOF-2 (11-12 23:15) - claude/prepcf4, tip a1c533823 (pushed with this report; NOT merged, NOT deployed; CF4_SHIPS true in src/cf-hud.js)
Resumed the dead 21:47 lane. Worktree was clean (no WIP to keep). Evidence: scratch/lane-reports/cf4/ (logs/, stills2/, uihud/, rates-*.json/log, best/).
Caveats first: no clip made (headless cannot judge feel/sound by eye; stills + node proofs instead); the 4-player co-op hit flash and the Flashes 0 / Reduce motion variants are node-proven (cf4.mjs: Reduce motion = no pop, Flashes = no edge flash) but not seen in a browser; mobile-perf title fails on master too (pre-existing).

## BROWSER OWED 1-6
1. PASS. num-display.mjs ok (logs/num-display.log); ui-hud.mjs ok; hud-default.mjs ok; ui-hud-shots.mjs exit 0, errors [] (uihud/*.png; the tool renames the tracked before/after pngs - I restored the tracked ones, no repo change); textfit full run (logs/textfit.log): OFFCENTRE 0 OVERFLOW 0 TRUNCATED 0 COVERS 0 COLLIDE 0 OVERDRAWN 0 ERROR 0; the HUD and number scopes (49 hud screens, 15 popup) clean. Only 2 OFFSCREEN + 1 CLIPPED remain: "coop locked" line (main.js:7350), "HE CHARGES" witchlight mini (36706), What's New line - none is in the CF4 diff (git diff origin/master...HEAD has none of those strings) = pre-existing, not CF4.
2. PASS (with a note). mobile-perf.mjs (logs/mobile-perf.log): map 60.1, wood 60.1, welltown 60.0, redgorge 59.9 fps, busy 7-11 ms/frame, input 0.5 ms. FAILS only on "title" (38.1 fps / 683 ms frame, budget 40/600). Same title fail on UNTOUCHED master 7553137ce (logs/mobile-perf-master.log: 37.6 fps) = pre-existing, title never draws CF4. A 2nd branch run (mobile-perf-2.log) had wood 49.7 fps with a 617 ms hitch (machine noise; first run 60.1). Not measured: wood while at LOW HP (edge pulse every frame) - no tool hook; the pulse is one alpha fillRect, judged cheap. Owed to the QUICK gate / a human phone look.
3. PASS. Stills ON vs OFF in stills2/ (and cf4/*.png from the first run): number pop frames f1/f3/f7, heavy f1/f11, kill f1/f12/f24, chip f1/f31/f46 (white chunk visible at f46, bar reads 5.5), low HP 20% two pulse phases (pulse visible, HUD ok), heal f1/f7 (green lead), number at right view edge ("3" stays on screen: popup clamped, edge-full). Kill-number gold: in-page probe (cf4/probe-kill.mjs) after a kill hit: number {txt 20, kill:true} from the FIRST step, and exact #ffd36b pixels (51) on the buffer in frame 1. In the crop stills the small digit reads cream to my eye, so Daniel should look at on-kill-f1 / f12 himself.
4. PARTIAL. No clip. Coin arc / pitch ladder / heartbeat / flask heal sound are node-proven only (cf4.mjs ok). 4P co-op hit flash + Flashes 0 + Reduce motion not browser-seen: owed to a human 60 s pass (rollback = one-line flag).
5. PASS. boss-rate run ON vs OFF completed with 0 errors, and the ON path really ran: cf4-switch.mjs exit 0 (logs/cf4-switch.log: BOSS_CF4=off -> CF4_SHIPS false, on -> true in the real main.js module). Bar ghost never above real HP: cf4.mjs ghostOf = max(chip, frac) drawn only above frac (hp itself never changes); no live Tusker bar still taken.
6. PASS. death-fx ok, tells ok, juice ok, juice2 ok (J2+J3) with CF4 on (logs/*.log); cf1.mjs ok, cf3.mjs ok, cf4.mjs ok; no console/page errors (stills `errors []`, ui-hud-shots `errors []`). No number/tint overlap found in the stills.

## Boss rates, CF4 ON vs OFF (practiced, human profile, flasks, normal, seeds 1-6, kn/wa/py)
| row | OFF kn/wa/py | ON kn/wa/py | pooled |
| wood (Old Tusker) | 5/6 6/6 2/6 | 5/6 6/6 2/6 | 13/18 72% -> 13/18 72% (0) |
| stockade | 5/6 4/6 4/6 | 5/6 4/6 4/6 | 13/18 72% -> 13/18 72% (0) |
rates-on.json and rates-off.json are byte-identical, and so are the logs: CF4 is feel-only, the sim is untouched (the ON numbers also equal CF2PROOF's ON arm since CF2 is live in this base). Zero movement, expected. Bands unchanged (wood ~72% in band, stockade 72% slightly over 70 as before).

## Checks not rerun (earlier, still valid): modulepreload, dangling-paths, comments, content-audit, combat-feel, blow-tags, node --check (prepcf4.md). Tool-only commits since: BOSS_CF4 switch, kill-gold-from-first-frame fix (5b78f4167), stills tool.
## Restamps at release
modulepreload (--write: adds src/cf-hud.js; 2 unlisted reachable now, budget 15). No HUD/number still baselines changed (ui-hud-shots writes new "hud-*" names but the repo's tracked before/after images are untouched). What's New needed.
## Suggested What's New
"Clearer combat feedback: damage numbers pop, health bars drain smoothly, low health pulses, coins chime up a scale."
## Red
None for CF4. Pre-existing (not CF4): mobile-perf title 38 fps; textfit 2 OFFSCREEN + 1 CLIPPED.
## Questions for Daniel (rec first, already built)
1. Ship CF4 alone, flag ON? REC yes (it is already ON in this branch). 2. Mini-boss + foe bars get the chip too? REC yes, follow-up lane after release. 3. Heavy number threshold 20 internal? REC keep. 4. Merge order: CF2 is already live on master (batch173) so CF4 merges straight on top, no ordering issue. REC release CF4 next, then a 60 s human clip pass at low HP + 4P co-op with sound.
3 best stills for Daniel: scratch/lane-reports/cf4/best/on-kill-f12-crop.png, on-chip-f46-crop.png, on-low-a-full.png (OFF twins in cf4/off-*.png).
