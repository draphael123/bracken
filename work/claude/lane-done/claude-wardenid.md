# claude-wardenid (DEMO SCOPE) - Warden identity pass, branch claude/wardenid (off origin/master 0fe14c26 + skillslots)
Not merged, not deployed. Rates OWED TO THE STARTER-HEROES TUNE LANE (coordinator 11-01: no boss runs here).

## Before / after kit
| piece | before | after |
|---|---|---|
| 3rd jab | same box as jab 1, x1.5, shove 170, step in | LONG THRUST: planted foot (no step), box 60 px (jabs 1-2: 44) but a thin 10 px line, live only on the far frame, x1.25, DRIVES the foe back to rest at the point (38 px); a boss/mini gives HER a 55 px/s recoil instead; recovery 0.12 -> 0.30 s. Inside 14 px it is the haft (x0.3): use it at reach. Measured: foe 54 px out - jabs 1-2 miss, jab 3 hits 54 dmg, vx 0; haft third 9 vs tip 43 |
| resource | VIGIL bar, tap C at full = PHALANX | REACH BAND (P.vigil, never spent, no ready flash): tip starts 28 px out at 0 -> 18 at 100; tip pay x0.92 -> x1.04; drains 14/s after a foe sits on the haft (<14 px) 1.5 s. Measured 41 from 60 over 2 s, steady with nothing on the haft |
| PHALANX | bar spend | SKILL (id setSpears, renamed PHALANX), 28 wind, 16 s cd, row 300 px, hits 1.3x and TRIPS (floorFoe), no pin. Measured: both foes hit, none pinned, cd 15.2 |
| pole-vault | POLE SPRING (straight up, pin) + HARRIER (i-frames over a foe) | ONE skill, id harrier (L3 slot kept), named POLE-VAULT: over the nearest foe or the gap, landing stab 1.3x, NO grace, no pin. POLE SPRING node removed |
| pins | 12-ish pin-class | pin-casting skills: skewer, javelin, rain of spears (+ her plunge). SPITTED now = broken 1.5x longer, not held; PHALANX/HEDGE trip; HOLD THEM DOWN folded into TWIST IT |
| dodge / dash strike | step back / low hop; dash strike 1.3x reach 46 | unchanged (already plain and the reach rider) |
| anti-kite | DUEL_HERO rows | src/boss-pressure.js KITE: boss with the hero out of reach (edge gap > 58 px) for 5 s runs his idle clock up to x1.45 (+0.12/s); never in tells/openings/wards/windups; no extra hp. Hooked in updateEnemies |

## Removed handicap rows (warden)
flotilla TUNE 0.8/1.15; CAP_HERO 0.95; DUEL_HERO closedhelm 2.8, lance 1.3, gqueen 1; paladin-boss hp 0.64 / dmg 1.4; deacon hp 0.85; lance-support 1.04; admirals-champion 0.9/1; bzchief hp 1.96 / dmg 1.15; plus found beyond the brief: great-drill heroTake 1.2, grubbag heroMul 0.9, ARCH_TUNE (Archmage) hp1/dmg1.05/mul1.15/reseal1.3. LP_HERO had none.
RISK: bzchief hp 1.96 -> 1.0 and the demo-slice rows are UNMEASURED; the non-demo rows (closedhelm, lance, gqueen, archmage, drill, grubbag, admiral) are unmeasured too.

## Rates table (WITH flasks, n>=8, 60-70%): OWED to STARTER-HEROES TUNE
Old Tusker, Hornet Queen, Frog King, Bog Troll, Chieftain, Battering Beast, King Gorm: not run. Expect the warden HIGH where the band + long thrust help and the anti-kite clock only bites if she stands off; tip pay now x0.92 at an empty band.

## Checks run
- tools/warden-id.mjs (new, static): 34 green (rows gone, kite clock, band/long-thrust numbers, pin cull, migration poleSpring->harrier, holdThem->pinTwist, both-owned dedupe)
- tools/warden-id-live.mjs (new, browser): green (long thrust, band drain, phalanx, pole-vault)
- tools/progression.mjs green (181 -> 180 nodes); tools/hero-trials.mjs green (warden yard: 'meter' station replaced by 'third'); tools/hero-pass.mjs warden,tip green (asserts loosened for the band)
- tools/starter-kits.mjs updated (harrier replaces poleSpring) - NOT RUN. textfit, keys, mark-integrity, curve/pilot NOT RUN (RAM / page timeout) - run them in the integ gate.

## Deferred (post-demo)
L25-L50 techniques; travelling-thrust charge (hold X braced advance, distance by hold; her run-through already travels by wind and has no tier ladder); deflect-at-range band bonus (flat 12 today); reach-band HUD glyph at the spear head; freeHand/airPoint/skirmisher pin-aftermath passives not cut; L12 skill slot (old POLE SPRING) is empty - pick a replacement; DUEL_HERO.pyro/lance rows are other lanes'.

## ART lane notes
New poses: 'wLong' (planted-foot long thrust, 60 px reach, currently uses the old thrust frame so the spear is drawn 16 px short of the hitbox); PHALANX cast reuses 'plant'; pole-vault reuses 'vault'. Reach-band gauge icon/glyph; trip pose for floored foes exists.

## QUESTIONS FOR DANIEL (rec first, built)
1. Survivor id for the pole-vault: built harrier (L3, early skill kept), POLE SPRING (L12) removed - rec keep; fill L12 with a new warden skill?
2. Long thrust x1.25 + 0.30 s recovery - rec keep pending rates.
3. Band tip pay x0.92 at empty: rec keep (the identity), retune if rates drop.
4. Rows removed beyond the brief (drill, grubbag, archmage): rec keep removed, measure post-demo.

## ADDENDUM 11-01: WARDEN'S REACH, the ultimate (UP+C at a full band)
- Fires on UP+C at P.vigil 100 on the ground (tap C = deflect always, hold C = brace). 6 s: spear x2 reach (stretchMul 2; box hits the whole line), ghost spear drawn out to the hitbox (cyan-white line + leaf, pulsing; brighter mid-thrust), every hit = max tip (TIP.full 2.0), damage swordDmg x K_WARDEN_REACH.perHit 1.0 x amul('wardenReach') (src/skill-k.js), every hit knocks back (knockFoe 260 slide); boss/mini: 3 px push only, resist floors untouched. Band held at 100 and drain off during it; ends with a final thrust (130 px box, swordDmg x 2.5, non-boss stagger 1.2 + knock 320, boss stagger 0.6 only) and the band empties.
- READY flash (meterReady + chime) when the band reaches 100, HUD gauge flashes, prompt 'REACH: UP+C' / 'WARDEN'S REACH n'. Text: hero card, WARDEN_KEYS.vigil, trial station 'meter' restored (warden yard now: ... third, meter), trialName. Bot (src/lab.js): UP+C with a foe within 150 px, no tell, on the ground. hero-trials 'meter' presses UP+C for the warden.
- Checks: tools/warden-id.mjs 36 green (static). tools/warden-id-live.mjs 'reach' scenario written; first run showed cast works (tap-only no cast, UP+C casts, band 0 and timer 0 after 7 s) - the line-skewer / final-thrust asserts were re-placed (foes 50/66/82) but NOT re-run: BROWSER-HOLD flag. Owed: re-run warden-id-live, hero-trials (meter), textfit, keys when the hold lifts.
- ART: ghost spear is a code-drawn overlay; a proper huge-spear sprite and a 'wReach' cast pose would replace it.
