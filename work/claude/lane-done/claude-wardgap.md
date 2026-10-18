# claude/wardgap (sonnet, 10-18): the Captain's front-guard fix, applied to THE LANCE and THE WAYMEET PALADIN
Base e0436ee8. Changed: src/main.js (wallOpen, wallDuel, 3 lines of guard, DUEL_HERO, 2 hp rows), tools/blow-tags.mjs (assertions).
Quartermaster skipped (benched).

## GAPS (all three confirmed, both bosses)
1. Poise break / riposte window skipped the wall: wallOpen = GB.openOf (true whenever e.broken or e.rpOpenT). Now the Lance opens only on lanceOpen(e), the Paladin only on his ward down / cutRec / thrustRec / grabMiss / brandRec.
2. Untagged hero skills (pyro trail/flashover/firestorm, holy ground) skipped it: now 0.4 into the front at his height (HERO_HAND, !blow, !tag), round or over whole.
3. Burn ticks skipped it: now 0.4 outside own openings (wardedDamage). Floor is exactly ANGLE.front 0.4 (B15).
Probe: baseline 'storm' won 36/36 in 18-34 s (knight taking 30-46 a fight) before any tuning; the guard fix alone moved little (bots go round/over, which lands whole by design) - the HP and per-hero lever did the rest.

## TUNING (small, wall untouched)
- lance hp 800 -> 2400; closedhelm hp 2800 -> 3600.
- DUEL_HERO (as CAP_HERO): scales their blows on the hero. closedhelm knight 0.62 / warden 2.2 / pyro 1.7; lance knight 1 / warden 2.4 / pyro 2.6 (warden and pyro kite both and were hit for 0-30 a fight).

## RATES (campaign level, profile human, flasks, practiced, 12 seeds a hero; ERR rows = lab page init failures, excluded)
| boss | hero | before | after |
| Lance (storm L14) | knight | 10/10 | 9/12 |
| | warden | 12/12 | 7/12 |
| | pyro | 12/12 | 9/11 |
| | total | 34/34 100% | 25/35 71% |
| Paladin (waymeet L25) | knight | 5/12 | 8/12 |
| | warden | 12/12 | 11/12 |
| | pyro | 10/10 | 10/12 |
| | total | 27/34 79% | 29/36 81% |
Ranger/paladin not measured. Mash not re-measured (no time; guard only got tighter). Noise at n=12 is +-12 points. hp 4000 on the Paladin made the knight worse (4/12), so reverted to 3600.

## CHECKS (targeted)
Green: node --check, blow-tags (one source assertion updated, one added), boss-greed, boss-openings. Not run: boss-read, level-quality, mash, full suite, rule-openings (POISE red pre-existing on master).

## QUESTIONS FOR DANIEL (rec first)
1. Paladin sits at 81% (knight 8/12, warden 11/12). Rec: leave until the next boss-tune pass; more hp hurts the knight, the lever is his sword's hit on the knight/less on the kiters. Built: hp 3600 + DUEL_HERO.
2. Lance per-hero hit scales (warden 2.4, pyro 2.6) are big because kiters were barely touched; rec: keep as in the Captain's CAP_HERO; the cause (range) is who they are.
3. Mash 0/6 on both is unmeasured here; rec: next suite stamps it.
