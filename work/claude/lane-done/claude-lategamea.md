# LATE-GAME FIXES lane A (claude/lategamea, base 416af6c2 = BATCH133) - NOT merged, NOT deployed

Daniel approved 10-31 12:36 (first-option recs of scratch/brief-lategame-1101.md). Commits: 255e0486 (taper, flask cap, mitigation), 3d50c913 (skill rule), plus this report.
Files: src/progression.js (growthAt + taper helpers), src/survival.js (FLASK_HEAL_CAP, softFloorMit, mitigationMul), src/main.js (damagePlayer chain, card text, 20 skill sites, CD_MAX), src/skill-k.js (NEW: the k table + PYRO_TODO), src/berserker.js, src/ranger.js, tools/lategame.mjs (NEW static test).
Import alias in main.js is SKK (SK was taken by the straw king import).

## 1. Stat growth taper (Q2A)
Rule: a stat pick is FULL for the first 12 picks in that stat, HALF after (VIGOR +8 -> +4, ENDURANCE +12 -> +6, MIGHT +1 -> +1 every other pick). Free growth: +2 hp/level to L24 then +1/level; +1 dmg every 4th level to L24 then every 6th. Stamina free growth, CARD_CAP 25, thresholds (10/20 picks) and milestones unchanged. The level-up card shows "+4 HEALTH (HALF)" etc. once a stat has 12 picks. growthAt is the single source, so every hero, AI partner and tool follows; existing saves are re-read at once (no migration).
Knight, typical picks (45% VIGOR / 20% ENDURANCE / 35% MIGHT of the level; no gear, perks or HEART OF OAK), old -> new:
| level | hp | stamina | free+MIGHT damage |
|---|---|---|---|
| L5 | 126 -> 126 | 122 | 2 -> 2 |
| L15 | 178 -> 178 | 166 | 9 -> 9 |
| L24 | 228 -> 228 | 196 | 16 -> 16 |
| L25 | 238 -> 237 | 210 | 16 -> 16 |
| L35 | 290 -> 267 | 254 | 22 -> 21 |
| L50 | 376 -> 310 (-66, -18%) | 320 | 31 -> 26 |
Sword hit (typical, edges included) old -> new at L35 / L50: knight 44->43 / 53->48, paladin 48->47 / 57->52, pirate 42->41 / 51->46, reaper 50->49 / 59->54, warden 45->44 / 54->49, berserker 46->45 / 55->50, ranger 50->49 / 59->54. Nothing changes below L24 or below 12 picks in a stat.
"Every other card a choice": NOT built. The L25+ milestone perks already are choice cards; making the in-between cards hero techniques is Q6 (TECH_LEVELS 10/15/.../50, one new technique per hero), a separate content lane. See Questions.

## 2. Mitigation soft floor + flask cap (Q3A)
- Chain = IRON HIDE perk 0.9, IRON CHARM 0.8, RINGMAIL 0.9, PLATE 0.9, WARDED PLATE 0.9, multiplied, then passed through SV.softFloorMit: identity at/above 0.70, smooth exponential approach to a floor of 0.60 below it (monotone, never under 0.6). Temporary actives (war cry, harden, blood mail, heat shield, divine shield, ash cloak) are outside the chain and still stack (hero verbs, not gear). % hazards still skip it.
| chain | before | after |
|---|---|---|
| typical (4 layers: perk + 3 gear) | 0.656 | 0.664 |
| full tank (+ IRON CHARM, 5 layers) | 0.525 | 0.617 |
| charm + ringmail + plate | 0.648 | 0.659 |
| any 1-3 layers | unchanged | unchanged |
Tank edge over typical in effective HP: 1/0.525 vs 1/0.656 = +25% before, +8% after (mitigation alone).
- Flask: heal = min(150, share x maxHp). A 40% flask binds from 375 max hp:
| max hp | 300 | 353 | 400 | 450 | 500 |
|---|---|---|---|---|---|
| 40% flask, before -> after | 120 | 141 | 160 -> 150 | 180 -> 150 | 200 -> 150 |
The cap is flat, not level-gated (a level gate adds nothing: under ~375 hp it never binds).

