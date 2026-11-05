# BOSSCHECK (11-04): BUILT boss rates, every demo hero x every demo boss, n=6, flasks (kit), NORMAL, profile human
Branch claude/bosscheck off claude/batch143 (3bd984d6) + b38aa052 (botbuilt bot tools copied and 3-way merged onto batch143's lab.js/boss-run.mjs; botbuilt NOT merged). Measure + report only: no boss, hero or game file touched. Not merged, not deployed. No check.mjs.
Way = `built`: the hero's typical card (typicalCard) + TYPICAL_SKILLS for the slots the level has (1 slot under L30) cast by the lab skill hands, campaign level per boss, kit flasks. 330 fights (11 bosses x 5 heroes x 6) + 2 crash reruns + 12 probe fights. RAM was 5-8 GB free before every launch; one browser at a time.

## Table: wins / 6 (L = hero level at that boss)
| boss | L | knight | warden | geomancer | ranger | pyro | pooled |
|---|---|---|---|---|---|---|---|
| Lumber (wood) | 3 | 5 | 6 | 5 | 6 | 5 | 27/30 90% HIGH |
| Hornet Queen (hornetsnest) | 3 | 4 | 6 | 6 | 5 | 6 | 27/30 90% HIGH |
| Frog King (marsh) | 3 | 5 | 4 | 5 | 5 | 5 | 24/30 80% high |
| Bog Troll (fenroad) | 3 | 3 | 4 | 5 | 5 | 5 | 22/30 73% slightly high |
| Chieftain (stockade) | 4 | 4 | **2** | 6 | 5 | **2** | 19/30 63% IN BAND (but 2 heroes under 40%) |
| Spore Mother (spore) | 5 | 6 | 6 | 6 | 5 | 4 | 27/30 90% HIGH |
| Rootway boss | 6 | 6 | 5 | STUCK | 3 | 6 | 20/24 83% high (geomancer excluded, bot bug) |
| Underleaf boss | 7 | **2** | **1** | 3 | 5 | 6 | 17/30 57% LOW-ish, huge hero spread |
| Palisade Wood boss | 8 | 6 | 6 | 6 | 6 | 6 | 30/30 100% HIGH |
| King Gorm (kings) | 9 | 5 | **0** | 6 | 5 | 6 | 22/30 73% (warden 0/6) |
| Pyromancer (burning) | 5 | 6 | 6 | 6 | 3 | **2** | 23/30 77% high (pyro 2/6) |
| per hero | | 52/66 79% | 46/66 70% | 54/60 90% | 53/66 80% | 53/66 80% | |
Two page crashes (kings knight s1, burning pyro s3) were rerun alone: both wins, merged in above (not counted as losses).
PYRO FIRE LANCE: Fire Lance ('meteor') unlocks at L8, so pyro's built slot is Vent/Fire Wall at L3-7 (casts confirm) and Fire Lance from Palisade Wood (L8) and Gorm (L9). Palisade 6/6 (56 lances cast), Gorm 6/6 (66 lances). BK_KIT=meteor forced runs gave the same 6/6 and 6/6. So Fire Lance is NOT the problem; pyro's weak spots are the Fire Wall rows: Chieftain 2/6, Pyromancer 2/6, Spore Mother 4/6.
Bands: slice is pooled-read vs 60-70. Problem (outside 40-85) = a pooled rate outside 40-85 or a hero cell under 40%.

## Problems (outside 40-85) and off-band list, ranked worst first
1. Warden vs King Gorm 0/6 (hero cell far under 40; pooled 73% hides it). PROBE: same card with NO skill (BK_KIT=none) 4/6; bare practiced warden 6/6. So it is the javelin hand (37 casts/fight, 'skill' is the top verb) wrecking Gorm's rock/ring/rope choreography = botbuilt's H1 (skill hand not Gorm-aware). Probably a BOT artifact, not a Gorm tune problem. Do NOT retune Gorm for the warden before the hand yields to gormHands.
2. Palisade Wood boss 30/30 = 100% (every hero 6/6). Way over 70, the single clearest "too easy". Rootway 83% and the L3 trio below also high.
3. Underleaf boss: knight 2/6 (33), warden 1/6 (17) vs ranger 5/6, pyro 6/6. Pooled 57% is a LOW-IN-BAND average of two broken and two trivial heroes. Melee heroes under 40 = problem.
4. Chieftain (stockade): warden 2/6, pyro 2/6 (both 33, problem), knight 4/6, geo 6/6. Pooled 63 is in band only by averaging. Warden/pyro deaths are fast (55-85 s, boss left 2-47%): the horn/log-crush fight punishes the low-damage-per-opening kits; pyro fires only 14-29 Fire Walls.
5. Pyromancer (burning): pyro 2/6 (known), ranger 3/6; others 6/6. Pooled 77.
6. Pure too-easy (off band high, not problems): Lumber 90, Hornet Queen 90, Spore Mother 90, Frog King 80, Rootway 83, Bog Troll 73. The L3 early bosses at L3 with a built hero sit ~90% (a tutorial-grade wood/nest is arguably right for a demo opener; Daniel's call).
7. Bot bug (not a loss): geomancer on the Rootway boss never engages (taken 0, 91-94% boss left, timeout 240 s, casts {} on all 6 built AND 2 practiced). Same in the bare way, so it is the geomancer boss bot/pathing on Rootway, not the build. Geomancer Rootway rate UNKNOWN.
Not in this table: the Puppeteer knight 0/6 stopgap (not a slice boss); minis; first-attempt way; Hornet's Nest 2 (not in freeze).

## Suspected causes
- Skill hands cost the casting heroes at choreographed bosses (Gorm warden; probably the Underleaf warden/knight too: groundSlam 43 casts, setSpears 15-26, deaths with 14-52% boss left) - unproven there; the same 3-way probe (BK_KIT=none vs built vs practiced) is the cheap test.
- Early bosses at L3 are simply under-tuned vs a built hero with a flask kit (90%).
- Palisade Wood 100% looks like a boss tuned before flasks/level curve (L8 hero, 6/6 for all five).
- Chieftain: the kit-flask + crush fight is lethal to hero kits that cannot burst an opening (warden skewer 7-13 casts, pyro fireWall). Pyro has no L8 lance yet.

## Recommended tune per boss (REC first; one joint tune lane owns it)
- Gorm: first make the skill hand yield while gormHands has a goal (botbuilt Q2), re-measure warden; touch Gorm only if the warden is still under 50% with the hand fixed.
- Palisade Wood: raise ~30% (HP/aggression) toward 65%; start at +25% boss HP and one extra windup chain, re-measure n=12.
- Underleaf: leave pooled; look at why knight/warden die (read deaths on 3 seeds) before moving numbers; target a floor of 4/6 for every hero.
- Chieftain: keep pooled; give warden/pyro a fairer opening (longer crush stun or log-pile window) so no hero is under 4/6; check Fire Wall vs boss resist.
- Pyromancer: pyro 2/6 is the pyro duel against her own element: re-check fire-resist floor (>=0.4x) and ranger 3/6.
- Lumber / Hornet Queen / Spore Mother / Rootway / Frog King / Bog Troll: raise +10-20% boss HP each, or accept as the tutorial ramp for the demo (Q1).

## Questions for Daniel (rec first)
1. Are a ~90% Lumber, Hornet Queen and Spore Mother acceptable as the demo's on-ramp? REC: yes for Lumber + Hornet, bump Spore Mother and Rootway toward 75; keep the 60-70 target for Frog King onward.
2. Fix the warden skill-hand/Gorm clash in the bot before tuning Gorm? REC: yes (small lane, 6 fights proves it).
3. Fix the geomancer Rootway bot stall so its rate can be measured? REC: yes before the tune lane, otherwise the tune is blind on that cell.
4. Tune target by pooled rate only, or also a per-hero floor of 40%? REC: add the floor (the pooled average hid warden 0/6 Gorm and knight/warden Underleaf).
5. Measure bare/practiced alongside built for the tune lane? REC: yes on the 4 hero-floor offenders (Gorm, Underleaf, Chieftain, Pyromancer) only.
