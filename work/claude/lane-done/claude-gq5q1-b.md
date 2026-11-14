# GQ5Q1B - THE THRONE FIRE rework, built flag OFF (laptop 11-12 20:05)
Branch claude/gq5q1-b @ 77f112732 (off origin/claude/gq5q1-d 4629c9358). GQ5Q1_SHIPS stays false. Worktree LANES\bracken-gq5q1b. No browser, no win-rate tables run.

## Changes (all flag ON only)
| # | change | where | number |
|---|---|---|---|
| 1 | per-burn cap | src/gq5q1.js burnTicks (Q5N.fire.capPct) | 0.20 of maxHp; F.lost Map per seat from P1.hp before/after gqRed; ticks skipped once lost >= cap. Unanswered burn on a 208 bar = 51 (25%), was 102 (49%) |
| 2 | longer tell | Q5N.fire.tell | 2.5 -> 3.0 (grille glow steps 1.0 s each; measured 0.02/1.02/2.02) |
| 3 | ring early covered | assert only | tell+burn 6.0 < warn 6.5 < hold 7.0, no number change |
| 4 | cadence | Q5N.fire.every | 20 -> 26 (first stays 15) |
| 5 | jump-shot scorches | E.onHurt: E.hoistOf -> E.overHoist | a shot/blow from a jump above a deck counts as "on a hoist" |
| 6 | pyro skew | Q5N.pyroMul 1.5; src/main.js damagePlayer0 | DUEL_HERO.gqueen.pyro 2.2 -> 1.5 only when GQ5Q1_ON; source row still 2.2; THRONE FIRE exemption kept |
| 7 | boss bot | E.labDuty(P0,e,b,M,hid) in gq5q1.js; labDuty(P0,hid) in gqueen-hands.js; lab.js passes h | a) ranged (pyro/ranger) rings from <=140 px (ring-range, no walk; walks only into range); b) deck nearest the HERO, her spot's deck only if <=90 px farther (~1 s); c) ranged on a deck during the burn returns swing:true facing her (shoot); melee plunges only if within 120 px of her, else waits on the deck; d) decks already up -> straight to nearest deck, no bell |
Kept: resist floor, 12% scorch cap, 3 s ward, hallHp 2400, THRONE FIRE exemption, no new flag, every tell >= 0.3 s.

## Proofs (node only)
- tools/gq5q1.mjs ON: green (G R H F C S B L D X). New sections C (CAP all 9 heroes + deck 0 + 208-bar = 51; EVEN raw tick identical x9 + main.js exemption check; TELLS; COVER) and B (RANGED, BOT x6, PYRO SKEW). F section updated for cap/tell/every (harness got maxHp/mul opts). X soak 600 s x3 seeds: no soft-lock (15/15/14 fires).
- tools/gq5q1.mjs OFF: green. gqueen3, gq4q, gq5fix: green (flag OFF).
## Not built / caveats
- EVEN "fold tickdial in": tickdial needs a page (browser), so node asserts the raw tick is equal across heroes + that main.js exempts THE THRONE FIRE; the live dial (tools/gq5q1-tickdial.mjs) was NOT run - desktop can.
- Plan item 5 check: hurtEnemy0 (main.js ~9570) calls q5Scorch(e, plunge) with no shooter, so onHurt uses ctx.P() = the current player P. Right for solo and for the bot; in co-op a seat-2 shot is judged on seat 1's position. Not changed (no co-op in the tune); noted.
- Ranged shot-range (140 px) and the 90 px deck-tolerance are bot constants in gq5q1.js (RANGED/SHOT/WALKPX), unmeasured in a page.

## Desktop tune (crown, human profile WITH flasks, --jobs=1; edit values in src/gq5q1.js Q5N; flag via env)
Baseline n=6 (expect 40-60%; read fire share of taken + scorches/fight per hero first):
`BRACKEN_GQ5Q1=1 node tools/boss-rates.mjs crown --ways=practiced --seeds=6 --heroes=knight,warden,pyro --profile=human --jobs=1 --out=work/claude/tune/gq5q1b-n6-base.json --resume`
(add the other 6 heroes for the n=36 table: --heroes=<all 9> --seeds=4, or repeat per hero).
Knob order, one at a time, n=6 per hero after each, then n=36:
0. as built. 1. fire.capPct 0.20 (LOW->0.15, HIGH->0.25). 2. fire.every 26 (LOW->30, HIGH->22). 3. scorch.cap 0.12 (LOW->0.15). 4. hallHp 2400 (LOW->2150) only if 1-3 leave it within 10 pts.
n=36: `... --seeds=12 --heroes=knight,warden,pyro ...` (= 36). STOP when n=36 in 60-70% and every hero >= 4/12 -> ship-ready. If pyro < 3/12 while kn/wa in band: pull a fight's scorch count (bot gap) before any pyro-only number. Also run `BRACKEN_GQ5Q1=1 node tools/gq5q1-tickdial.mjs` once (even dial).