## 3. One skill damage rule (Q4A): dmg = round(swordDmg x k x amul) (table in src/skill-k.js)
Linear AoE trimmed (per target, rank 1, typical build, MASTERY from L35; old -> new):
| skill (hero) | old k | new k | L16 | L35 | L50 |
|---|---|---|---|---|---|
| WHIRLWIND (knight), 2 cuts; cd 4 -> 5 s | 1.1 | 0.7 | 72->46 | 134->83 | 161->93 |
| RAIN OF SPEARS (warden), per spear | 1.3 | 0.9 | 44->31 | 81->55 | 97->61 |
| AXE STORM bzStorm (berserker), per hatchet | 1.2 | 0.85 | 42->30 | 76->53 | 91->59 |
| VOLLEY rgVolley (ranger), per arrow | 1.0 | 0.7 | 40->28 | 69->47 | 81->52 |
| SWORD OF THE REALM (knight) small / big swing, pierce kept | 0.6 / 1.2 | 0.4 / 0.8 | 20->13 | 36->24 | 44->26 |
Flat skills converted (old flat -> k; old -> new on the same basis):
| skill (hero) | old formula | new k | L16 | L35 | L50 |
|---|---|---|---|---|---|
| hammerLeap (paladin) | 24 | 0.7 | 27->26 | 33->45 | 33->50 |
| lightLance (paladin) | 34 (HG.lance.dmg) | 1.0 | 39->37 | 47->65 | 47->72 |
| holyCharge (paladin) | 12 | 0.4 | 14->15 | 17->26 | 17->29 |
| dawnburst (paladin) | 12 | 0.4 | 14->15 | 17->26 | 17->29 |
| broadside (freebooter) | 22 | 0.75 | 25->23 | 30->42 | 30->48 |
| keelhaul (freebooter) | 12 | 0.45 | 14->14 | 17->25 | 17->29 |
| boarding (freebooter) | 12+5/rank | 0.45+0.2/rank | 14->14 | 17->25 | 17->29 |
| grapeshot (freebooter) | 10+4/rank | 0.4+0.15/rank | 11->12 | 14->23 | 14->25 |
| powderKeg (freebooter) | 17 | 0.65 | 19->20 | 23->37 | 23->41 |
| heavySeas (freebooter) | 12 | 0.45 | 14->14 | 17->25 | 17->29 |
| harvestMoon / soulReap (blood knight legacy) | 17 / 14 | 0.5 / 0.45 | 19->20 / 16->18 | 23->34 / 19->30 | 23->37 / 19->34 |
| graveTide, scytheThrown, bone skeleton (legacy) | 10+4r / 17+4r / 5-10 | 0.3+0.12r / 0.5+0.12r / 0.15-0.35 | about same | rises | rises |
| shieldThrow (knight) far / near / return | 13 / 9 / 5 | 0.45 / 0.3 / 0.18 | 15->15 | 18->27 | 18->30 |
k was set so a rank-1 L16 cast is within ~10% of today's number (the brief's k where it names one: hammerLeap 0.7, lightLance 1.0, broadside 0.75), then it rises with the sword, so the flat family stops falling behind (L35 +40-60%).
Unchanged (already swordDmg x k x amul): every other linear skill (skewer, javelin, spearDance, bzSpin, bzCleave, bloodworms, rgHeart ...). Not touched: blood pool (blood-kit data), smite/consecrate (holy-ground data), dash strike (Q5, separate lane).

**PYRO EXCLUDED (claude/pyrokit). TODO after it merges**, convert to swordDmg x k: meteor (FLAT 20+0.15 heat; brief k 0.9), flashover (34 burning / 8 else; brief 1.1), flameRing 12, vent 10+0.5 heat, wisp 8, fireWall 10/tick, firestorm 6, ember / jet / burn (heatDmg), PYRE 42, and the new held fireball + Conflagration (must be swordDmg x k). Listed in src/skill-k.js PYRO_TODO and asserted by tools/lategame.mjs.

