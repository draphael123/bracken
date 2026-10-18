# claude/lamplit3tune (sonnet) - THE LAMPLIT STREET 3: tune + finish for live

Base: origin/claude/lamplit3art 1e7e815d (on claude/lamplit3 b3c7277b). Act III; band read as bosses 60-70, minis 75-85, WITH flasks (profile human, campaign level L21, 12 seeds k/w/p; ranger/paladin 6 seeds). PORT 8744, one page at a time, jobs 2.

## 1. Bot changes (src/lab.js lampPlan branch)
- The relight opening is now played with the new verb: fire in hand, beside a dead lamp the boss can be brought to -> `BK.press('talk')` (E) instead of a swing (no stamina, full relight flare). A swing remains as the fallback with no fire.
- Throwing fire at oil: NOT added to the boss bot - there is no oil in either boss room (the arenas keep the old darkness and have none); oil/nets are on the road, and the level pilot/mash reach model already counts net 1/3 burnt (tools/lamplit3.mjs proves every net has oil + fire before it). Nothing to throw at in a fight.
- Side effect to know: the old strike also hit the boss standing in the flare; E does not, so the human-profile numbers got a little harder than "swing the lamp" (the bot then cuts in the opening as before).

## 2. Rates (human = with flasks, practiced, L21; dry = human+dry)
| fight | baseline (build as handed, swing hands) | final human k/w/p (12 seeds) | ranger/paladin (6) | dry k/w/p |
|---|---|---|---|---|
| TOLLMASTER (boss, band 60-70) | 3/12 9/12 10/12 = 61% overall, knight 25% | **5/12 8/12 10/12 = 64%** | 2/6, 6/6 | 2/12 4/12 9/12 = 42% |
| LAMPREEVE (mini, band 75-85) | 5/12 11/12 9/12 = 71%, knight 42% | **8/11 9/12 10/12 = 77% (t4 run)** | 4/6, 4/6 | 3/12 5/12 5/11 = 37% |
(Tollmaster rows are the final build's separate 12-seed run; the Lampreeve's 12-seed knight/warden/pyro run is the same 0.77 knight value as the final build - ranger/paladin rows were added after, and do not touch k/w/p.) No hero at 0. The Tollmaster's knight stays the low hero (5/12): his kit stands in the sabre/scales; 0.9 gave 8/12, 0.95 5/12 - the sample is noisy (+-3).
Dry is lower than with flasks, as it should be (the target is read WITH flasks).

## 3. Tuning (src/main.js, one new line `LP_HERO` + one hit line in damagePlayer0, on their own lines for the merge)
Per-hero multiplier on how hard THEIR blows land (like CAP_HERO): Tollmaster knight 0.92, ranger 0.85, paladin 1.3; Lampreeve knight 0.77, ranger 0.7, paladin 0.95. Warden/pyro 1.0. Boss hp (3450 / 2000), BOSS_HIT.lampreeve 1.15 and every resistance untouched (no resistance below 0.4x, no new immunity).
The first try at knight 0.5 overshot to 11/12 on both; 0.8/0.7 gave 8/12 and 11/12; final values above. Paladin still 6/6 on the Tollmaster (1.3, 6 seeds): raise further only if it holds at 12 seeds.

## 4. Mash
Boss: 0/6 DEAD (k/w/p x 2: 40-45 s, boss 93-98% left); mini: 0/6 DEAD (23-33 s, boss 90-98% left). Level mash: knight 3 deaths 302%, warden 2 / 209%, pyro 3 / 305%, walked 100%. Rows stamped in docs/mash-bot.json.

## 5. Art finishes (art only)
- Swing chains: the Lamplit's only swing is the gantry cradle; its two chains are now iron LINKS (flat and edge-on alternating, lit edge) - `chainDraw` in src/lamplit3-art.js, called for `m.cradle` only (vines and others unchanged).
- Signs: wooden board -> PAINTED TIN: teal enamel plate, cream border, painted lines, a chip worn to rust, rivets, on a fluted cast-iron post (`lpSign`, src/lamplit3-art.js; `L.lpKit` swaps it in the two sign draw sites in main.js, same as the canal's iron plaques). Checked on a real page (work/tmp, not committed).

## 6. Checks (all one-page-at-a-time, no browser left running)
green: tools/lamplit3.mjs; tools/lamplit2.mjs (all green); level-quality lamplit **CLEARS THE BAR** after the restamp; hint-shown OK; mobile-perf (MP_SCENES=lamplit): 56.9 fps, 15.2 ms busy at 4x, inside the budget; frame-cost (0 read-backs in play); readability.mjs (static scenery asserts); mark-integrity MI_ONLY=tollmaster,lampreeve: every mark drawn and lands; untold-told; answer-tags; textfit --strict scoped (TEXTFIT_LEVELS=lamplit talk,boss,plates,hints,bestiary): OVERFLOW/OFFSCREEN/CLIPPED/TRUNCATED/COVERS/COLLIDE 0 - one ERROR, bestiary tab0 #231 = THE DECK FOREMAN (Flotilla's new bestiary entry draws a null sprite: "reading 'R'"), NOT this lane - flag to the flotilla owner.
Not run: the full textfit-full, stuck/reach (unchanged since lamplit3), scratch/memguard.ps1 (PowerShell scripts disabled here; free RAM 3.9 GB at the start).

## 7. Rows restamped
docs/mash-bot.json (boss, mini, level), docs/level1-pilot.json (knight 8 deaths, 365% hp a run, walked 100%), docs/level1-curve.json (9 deaths, 362%: act III band 100-500%, 1-9 deaths: in band, at the top edge).

## READY-FOR-LIVE: YES (art-before-live satisfied by lamplit3art; bosses in band; level CLEARS the bar).
Caveats: knight is the weak hero on the Tollmaster (5/12) and the level's curve row is 9 deaths (top of the act III band); ranger/paladin rated at 6 seeds only.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. The knight's blows from the Tollmaster land at 0.92x and the Reeve's at 0.77x (a per-hero table, like the Captain's). Rec: keep. Built.
2. The Flotilla bestiary entry (THE DECK FOREMAN) throws a page error in the bestiary (not this lane). Rec: fix in the flotilla lane.
