# claude/dr4tune - DEEP RAILS 4 finish checks + tune (sonnet, numbers only, 2026-10-12)
Base: origin/claude/deeprails4 5a083047. Port 8877. Boss rates: campaign L13, practiced, profile human (flasks: kit), jobs=1.

## RATES (12 seeds each, wins)
GREAT DRILL, flasks: knight 7/12 (58%), warden 9/12 (75%), pyro 9/12 (75%) = 25/36 = 69% (band 60-70) - AS BUILT, UNCHANGED. No hero at 0.
GREAT DRILL, dry (human+dry, 6 seeds): knight 3/6, warden 2/6, pyro 1/6 = 6/18 = 33% (for the record; the target is with flasks).
FOREMAN, flasks: before 9/12 = 75% (kn 7, wa 9, py 11; bottom of band; was 83% before DR4) -> after pickDmg 28->26: 29/36 = 81% (kn 11, wa 8, py 10), fights 36-77 s.
FOREMAN dry (6 seeds): 1/18 (6%) - for the record (flask-tuned mini; the dry gap is large).
Fights: Drill knight 136 s, warden 109 s, pyro 176 s avg (pyro wins 155-199 s; see bot stall below); Foreman 36-77 s.

## GEAR vs BODY
Per fight avg: ~670 damage on gears vs the body's 2400 hp (about 22% of the damage); but 32% of the hero's BLOWS go on gears (knight 26%, warden 44%, pyro 32%). The gate (half the banks) holds the body at each line: 1-6 gears broken a fight (5 typical = the 1+2+2 minimum).
Raising gear hp to push the damage split toward half (gearHp 150) made pyro timeout 4/12 and fights 213 s: not taken.

## NUMBERS CHANGED
src/foreman.js pickDmg 28 -> 26 (24 gave 92%: too far). Nothing else. Great Drill measured in band as built.
Tried and reverted (measured 12 seeds x 3 heroes each): hp 2400->2150 (25/36 = 69% but warden 12/12 knight 5/12, pyro still 174 s); hp 2150 + blow damage +10% (22/36, knight 4/12); gearHp 90 (23/36, knight 3/12); gearHp 105 (22/36); gearHp 150 + hp 2200 (19/36, pyro 4/12 with 4 timeouts); heldCap 0.2 (identical to baseline: the cap never binds).
Knight is the sensitive hero: it dies in phase 2 (lunge/dynamite/chain) with 2 gears broken; every faster-gears variant lowered it.

## BOT NOTE (not changed - bot is Opus's code)
Pyro timeouts (2/12 at 240 s, boss at 1 hp, final gate shut): the bot breaks one bank of P3's four then idles dodging; it does not finish the second (chain half-broken, lunge/roof untouched). A human would. If wanted: tune drillPlan's gear pick in a bot lane, or P3's need (gearsNeed 2 of 4 -> 1) - a gate-line decision for Daniel.

## CHECKS (PORT 8877)
STAMPED level then boss (tools/level1-pilot.mjs --write/--curve, tools/mash-bot.mjs --level minecart --write, minecart --write): pilot 239% / 4 deaths; ACT-2 CURVE row 243% / 4 deaths (band 70-400 / 0-6, IN BAND); mash: level every hero dies (knight 5, warden 5, pyro 4 deaths); boss: drill 0/6 dead 33.9 s; Foreman 0/6 dead 26-28 s.
GREEN: reach-heroes (7 known crossings, nothing new; all 8 heroes), minecart-aloft, boss-openings, untold-told (22 foes), corpses, boss-fight-end (61/61), tools/minecart.mjs 434 ok, mark-integrity (only the known undeadmage|poisonTell phantom), hint-shown (after a fix, below), drill-gears (measured above).
FIX: hint-shown was RED - 'BROKEN' sat in src/hint-lines.js AND in main.js MOVE_WORDS, and the gear number() line's ' BROKEN: ' literal was read as a silent literal. Removed 'BROKEN' from hint-lines; the line built in a variable before c.number (src/great-drill.js hitGear). Same text on screen (CALL_COUNTS regex still routes it). hint-shown OK incl. runtime.
RED, not mine: textfit hints,bestiary,boss --strict: COLLIDE 1 + OVERDRAWN 1 on "THE WEAVER" x "!!" in the HANGING mini boss fight (main.js:31543 draw). Nothing in deeprails4's diff touches the Weaver; pre-existing or from the base. Everything else 0 (2049 screens, 21391 strings; the new gear words fit).
Note: hint-shown ran for a minute alongside mark-integrity (two page tools at once, my slip; both passed/known).

## QUESTIONS FOR DANIEL
1. The Drill is in band (69%) but the bar is ~22% gears by damage (32% by blows), not "half". Rec: keep (more gear hp lengthens fights and lowers knight/pyro). Alt: lower P3's gate need to 1 of 4 and raise gear hp.
2. Dry Foreman 6% / dry Drill 33%: flasks carry both. Rec: keep (the target is with flasks).
