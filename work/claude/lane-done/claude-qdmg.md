# QDMG - Goblin Queen phase-1 damage analysis + prepared change set (11-13 11:35) - NOT MEASURED IN FIGHTS
Branch claude/gq5q1t @ c9304d05a (pushed; off 5a1278018). Code-only: no browser, no fight. Flag BRACKEN_GQ5Q1 only; flag OFF identical (proved).

## 1. Damage table (crown, human profile, WITH flasks, practiced; rows work/claude/tune/gq5q1t-*.json, hb = hurt-by hp per fight)
Best measured state = round 2 / k2 (cap .15, every 30; 3/6 1/6 2/6). % = share of damage taken per fight, all 6 fights per hero.
| source | knight (3/6, 353 hp/fight) | warden (1/6, 368) | pyro (2/6, 354) |
|---|---|---|---|
| THE THRONE FIRE | 27% | 30% | 35% |
| '?' (= the barracks SOLDIER's slash, see 2) | 22% | 35% | 1% |
| HIS REPRISAL (greed burst) | 0 | 0 | 20% |
| A PORTAL SHARD | 15% | 5% | 12% |
| HER CROWN | 10% | 13% | 6% |
| THE HEARTH JET | 10% | 8% | 9% |
| HER SCEPTRE / GEODE SHARD / ARROW / LASH / rocks | 11% | 9% | 18% |

Single-hit sizes in the rows: crown 52, jet 52 (26 half), sceptre 29, shard 25 (51 = 2), fire tick 17, soldier ~48 est. So the bar (208, +2 flasks = 332 hp) is ~6-7 hits of 50, or 20 fire ticks.
Hits per fight: fire 85-190 hp = 5-11 ticks (2.5-5.5 unanswered burns at the then 34 each); '?' 130-196 in the 4 losses it led = ~3-4 soldier slashes; crown ~1; jet ~1; shards 1-4.
Every one of the 12 k2 losses died in the HALL (Queen bar 5-90% left; taken 261-332 = the whole bar plus flasks) at 82-196 s. Every one of the 6 wins then won phase 2 (P2 is not the gate).
Killer by top source in the 12 losses: fire 7, '?' 4, fire/crown tie 1 (knight s4: fire 147 + crown 78). Pyro 4/4 fire-led (reprisal 61-81 in two). Base (n=6) fire led 14 of 15 losses (45-56% share).
Trend that matters: '?' per fight base 16 -> k1 47 -> k2 69 -> k3 54 as heroes survived longer in the hall (more waves reached); it is the next killer once fire is capped.

## 2. The UNATTRIBUTED source: the barracks SOLDIER's slash
- src/main.js:14280 (updateTroop, soldier slashTell -> slash): `damagePlayer(e.x, DMG.soldier)` with NO options object, so the hurt-by key (main.js:8374: o.name || o.blow || o.who.t) falls to '?'. Every named blow of hers goes through gqHit/gqRed (names at gqueen-hands.js:477/533/582/591/718/841/1054 + gq5q1.js:198) and the javelin arrow is 'THE ARROW' (blow set at main.js:12422), so '?' can only be an unnamed foe call. The hall's guards are exactly ['soldier'] then ['soldier','javelin'] (gqueen-hands.js:37, spawned at :892-893; P2 reinforcements :440-441).
- Why invisible: tools/boss-run.mjs reads window.__hurtBy, keyed only by name/blow/who.t. The existing HITLOG=1 list (main.js:8601) already carries `q.t mode` but nobody ran it.
- ADDED (lab/hitlog only, no gameplay): main.js:8374 the unnamed key is now "FOE <updFoe.t>" (e.g. "FOE soldier") instead of "?"; lab.js row gq.q5 = {fires, scorches, burnTicks} (fires - scorches ~ unanswered). Proved by source assert (gq5q1.mjs K) and node syntax/imports only, not in a page. The identification of '?' as the soldier is by elimination plus code reading, NOT yet seen in a log: the first n=6 shows "FOE soldier" or disproves it.

## 3. Boss or bot? (per top source: tell / ask / does src/lab.js do it)
| source | tell and ask | bot | verdict |
|---|---|---|---|
| soldier slash ('?') | '!' + 0.5 s slashTell (main.js:14283), blockable: parry = PARRIED + rocked open, or roll | NO hand at all: `grep soldier\|slashTell src/lab*.js` = 0 hits; the Queen hunt branch (lab.js:~2945) stands 80-170 px off with strike=false; humanGuard reads boss.mode only; threatOf is the duel/ally path | BOT. Every slash of a wave landed. |
| THE THRONE FIRE | 3.0 s tell, grille glow in 1.0 s steps, bell glows RING!; ask: ring the bell, stand on a deck (hoists up 0.6 s after the ring) | yes: gq5q1.js:246 labDuty via lab.js:2934 (ring -> deck -> plunge/shoot). Answer rate UNMEASURED | MIXED. Loss rows show 4-5.6 unanswered burns in <=111 s (more than the 15/45/75/105 s cadence: waves force a fire, gq5q1.js waveMayOpen), so the bot answered almost none of those; but a 34-hp (16%) burn whose answer needs ring+walk+jump inside 3.5 s is also heavy for a person. Both. |
| HER CROWN / PORTAL SHARD | told (crownTossTell / portalTell), parry or duck/roll | yes: lab.js:847 gqueenReact parryShot (parryTry 0.7, the rest ducked/rolled) | BOSS number (Q4N.p1.dmgK 0.65 is already a design dial). |
| THE HEARTH JET | 1.0 s hearthTell, jump on release | yes: lab.js:~838 hearthTell -> jump at modeT<0.12 (~1 hit/fight at 52) | roughly fine (~1 hit per ~8 jets). |
| HIS REPRISAL (pyro 20%) | told !! + red ring 0.6 s (boss-greed.js tell), unblockable, reach 60 px + half body | greed step-out exists in other branches (lab.js ~1467/1616) but NOT in the Queen hunt branch; the ranged duty `shoot` (gq5q1.js labDuty, swing:true on a deck for the whole burn) lands blows while she is not open | PROBABLY BOT (unproven). NOT touched: needs one pyro fight with HITLOG=1. Question 2. |
Verdict: about half the damage is bot (soldier 19% pooled + part of the fire + pyro reprisal), half is boss number (fire 3 ticks, hall blows at 0.65).

## 4. The change set (3 items, all flag-ON only, flag OFF identical) - commit c9304d05a
1. BOT FIX: lab.js:819 gqGuardBot (called from gqueenReact lab.js:861 only when gqHands().q5() is live): a soldier in slashTell within 60 px -> one try drawn per tell (LABP.parryTry, as for her shots) -> parryAt timing (shield raise in the last 0.06 s, ward/tap per hero); no try -> ONE roll in the last 0.2 s; a soldier resting / staggered / on cooldown in reach -> face and cut; never swings into a walking, un-telling shield. Does only what the tell asks a player. Expected: '?' 19% pooled -> ~5-8% (-11 to -14% of all damage; knight/warden -17 to -28%).
2. KNOB: Q5N.fire.capPct 0.15 -> 0.07 = an unanswered burn costs ONE tick (17 hp, 8% of 208) instead of two (34, 16%); holds for any bar up to ~242 hp (a tick is a fixed 17, not a % of the bar; asserted at 196/208/240). The fire stays told and answerable and the scorch (12% of her bar) stays the reward; ignoring ALL fires in a ~110 s hall costs ~85 hp (25%), not the 150+ the losses show. Expected: fire 30% pooled -> ~15% (-15% of all damage). Resist floor, tell (3.0 s) and cadence untouched.
3. KNOB: Q5N.hallDmgK 0.55 (new; gqueen-hands.js:92 uses it for the hall's gqHit blows - crown, portal shard, geode, charge, sceptre - instead of Q4N.p1.dmgK 0.65 when the flag is ON; roof untouched). Those five were ~28% pooled. Expected: -15% of 28% = -4% of all damage. Parry/stun logic untouched (damage only). Does NOT touch Daniel's 11-12 numbers (Queen shard 8% / daze after 4 / P2 bar 1000 are phase 2).
Stacked expectation: damage rate -28 to -33% against the ~30% cut the losses need (332 hp over ~110 s of hall = ~3 hp/s now). A prediction from the table, NOT a measurement; the earlier knobs also moved less than their arithmetic.
Instrumentation (not a knob): FOE-name key, row gq.q5.

## 5. Proofs (node only; node IS on PATH in the bash tool here, v24.19)
- BRACKEN_GQ5Q1=1 node tools/gq5q1.mjs: green, 115 ok lines, 0 FAIL (G R H F C S B L D X + new K). It was RED at the lane start: the CAP assert still said 51 (cap .20); now 17 / one tick, asserted on 196/208/240 bars. New K: hall lever (crown 100 -> 55 ON; roof 60 untouched), hurt-by key source assert, gqGuardBot x8 (try / no try / raise on the beat / one roll / cut a resting soldier / no swing into a walker / out of reach / javelin ignored; Math.random stubbed).
- node tools/gq5q1.mjs (flag OFF): green, 5 ok lines (new: the OFF hall lever is still Q4N.p1.dmgK 0.65 -> 65).
- tools/architecture.mjs green (77 levels), tools/comments.mjs green, gqueen3 / gq4q / gq5fix green (flag OFF). tools/check.mjs not run. The F-section 'every'/'first' timing asserts needed no edit (they read N.every / N.first).

## 6. Follow-up browser lane (desktop; one browser at a time, >=1500 MB free, memguard first)
n=6 per hero (18 fights, ~10 min). Read gq.q5 and the 'FOE soldier' share BEFORE the win rate:
```
cd "C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-gq5q1t"
BRACKEN_GQ5Q1=1 node tools/boss-rates.mjs crown --ways=practiced --seeds=6 --heroes=knight,warden,pyro --profile=human --jobs=1 --out=work/claude/tune/gq5q1t2-n6.json --resume
```
If pooled >= ~50%, then n=36 (fresh out file):
```
BRACKEN_GQ5Q1=1 node tools/boss-rates.mjs crown --ways=practiced --seeds=12 --heroes=knight,warden,pyro --profile=human --jobs=1 --out=work/claude/tune/gq5q1t2-n36.json --resume
```
Ship band: pooled 60-70%, every hero >= 4/12. Read-outs per fight: hb ("FOE soldier", "THE THRONE FIRE", "HIS REPRISAL"), gq.q5 {fires, scorches, burnTicks}. Table: `node ..\scratch\gq5q1t-sum.mjs <json>`.
Ladder if short (one at a time): (a) pyro reprisal: one pyro fight with HITLOG=1; if confirmed, make the Queen hunt branch use the greed step-out / stop shooting a non-open Queen; (b) hallDmgK 0.55 -> 0.45; (c) fire.every 30 -> 36. If '?' is NOT "FOE soldier" in the first rows, stop and read HITLOG.

## NOT verified
Nothing here is measured in fights: not the identity of '?' in a log, not the soldier hand in a page (the node test uses a fake BK; parryAt for the other 8 heroes, the roll direction and whether a cut at a parried soldier lands were not run), not the fire answer rate, not the win rate. The tickdial was not rerun (tick unchanged at 17; only the cap moved). Co-op, the other 6 heroes and P2 unrun. hallDmgK shares one gqHit lever with the hall geode / charge / reach (by design). Soldier-hand constants (60 px, 0.55 s cooldown, 0.2 s roll) are unmeasured bot constants.

## Questions (recommendation first)
1. Run the n=6 above? REC: yes, desktop, first thing after the gate.
2. Pyro reprisal: fix in the bot (stop shooting a non-open Queen) after one HITLOG fight? REC: yes, only if the n=6 still shows it at 15%+.
3. If still < 50% after the three: lower hallDmgK to 0.45 before touching fire cadence? REC: yes (told, parried blows; keeps the fire's rhythm).