## 4. Boss rates that may move (no boss number was touched)
- L35+ bosses (Act IV-V, campaign L40-50): hit taper (-5%), hp taper (-9% at L35 to -18% at L50), flask cap (binds at 375+ max hp: heal -6..-25% on big-hp builds), full-tank chain takes 17% more. Expect a few points lower on late Act IV-V rows; most exposed are bosses tuned with big heroHp tables and tank builds.
- Whirlwind / Rain / Storm / Volley / Realm trims: bot-slotted knight (swordOfRealm, whirlwind), warden (rainOfSpears), ranger (rgVolley), berserker (bzStorm) lose 30-40% of that burst, so their late rows drop.
- Paladin (lightLance, hammerLeap, holyCharge) and Freebooter / Reaper flat skills RISE 40-60% from L35: the Paladin's handicapped rows (Admiral 1.45 in / 0.42 out, Tollmaster 1.3) may creep up; re-read those tables.
- Pyro is changed here only by the taper and the caps.

## 5. Tests run
- `node tools/lategame.mjs` (NEW, static): PASS.
- `node tools/progression.mjs`, `tools/survival.mjs`, `tools/leveling.mjs`: PASS (L24 even spread still +112 hp / +144 st / +16 dmg).
- `node --check` on main.js, progression.js, survival.js, skill-k.js, berserker.js, ranger.js: ok.
- Browser (7.6 GB free, one headless Chrome run by boss-rates, exited by itself): `PORT=8651 node tools/boss-rates.mjs welltown --ways=built --heroes=knight,paladin --built-seeds=2 --jobs=1 --secs=150` -> 4/4 won, skills cast (swordOfRealm, lightLance), no page errors. Smoke only; n=2 is NOT a rate. Log: scratch/lategamea-bossrates.log.
- NOT run: tools/check.mjs (full suite, per instructions), tools/flasks2.mjs (own browser; its asserts are healPct, unchanged).

## 6. Browser runs still needed
1. Level walker (tools/curve walker, docs/walk-curve) L25-L50 for knight and warden: arrival/deaths targets (A3 55%, A4 50%, A5 45%) should move the right way.
2. boss-rates built way, 6 seeds, base 416af6c2 vs this branch: welltown, church, burning, theatre, underwell, skyroad, towpath for knight, warden, ranger, berserker, paladin, pirate; plus Admiral and Tollmaster rows for paladin.
3. tools/skill-balance-probe.mjs at L16 / L35 / L50 to confirm section 3 against real foes.
4. tools/fodder-tuning.mjs knight L35 with whirlwind: one cast should no longer clear a pack.

## 7. Risks
- Whirlwind at L35 is still 83 vs a brute's ~97 hp (85%): the brief's own k (0.7) does not meet its "one cast <= 60% of a brute" aim (needs ~0.5). I kept the brief's k.
- Flat skills run -5..-10% at L16 and a little lower at L8-L12 (sword hit is lower early).
- Existing high-level saves lose up to ~66 hp and ~5 dmg at L50 at once (no respec offered).
- The soft floor raises the 5-layer tank's incoming by 17%; other builds barely notice.

## QUESTIONS FOR DANIEL (recommended answer first)
1. Q2 "every other card a hero-technique choice": build it in the Q6 technique lane (rec: yes, order pyro > pirate > paladin > geomancer > reaper) or let the milestone perks be enough?
2. IRON CHARM -20% -> -10% (brief Q3A) was NOT applied (the task listed only floor + flask cap, and the floor already blunts the stacked charm). Rec: leave at -20%. Apply it too?
3. Whirlwind k 0.7 (brief) vs 0.5 (meets the 60%-of-brute cap). Rec: keep 0.7 and judge from the skill-balance-probe run.
4. Offer a free respec for L25+ saves to soften the retroactive HP loss? Rec: no (levels 1-24 are untouched, loss is small).
5. Order of the remaining lanes: Q5 dodges/dash strike next, then Q1 foe threat. Confirm.


## BROWSER RUNS (10-31 evening)
Tune/verify lane (sonnet). Base = 416af6c2 (temporary detached worktree bracken-lgabase, removed) vs claude/lategamea. One headless Chrome at a time, ports 8170/8171, no suite. Raw logs: work/tmp-lategamea/ (uncommitted).
**Two changes came out of it (commit 70d12279):** `CARD_FULL` 12 -> 16 (the taper starts after 16 picks in a stat, not 12) and WHIRLWIND k 0.7 -> 0.5. Details below.

