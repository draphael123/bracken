# claude/gq3tune - GQ3 tune + art gaps (off claude/gq3art 29f44739c). NOT merged, NOT deployed.
Worktree bracken-gq3tune. Verdict: **NOT READY for batch156** (Queen below band, one bot/reach question open; Princess in band).

## Art fixed
- Queen tower-hop: two NEW frames (src/chars.js, 41 crouch at the portal lip, 42 spring with legs tucked, sceptre blazing); the tower hands now pose her towerWatch (stand) / towerCrouch (0.7 s before each hop) / towerHop (while her exit flash lives) instead of the stand frame. GQ_FRAME in main.js maps them. gqueen-art + gq3art-sheet lints now expect 43 frames.
- BURNING TOWER light: gq3_art.js drawTimberFloor 'burn' now throws banded firelight up the shaft and over the walls, a hot core on the boards and an ember glow below; 'smoke' now glows red-orange (the seam about to catch). Flames were always drawn; the old stills put the burning floor off-screen (a storey is 192 px, the view 180).
- In-play stills (new tools/gq3tune-shots.mjs, one page, zero page errors; H.test.start now also takes 'blink' | 'storm' | 'bays'): burning floor, hop crouch + spring, P2 blink tell / exit ring glowing / stumble, portal storm tell + rings firing + stumble-out, burning bays x2. Sheet: scratch/lane-reports/gq3tune-sheet.png (stills in gq3tune-stills/).

## Tune (built, flasks kit, L21, n=6 per run: knight/ranger/pyro x2 unless noted; 360-450 s clock)
Princess (crown:mini): before hp 1080: 3/6 (50%) -> after hp 1000: **4/6 (67%) n=6**. In band. gprincess.mjs updated (hp 1000).
Queen (crown) - changes made: hp2 1400 -> 1150, geode cd 9/7 -> 11/9, geode hit 18 -> 12 (shard 8 -> 6), P1 portal shard 10 -> 8, crown 16 -> 14, P1 portal cast cd 8/6 -> 10/8. Resist 0.5 and blink cd 5 untouched (resist floor holds).
| run | config | result |
| 1 | before (knight/ranger/pyro) | 3/6 = 50% |
| 2 | hp2 1150 + geode cd (same heroes) | 1/6 = 17% |
| 3 | + geode dmg (same, 450 s) | 1/6 = 17% |
| 4 | + shard/crown dmg (ranger/pyro/warden) | 2/6 = 33% |
| 5 | + portal cd 10/8 (same) | 1/6 = 17% |
Pooled n=30 over the five configs is noise-bound (95% intervals 3-56 each); the final config (run 5) measured 1/6 but it is the softest of all five, so the true rate is higher than 17%. NOT confirmed in 60-70.
Findings that matter more than the number:
1. **Melee heroes do 0 damage in P2.** Knight s1+s2 and warden s1: p2 203-319 s, bar 100%, roof.open [0 dmg]. A direct hit on her in a page probe lands (1147 -> 1097), so she is hittable; the bot never connects (reach onto the rings / parapets, or a blink gate). Ranger and pyro clear P2 in 50-260 s. Needs a bot/reach look before any P2 number is trusted (cannot be solved by numbers).
2. **The tower bot stalls 90 s every run** (esc 90s(stall) = the lab skips it): the measured fights lose 90 s of the clock, hence --secs=450.
3. Deaths are in P1 (hall): 8 of 11 losses, usually at 1-28% bar left: her bell-lure contact 'HER CHARGE' (47 a hit, 91-188 a run) and portal shards are the biggest takers. That is the OLD hall design (not touched: designs unchanged); the lever left is the lure's contact damage (GM.contact).
Timing: P1 40-115 s, tower 90 (stall)/target 50-70, P2 50-260 s.

## Checks (node, exit 0 unless noted)
gqueen3, gq2-lab, gq2mech, gprincess (after hp 1000 in its assert), queen-stair, gobgeo, gqueen-art (43 frames), gq3art-sheet, level-quality crown (clears), checkpoint-gaps, goblin-lint, dangling-paths, modulepreload, tells, hint-shown: all ok. textfit: browser sweep cut by the 590 s shell limit at levelcard 2/9 (every earlier scope clean, 0 overflow lines) - owed in full. mash/pilot rows: no geometry changed, stamps not touched (the boss mash rows gqueen/gprincess still owed; the damage/hp changes alter them).

## Owed / questions (rec first)
1. Look at why melee bots never hurt her in P2 (rec: lab trace of knight hero/queen positions in P2; maybe a blink-chase/reach fix) BEFORE re-tuning.
2. Then n=6 again after (1); if P1 still kills: soften GM.contact 47 -> 38 (rec).
3. Tower bot stall (90 s) in lab-gqueen: rec fix so row clocks are honest.
4. Remaining owed: full textfit, boss mash rows, camera 8.3 feel check (unchanged).

## GQ3FIX (claude/gq3tune, same worktree; NOT merged, NOT deployed)
Verdict: **READY for batch156** (Queen bracketed in band, Princess in band, mash rows restamped). Caveat: the Queen's final hp2 1775 itself has no direct n=6 run (bracketed, see below).

