# claude/deeprails6 - DEEP RAILS 6 TUNE + CURVE lane (Sonnet, 2026-10-31) - on branch claude/deeprails6; NOT merged, NOT deployed

## 1. THE GREAT DRILL, TUNED (boss-rates minecart --ways=practiced --profile=human, kit flasks, L17, 12 seeds a hero, PORT 6230)
Built: `DRILL.heroTake { knight 1.05, warden 1.2, pyro 1.15 }` (src/great-drill.js; applied in damagePlayer0 in src/main.js to every blow of the drill / its ore cart on a hero - the LANCE4 / DUEL_HERO style) and `DRILL.gearHp3 70` (P3's banks are 70 hp, were 100: the jump banks were what made winning P3s long). hp 2700, every move x1.15, resist floor x0.4 + the 3 s ward, jam x2.3 capped: all unchanged. No gear is a standing hit.
| step | knight | warden | pyro | all |
|---|---|---|---|---|
| before (deeprails6 final) | 5/12 | 9/12 | 9/11 | 66% |
| gearHp3 70, take k0.8 w1.0 p1.2 | 8/11 | 12/12 | 8/12 | 80% (high) |
| take k0.9 w1.4 p1.2 | 10/12 | 5/12 | 8/12 | 64% |
| **FINAL take k1.05 w1.2 p1.15** | **8/12 = 67%** | **9/12 = 75%** | **8/12 = 67%** | **25/36 = 69% in band** |
Spread went from 42/75/82 to 67/75/67 (every hero 50-80%). Seeds are noisy (n=12 is +-14 points a hero: knight read 73% at 0.8 and 83% at 0.9 with the same code), so the take terms are a first cut. Wins last (mean): knight 114 s, warden 85 s, pyro 129 s (was 101 / 85 / 124).
Dry (human+dry, 6 seeds, report only): knight 0/6, warden 0/6, pyro 2/6 = 11% (was 28%; heroTake and the harder warden term cost the dry run). Mash: drill 0/6 (0 blows land).
P3 length (tools drill-gears style sampler, work/tmp-deeprails6/dg6.mjs, 11 fights): P3 winning fights mean 25.7 s (7 wins) vs the OLD three-line P3 25.8 s -> +0% (target <= +15%); all P3s 25.2 s (9). Two knight deaths fell before P3 (58 s, 64 s); one sampler crash (cdp 'fresh lab page did not initialize'), re-run for pyro.

## 2. CURVE (tools/level1-pilot.mjs minecart --curve): BEFORE 499% / 12 deaths (cap 400% / 6); AFTER **279% / 5 deaths in 3 runs** (band 70-400 / 0-6)
Where the deaths were (pilot --events / --mtrace): per run 1 at x1155 (the first lip after THE SLAG GUTTER: the 3-wide gap is a jump the bare knight falls 5 px short of; the gutter is an exam span, spikes = death), 2 in the Forgemaster's room (1205-1235; the pilot lingers one 4-s lift-stall per waypoint across a 58-column room and the smith kills a bare L1 knight in ~20 s: blow census shows his blows are already capped at ~45% max hp), and 1 at the Foreman / 876 / 1046. Not the Leading Bore.
Changes (src/minecart.js, no extra checkpoint):
- THE SLAG GUTTER 3 -> 2 columns wide (gutter(S+90, S+91), floor from S+92): same exam span, an easier jump.
- THE FORGE: the Forgemaster's room is 16 columns shorter (gate S+177 -> S+161, loop S+120..S+158, junctions at S+124/S+138/S+150, furnace S+157, smith S+150, torches); the 16 columns between his gate and the parked cart are now a plain quiet floor (a safe beat). SECTIONS/ARCS boss span 1181-1222. His hp, damage and kit are unchanged.
- tools/rule-state.mjs: the `minecart` CURVE_REPORT_ONLY entry REMOVED (curve gate enforced again; replaced by a comment line). tools/minecart.mjs: the forge-room assertion follows the shorter room (gate within g0+30..g1).
Forgemaster (mini2) rates after the shorter room (human + kit, L17, 12 seeds): knight 7/11, warden 10/11, pyro 9/12 = 76% (mini band 75-85, in band; was 78%).
Re-stamped in the documented order, level then bosses, after the final level change: docs/level1-pilot.json (330% / 6 deaths: the pilot row, passes), docs/level1-curve.json (279% / 5), docs/mash-bot.json level (best hero knight 5 deaths) then boss (drill 0/6, brute mini 0/6, forgemaster 0/5 - one warden seed crashed the page, harness).

## CHECKS (green)
tools/minecart.mjs 615 ok | level-quality minecart: every gated level clears (curve ok: 279%, 5 deaths; pilot ok; mash ok) | mash-gate: 53 levels hold | curve-gate: minecart not listed (still stale rows for 11 OTHER levels - spore, kings, hanging, spire, moor, flotilla, hurricane, oreroad, underwell, hornetsnest; warcairn missing - pre-existing, not this lane) | checkpoint-gaps (minecart 10 shrines, same as before) | boss-checkpoint | boss-openings | reach-heroes (0 known crossings, minecart 9 targets all 0). NOT run: the full suite, minecart-route / stuck static (they ride the forge: worth running in the integ gate), mobile-perf.

## QUESTIONS FOR DANIEL (rec first = what is built)
1. Per-hero take terms (k1.05 / w1.2 / p1.15) from n=12 reads. Rec: keep, re-read with 24 seeds in the QUICK gate. Alt: keep k1.05 and w1.2 only.
2. The Forge room 16 columns shorter to fix the bare-knight curve (the Forgemaster is a wall for a level-1 knight by design). Rec: keep (mini still 76% with flasks). Alt: a lower boss-hit dial for his room only.
3. Dry rates fell to 11% for the drill (the bare-handed/no-flask build). Rec: leave (dry is report-only) .
4. curve-gate lists 11 other levels with stale curve rows (not minecart): a curve-restamp lane.

**READY for integ** (code tip = this commit; checks above green; minecart-route / stuck static not run).
