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