### Causes found + fixes
(a) MELEE 0 damage in P2 - three causes, all fixed in the GAME except the first:
 1. **The blink never fired at all**: src/gqueen-hands.js roofStep decremented lashCd/ambushCd/geyserCd/leapCd but NEVER R0.blinkCd (started 3, only the blink reset it). So P2 had no blink and no stumble opening in any run; melee heroes (the boss-greed rule makes them wait for openings) had nothing to hit but a rare crown stun. Fix: `R0.blinkCd -= dt`.
 2. **She stood where a blade cannot reach**: blink exits and the portal-storm exit (stormOpen 2 s x1.5) used the CUPOLA ring, feet y=224, 96 px over the deck and two climbs away. Fix: pickExit(..., level=true) - blink and storm exits come out of a ring on the hero's own level (deck rings for a deck hero, parapet rings for one up there); crown exits unchanged. Plus two MID-DECK rings (gq3-tower.js RINGS 'dm' x799, 'dn' x811, noStorm: blink exits only; the portal storm still lights the original five) - the two end rings were ~380 px from a hero mid-deck, so a 1.2 s opening was out of reach.
 3. **The hatch was a pit in the west deck** (cols 792-793): a hero chasing her to the west ring fell into the burning shaft and never came back into the fight (traced: knight y=528 for 190 s, bot has no climb-out in P2). Fix: sealHatch() shuts it (oak trap art, T.PLANK) when P2 begins, opens it again on a retry into the tower (toEscape); art draws the closed trap.
 Result: melee P2 now 47-113 s with 1100+ damage (knight 77 s / warden 184 s traced; boss-rates P2 26-113 s).
(b) **Tower 90 s stall = a BOT bug, not a game blocker** (the ladders work: probe tools/gq3fix-ladder.mjs climbs the hatch ladder onto the deck). Three bot faults in src/lab.js: gqEscapeBot's storey bounds flipped at each ladder TOP (dropped UP, hung on the rung); on the deck (y<=320) the bot had no storey (s=-1, no goal); and the generic "stand on the lower footing" rule (lab.js 'A SHELF IS SOMETHING YOU STAND ON') dragged him back to the hatch because her hidden body sits below. Fix: on-ladder branch holds UP to the top, deck = storey 5, and that rule is skipped in the escape stage. Tower now 18-39 s, no stall.
(c) **The 'lure' contact hit** is not the retired hall: it is the BELL LURE charge (GM.contact 14 -> 47 scaled), and it was untold in the body (she ran at 250 px/s in the stand pose with no windup). Made TOLD: GM.wind 0.6 s planted wind-up (her slam-tell pose 6, dust, grate-column glow) then a run cycle (GQ_FRAME.lure, was the stand pose); no contact in the wind-up. The bot now rolls through her as she comes (gqueenReact). gq2mech asserts the wind-up.
Also: tools/gq3fix-trace.mjs (0.5 s trace of one row; FASTP1=1 skips most of P1, DENSE=a,b), gq3fix-ladder.mjs, gq3fix-tiles.mjs.

### Win rates (WITH flasks, built, L21, knight/ranger/pyro, n=6 per line, 360 s clock, fresh seeds each line)
| config | wins |
| fixes + the earlier softening (hp2 1150) | 6/6 100% |
| fixes + plan numbers restored (hp2 1400, geode cd 9/7 dmg 18 shard 8, P1 portal shard 10 cd 8/6, crown 16) | 6/6 100% |
| hp2 1600 | 5/6 83% |
| hp2 1700 | 6/6 100% |
| hp2 1750 | 5/6 83% |
| hp2 1800 | 3/6 + 4/6 = 7/12 58% |
FINAL Queen: **all the earlier softening reverted to the plan numbers, hp2 1775** (P2 resist 0.5, blink cd 5 untouched: resist floor holds). Pooled 1750+1800 n=18 = 12/18 67%; pooled 1600-1800 n=30 = 23/30 77%. 1775 was not run itself (credit); next lane may add n=6 to confirm (rec: only if batch156 wants it).
**Princess (crown:mini, hp 1000): 4/6 = 67% n=6** (knight 1/2, ranger 1/2, pyro 2/2) - in band.

### Checks (all exit 0)
gqueen3 (+ a hatch-shut assertion, rings 7), gq2-lab (flaky once on a seat-two shard test with Math.random; 4 clean reruns), gq2mech (+ told wind-up assertion), gprincess, queen-stair, gobgeo, gqueen-art, gq3art-sheet, level-quality (all gated levels clear), checkpoint-gaps, goblin-lint, dangling-paths, modulepreload, tells, hint-shown. **textfit FULL run done** (12664 screens, 1377 s): OFFCENTRE 0 OVERFLOW 0; OFFSCREEN 4 / CLIPPED 2 / TRUNCATED 1 / COLLIDE 1 / OVERDRAWN 1 are all pre-existing and none touch the Queen/Princess (rookery boss names, fallingtower 'E', whatsnew scroll, a credits line) - log scratch/lane-reports/gq3tune-textfit.log. **Mash rows restamped** (docs/mash-bot.json crown BOSS + MINI, knight/warden/pyro x2): all 12 DEAD, boss left 78-97% (log gq3tune-mash.log).
Not run (per brief): tools/check.mjs, map-scale. Owed: a feel look at the Queen's lure wind-up pose (frame 6 reused) and the two mid-deck rings' art; art-before-live holds (no new frames, rings reuse the ring art).

### Questions for Daniel (rec first)
1. Queen at hp2 1775 (resist 0.5, plan P1 numbers): ship as is? REC yes; one n=6 confirm in the batch156 gate.
2. Keep the hatch sealed during the deck fight? REC yes (a retry into the tower reopens it).
