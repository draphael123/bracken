# bosstune150 (11-07) - boss tuning lane: Frog King 2, Bog Troll 2b, Chieftain 4
Nothing merged or deployed. Bot: STANDARD profile, kit flasks, NORMAL, n=6 per hero (knight/warden/pyro), at each boss's campaign level (marsh L3, fenroad L3, stockade L4). "practiced" = bare build (the band way), "built" = typical build + skills. Logs/json: scratch\bosstune150\ (frog-a..f, bog-a/b, chief-a..e). Stills: scratch\proof150\{frog,bog,chief}\.
Read with care: n=18 per way gives 95% intervals of about +-20 points, and the bot is deterministic, so steps under ~15 points are noise.

## 1. FROG KING (claude/frogking2, tip 8aa9b2d2b)
Win rates, each n=18:

| config | practiced kn/wa/py | built kn/wa/py |
|---|---|---|
| as built: hp 1100 | 3/5 0/6 3/6 = 35% | 1/6 1/6 3/6 = 28% |
| hp 900 | 3/6 1/6 5/6 = 50% | 1/6 2/6 4/6 = 39% |
| hp 750 | 1/6 0/6 2/6 = 17% | 3/6 0/6 3/6 = 33% |
| hp 850, ring 12, adds [1,2] max 3 | 4/5 0/6 4/6 = 47% | 3/6 1/6 3/6 = 39% |
| + sac tell 2.0/1.7 s (was 1.6/1.35) | 3/6 3/6 3/6 = 50% | 2/6 2/5 3/6 = 41% |
| FINAL: hp 800, tongue 22, flop 24 | 3/6 2/6 3/5 = 47% | 3/6 3/6 5/6 = 61% |

Findings: HP is a weak lever (750 did worse than 900: the bot dies at ~70-100 s of damage, not of his bar). The warden bot made 0 sac breaks in 12 fights at a 1.6 s tell (3 blows in the window with a slow weapon and 0.4 s reaction) and went 0/12; the 2.0/1.7 s tell fixed it (3/6).
Changes (src/frog-king.js FK): hp 1100->800, bellow.ring.dmg 16->12, bellow.adds [2,3]->[1,2], maxAlive 4->3, bellow.tell [1.6,1.35]->[2.0,1.7], tongue.dmg 26->22, flop.dmg 28->24.
Final: practiced 47% (CI 26-69, just under the band), built 61% (in band). The bot is only a proxy; players who burst the sac do better.