### 1. skill-balance-probe (tools/skill-balance-probe.mjs now reads SKILL_LEVEL; the probe hero is the even card, so absolute numbers are lower than a typical build - read the ratios)
Damage of one cast into 3 sprigs, base -> branch (k as first approved, before the whirlwind change):
| skill | L16 | L35 | L50 |
|---|---|---|---|
| whirlwind (knight, cd 4 -> 5) | 31 -> 22 | 47 -> 31 | 59 -> 36 |
| swordOfRealm | 99 -> 72 | 153 -> 105 | 192 -> 123 |
| rainOfSpears | 93 -> 63 | 150 -> 99 | 192 -> 120 |
| bzStorm | 150 -> 105 | 240 -> 165 | 300 -> 195 |
| rgVolley | 58 -> 42 | 88 -> 60 | 110 -> 70 |
| lightLance | 39 -> 27 | 41 -> 41 | 41 -> 48 |
| hammerLeap | 92 -> 80 | 95 -> 95 | 95 -> 102 |
| holyCharge / dawnburst | 42 -> 33 | 42 -> 48 | 42 -> 57 |
| broadside | 75 -> 45 | 78 -> 75 | 78 -> 93 |
| boarding | 57 -> 39 | 60 -> 66 | 60 -> 81 |
| keelhaul / heavySeas | 42 -> 27 | 42 -> 45 | 42 -> 54 |
| harvestMoon / soulReap | 50 -> 42 / 63 -> 54 | 52 -> 54 / 66 -> 72 | 52 -> 62 / 66 -> 81 |

Untouched skills move only with the sword (-1..-10% at L35, -5..-12% at L50): skewer, javelin, spearDance, cleave, boulder, rgRain, rgHeart and so on. Pyro rows are identical (excluded).
Reading: the converted flat skills are -20..-40% at L16 on the even-card probe hero (the earlier "within 10%" holds for the typical card, not the even one), equal at L35 and +15..+35% at L50. I left the flat k values alone: they climb the right way and the Paladin rows below did not creep up.

**Whirlwind vs a brute (the 60% aim), a real cast on act-scaled brutes (hp 97 at welltown), L35 typical knight, both cuts landing on one foe:**
| k | L35 brute hp lost per cast | L50 | fodder at L35 (cutlass / shield / crab) |
|---|---|---|---|
| base 1.1 | 100% (dead) | dead | 78 / 100 / 100 |
| 0.7 (brief) | 89% | n/a | 49 / 74 / 67 |
| 0.5 (kept) | 64% | 74% | 35 / 53 / 48 |

k 0.7 fails the brief's own "<= 60% of a brute" aim (needs ~0.45-0.5), so it is now 0.5 (src/skill-k.js, comment updated; tools/lategame.mjs passes). A 5 s, 27 stamina cast still clears sprigs and wounds a pack but no longer one-casts it.
Other linear AoE against one brute at L35 (branch): rainOfSpears 57% (base 84%), swordOfRealm 75% (base 100%), bzStorm 100% and rgVolley 100% (both also 100% on base; storm is an 18 s / 40 st ultimate, volley fires 3 arrows at point blank, 3 s / 20 st). Left at the approved k; see question 2.

### 2. Level walker (tools/level-walk.mjs, knight + warden, 2 seeds, harbor / church / welltown / underwell at their campaign level)
Mean shrine arrival % and deaths a first run, base -> branch:
| level (L) | knight arrive | warden arrive | knight deaths | warden deaths |
|---|---|---|---|---|
| harbor (30) | 97 -> 97 | 67 -> 71 | 0.0 -> 0.0 | 0.0 -> 0.0 |
| church (31) | 65 -> 59 | 23 -> 46 (warden ran out of frames on both; 26-62% walked) | 0.0 -> 0.0 | 0.5 -> 1.0 |
| welltown (41) | none (2% measured, stuck) | none | 0.5 -> 0.0 | 3.0 -> 2.0 |
| underwell (42) | 86 -> 80 | 93 -> 68 | 0.0 -> 0.0 | 0.0 -> 0.0 |

Direction is right where it could be measured (underwell and church arrive lower, knight hp -8%), but it is a small signal: n=2, most sections STUCK (welltown / underwell only 2-15% measured). It does NOT move any level toward the A3 55 / A4 50 / A5 45% targets on its own. The stat taper was never the lever for that (brief: hit frequency / mixed packs is a separate lane).

