# claude/dr3tune - THE FOREMAN + THE GREAT DRILL tune (Sonnet, 2026-10-11/12) - base claude/dr3art 19140de4

NUMBERS + timing/pressure only (src/foreman.js FOREMAN, src/great-drill.js DRILL; one parameter added to src/minecart-hands.js lob: a flight time `T` and an x offset `off`). Standard: boss-rates minecart / minecart:mini --profile=human --flasks=kit --ways=practiced (L13), k/w/p.

## THE GREAT DRILL (target 60-70%, 90-150 s) - IN BAND
Levers: blow damage ~2.1x (contact 30->64, rock 30->64, reverse 28->62, dynamite 24->56, lunge 26->60, collapse 28->62, ore 18->28, chain 10->20), gap [0.9,0.75,0.6] -> [0.3,0.22,0.15], oreEvery [8,7.5,7] -> [8.5,8,7.5], jamT 4.6 -> 4.2 (still >= 3 s), jamMul 2.0 -> 2.3, hp 2600 -> 2400. Tells, jamCap 0.15, armour 0.4 (B15), lever lead untouched.
| | knight | warden | pyro | all | fights |
|---|---|---|---|---|---|
| before (3 seeds) | 3/3 | 3/3 | 3/3 | 100% | 77-132 s |
| shipped (12 seeds) | 7/12 | 9/12 | 8/12 | **67%** | wins 92-160 s (pyro 120-160) |
Dry (human+dry, 6 seeds): 1/6, 0/6, 1/6 = 11%. Sensitivity is steep: blows x2.0 81%, x2.2 56%, x2.3 53% at the same jam; jamMul 2.0 -> 2.3 alone was +25 points (it also pulls the warden's fights under 90 s, so jamCap was left at 0.15).

## THE FOREMAN (cart mini, target 75-85%, 40-75 s) - NOT IN BAND: still 100% (12 seeds 12/12 x3), fights 36-66 s
What was moved (all kept inside tools/minecart.mjs's asserts: stompK >= 0.25, tells >= 0.4/0.6/0.8, ram sweep < homeR-100, ward >= 2.5): pick VOLLEY (1/2/3 extra picks a beat apart by stomps: picks [1,2,3], pick2 0.3), pick flight 1.0 -> 0.45 s (new FOREMAN.pickT, lob() takes the flight), pick 15->24, bump 10->14, ram 20->30, drift 72/96/120 -> 84/112/140, gap [2.0,1.7,1.4] -> [0.9,0.7,0.55], brace 3.0 -> 4.5 s, driftTell 0.55 -> 0.4, pickTell 0.75 -> 0.6, ramTell 0.95 -> 0.8.
WHY IT DOES NOT MOVE: (1) the bot's mark dodge is perfect against any pick, volley or not (a pick offset behind the mark made no difference to the bot but killed the level-1 pilot: 14 deaths, 523%); (2) the only damage that ever lands on the bot is his drift BUMP (when its 12% jump miss comes up) and the RAM; (3) the run is near deterministic (same seconds across seeds), so a number moves the whole row at once; (4) L13 knight has only 166 hp, but the same hits on the level-1 pilot are the curve row: to get the bot to 80% needed bump/ram/pick at ~2x (tried 38/44/22: bot 94%, pilot 424% / 11 deaths against band 250% / 3). The two rows pull against each other; the curve band is the act-1 band (40-250%, 0-3 deaths).
Shipped to keep the act-1 curve green: curve **211% / 3 deaths** (was 108% / 2; band 40-250 / 0-3: green, near the edge). Dry (6 seeds): 6/6 5/6 6/6 = 94%.

## Checks (PORT 8855)
tools/minecart.mjs 363 ok | boss-rates as above | re-stamped LEVEL then BOSS: docs/level1-curve.json (211%/3), docs/level1-pilot.json (220%/3 deaths), docs/mash-bot.json (drill 0/6, Foreman 0/6) | level-quality minecart CLEARS | minecart-route (knight base ride, 0 legs failed) | boss-openings, boss-read, tells, untold-told, boss-fight-end (61 fights) green | mark-integrity: the one known phantom (undeadmage|poisonTell).
Not run: minecart-aloft, corpses, mobile-perf, the full suite (shared PC).

## QUESTIONS FOR DANIEL (rec first)
1. Foreman at 100%. Rec: move the Deep Rails into ACTS[1] (act 2: src/foe-react.js; the road puts Ore Road -> Deep Rails -> Stormhold there anyway) so the curve row can take bump/ram/pick ~2x (the 94% config), then re-stamp. Alt: accept a 100% mini (it is a duel of jumps; mash 0/6). Alt 2: give the bot a bad-day knob - not a number.
2. Great Drill at 67% sits at the top of the band with the pyro's fights up to 160 s; rec: keep.

## ADDENDUM (Daniel approved the rec 10-12): THE DEEP RAILS FILED AS ACT 2
- src/foe-react.js ACTS[1] (THE CRAGS) now lists 'minecart' (damage tier 1.1 on common foes; minis/bosses unaffected). tools/rule-state.mjs actOf reads it, so the curve row uses the act-2 band (70-400%, 0-6 deaths).
- Foreman re-tuned: pick 28, bump 18, ram 38, picks [1,2,3], pickT 0.45, gaps 0.9/0.7/0.55. Curve (re-stamped level THEN boss): **act 2, 247%, 5 deaths** (band 70-400 / 0-6), pilot row 242%/4 deaths. level-quality minecart CLEARS; minecart 363; minecart-route 0 legs failed; mash drill 0/6, Foreman 0/6.
- Rates (12 seeds): Foreman **12/12 x3 = 100%** (still HIGH), Great Drill 7/12 9/12 8/12 = **67%** (in band, unchanged by the tier).
- Why the Foreman still will not drop: the bot is untouched by picks and takes only the drift bump / ram, so those numbers barely move it (bump 28 / ram 56: bot 97%, pilot 460% / 12 deaths; pick 44: bot 100%, pilot 519% / 13). The deaths in the pilot come from VOLLEY COUNT and pick damage, which the bot dodges perfectly; picks [2,3,4] alone put the pilot at 426% / 11 deaths, over even the act-2 band. Reaching 75-85% needs a mechanic (a pick the bot cannot brake from, or a hit on a missed boarding), not numbers. QUESTION: allow ONE mechanic change (rec: a missed boarding - landing on his cart rim while his spikes are up - costs the full bump and throws you back), or accept 100% for a duel-of-jumps mini?