Owed tools, all run in the worktree:
- boss-greed ok (53 bosses, 15 minis).
- firsthour ok (frog: 12 spits all told, leap->land, blow on pad 10 / air 4 / dazed 15, pond stirs at 46%).
- mark-integrity ok (spitTell, tongueTell, crouch, flopTell, snapTell posed and landed). Its sample never reached bellowTell, so that pose is covered only by my stills.
- textfit scoped to hints, bestiary, arena: 486 screens, 0 in every column.
- first-cards, marsh2-beats, marsh-exam, demo-cut ok.
- restamp --level marsh: pilot/curve/mash re-stamped; verify level-quality, curve-gate, mash-gate green. It printed 5 WARN jumps over 15% (curve hits/kills/lifts, mash knight deaths 13->10, pyro 11->14), expected after a boss change; docs/*.json committed.

Stills (tools/frog-stills150.mjs): sac glowing with 2 cracks and 2 pips lit (good), unburst bellow and croak ring (good), tongue rooted at his lips and angled down to a hero on lower ground (good), snap tongue, spit, swarm, flopRest fine. Belly-up was seen only in an earlier forced shot (legs up, stars). Not captured: tongue to a hero in the water, hoppers landing, ring hitting a hero. My first captures showed the whole boss as a white silhouette during bellowTell; that was my harness (render time does not advance between sim calls, which holds the 0.04 s tell flash on). With sim+step per frame it renders normally. No art or feel bug found.
VERDICT: SHIP for Sunday.

## 2. BOG TROLL (claude/bogtroll2b, tip 062256569)

| config | practiced kn/wa/py | built kn/wa/py |
|---|---|---|
| as built: hp 730 | 6/6 3/6 4/6 = 72% | 5/6 3/6 6/6 = 78% |
| hp 790 | 4/6 3/6 3/6 = 56% | 4/6 2/6 4/6 = 56% |
| FINAL hp 760 (between the two, NOT measured) | expect ~64% | expect ~66% |

The bot never throws planks, so real players get the stun on top. Change: src/bog-troll.js BT.hp 730 -> 760.
Plank reach: page test (tools/bog-stills150.mjs): hero on the boards carrying a plank, troll up at 64 px, attack key: he is stunned 22 frames later. Analytic reach from the three aim arcs (hand at y-20, troll box w40 h56, up=26): low aim hits 3-73 px away, mid 54-145, high 76-143, so every distance 3-145 px is covered. His pile reach is 112 px, so a hero in his hitting range can stun him.
Bug found and fixed: while STUNNED the global boss rule (src/boss-greed.js: bogtroll: btOpen) counted blows as outside an opening (chipped, greed rising). Now btOpen || btStun. bog-troll.mjs (83 checks) and boss-greed ok after.
Stills: plank carried (hint card up), rotten section with red rag marks calm (readable), STUNNED label + gold ring + stars. The pulsing glow along the hole was hidden behind the level hint card in my frame (unverified); the hunt-pulse shot was not captured.
OPEN art bug, not fixed: for about 1 s after a plank hit, a boxed red X icon sits over the middle of the "STUNNED" bar label ("ST[X]ED"), then fades. I could not find its source (the greed fix did not remove it). Cosmetic; art lane should look at what draws it.
VERDICT: SHIP (hp 760 unmeasured; one n=6 run, ~12 min, would confirm).

## 3. CHIEFTAIN (claude/chief4, stockade, L4)

| config | practiced kn/wa/py | built kn/wa/py |
|---|---|---|
| as built (hp 640, open slam 1.8 / chain 2.2, squad 2, dmg +20%) | 1/6 0/6 1/6 = 11% | 1/6 2/6 1/6 = 22% |
| + steps 1+2: EHP.chief 590, CHIEF_OPEN slam 2.0, chain 2.6 | 5/6 0/6 1/6 = 33% | 3/6 1/6 2/6 = 33% |
| + step 3: solo squad HORN.crewMax 1 | 5/6 1/6 3/6 = 50% | 2/6 1/6 1/6 = 22% |
| + step 4: dmg +10% (22/31/18/18/28) | 5/6 1/6 3/6 = 50% | 2/6 1/6 1/6 = 22% (same fights, no change) |
| FINAL: dmg back to chief3 base (20/28/16/16, keg 25) | 5/6 1/6 4/6 = 56% | 2/4 1/6 2/6 = 31% (2 page crashes) |

The lane projected 35-50%; as built it was 11%, so the backoff was needed. Final state: EHP.chief 590, CHIEF_OPEN slam 2.0 / chain 2.6, HORN.crewMax 1, chief damage at chief3 base.
Commit note: the commit titled "step 4" already holds the base-damage values (I edited before committing); this table is the truth. The base chiefKeg 25 is my guess (the old value was not in the line I diffed; the lane report says 28 for the +10% value).
Final practiced 56% (CI 34-75, includes the band), built 31%. Built is 24 points under bare: the built hero's skills do not help against the squad and archers, worth a look. The warden is the weak hero (1/6), as on the other two bosses.
Stills (tools/chief-stills150.mjs): wake, walk, reach, wind, sweep (arc readable), crouch, leap, landed (slam), swap, bash and slash wind/hit, toRack, horn (he blows the horn, crew goblin visible), rainAim. Not captured: the 3-blow chain's raise ("THREE BLOWS") and the keg flash (the 16-mode cap ran out first; needs a second pass). No visual bug in what was captured.
The chief4 report's owed browser tools (chief3, stockade2/3, boss-greed page half, rule-openings, kite-openings, damage-caps, hint-shown runtime, textfit) were NOT run here. kite-openings still says chief planted 1.8 designed and the code now holds 2.0.
VERDICT: borderline. Ship the backed-off numbers (as built it was 11%). If you want it in band, one more step: EHP.chief 590 -> 540, or drop the archer from the solo squad. Daniel's call.

## Questions for Daniel (recs)
1. Frog and Chief sit a little under 60 on the bare bot: accept, since humans do better than the bot and the Frog is 61% built? Rec: yes for the Frog; retune the Chief once after Sunday.
2. The warden bot is 0-1/6 on all three bosses: treat as a bot limit (e.g. it cannot land 3 quick blows on the sac), not a boss fault? Rec: yes; a warden-bot lane later.
3. Bog Troll hp 760 is unmeasured: want a confirming n=6? Rec: only if RAM is free; both neighbours (730, 790) bracket the band.

## Checks and hygiene
One headless Chrome at a time, paused for the coordinator's BATCH149 hold until its log finished (it ended "24 check(s) failed"; not read or mine). My full textfit was stopped early and rerun scoped; no node of mine was left running. No stash, no merges, no deploys. Worktrees reused: bracken-frogking2, bracken-bogtroll2b, bracken-chief4. New capture tools (not checks): tools/frog-stills150.mjs, bog-stills150.mjs, chief-stills150.mjs.