### 3. boss-rates, Act IV-V rows, six heroes (knight, warden, ranger, berserker, paladin, pirate; pyro excluded), --ways=practiced --profile=human, flasks kit, 4 seeds (192 fights a side)
"branch@12" is the lane as first built; "branch@16" is the final (CARD_FULL 16). Overall win %:
| row (L) | base | branch@12 | branch@16 (final) |
|---|---|---|---|
| church (31) | 71% | 71% | 71% |
| theatre (33) | 4% | 0% | 0% (out of band on base too) |
| fallingtower (39) | 33% | 21% | 25% (base already LOW) |
| caravan (40) | 50% | 50% | 54% |
| welltown (41) | 100% | 96% | 100% (HIGH on base too) |
| underwell (42) | 36/48 = 75% (8 seeds) | 28/48 = 58% (8 seeds) | 16/24 = 67% (4 seeds) |
| buriedcity (46) | 34/48 = 71% (8 seeds) | 20/48 = 42% (8 seeds, LOW) | 28/47 = 60% (8 seeds) |
| sealedpyramid (47) | 8% | 13% | 8% (LOW on base too) |

The one row this branch pushed out of 50-80% was BURIED CITY (71 -> 42%: warden, ranger, pirate fell; the even card at L46 lost ~34 hp and ~5 dmg). Tuned with the taper knob, not the boss: CARD_FULL 16 (full value for the first 16 picks in a stat), re-measured at 8 seeds: 60%. Underwell (75 -> 58) came back to 67%.
Rows already outside 50-80% on base (theatre, fallingtower, welltown, sealedpyramid) are not this branch's; they are listed so nobody blames the lane. The pirate is weak on base too (0-2 of 4 on most rows).
With CARD_FULL 16 the typical knight at L50 loses 50 hp (376 -> 326, -13%) instead of 66 (-18%). Measured knight max hp at L35, welltown kit: base 323, branch@12 296, branch@16 312.
Built way (typical build + skills; the flat-skill risk), paladin + pirate, 4 seeds, flotilla (Admiral, L24) and lamplit (Tollmaster, L26), base -> branch: flotilla 50% -> 50%, lamplit 100% -> 88%. No creep up.

### 4. Fodder
tools/fodder-tuning.mjs is hard-wired to L0 heroes in wood / spire / waymeet and only swings; it does not cast skills, so it cannot answer the question. Replaced by a real-cast probe (work/tmp-lategamea/fodder-ww2.mjs, knight L35 typical build, welltown foes, 1 and 3 foes): see the whirlwind table. Base one-casts a brute / shield / crab / sprig / scout; branch (k 0.5) leaves a brute at 64%, a shield at 53%, a crab at 48%, a cutlass at 35%; only the sprig dies.

### Checks
node tools/lategame.mjs (updated for 16 picks, knight L50 326), progression.mjs, survival.mjs, leveling.mjs: PASS. node --check main.js / progression.js / skill-k.js: ok. No browser errors in any run. Not run: tools/check.mjs. One probe page crash (base L50, targetCrashed) was rerun clean.

### READY for integ: YES, with the two tunings above.
Soft spots: bare-card Warden / Ranger / Pirate on Buried City are the most exposed row (60% at n=47); sealedpyramid / theatre / fallingtower stay LOW exactly as on base.

### Questions for Daniel (recommended answer first)
1. Whirlwind k: keep 0.5 (64% of an L35 brute). Rec yes. Alternative: the brief's 0.7 (89%).
2. Ranger VOLLEY (100% of a brute at point blank, free, 3 s) and AXE STORM (100%, 18 s ultimate) still one-cast a brute at L35 after the approved trims. Rec: leave Storm (ultimate); trim Volley k 0.7 -> 0.5 if the Ranger still reads too strong in the next pass. Apply now?
3. CARD_FULL 16 instead of the approved 12 (the bare-card Buried City row needed it). Rec: keep 16. At 12 Buried City drops to ~42% and would need a boss-side or hp nudge.
4. The walker cannot judge L25+ pacing here (stuck sections on welltown / underwell, church warden out of frames). Rec: no action from this lane; the pacing lever is the hit-frequency / mixed-pack lane (brief Q1A).
5. Flat converted skills are -20..-40% at L16 on an even card (equal at L35, up to +35% at L50). Rec: leave; raise K_FLAT ~15% only if players say the Paladin / Freebooter unlocks feel weak.
