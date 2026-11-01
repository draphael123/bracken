# claude/geoid - GEOMANCER HERO IDENTITY (DEMO SCOPE)
Branch claude/geoid (off origin/master 0fe14c26 + claude/skillslots). Not merged, not deployed.

## Before / after kit
| | before | after |
|---|---|---|
| resource | TREMOR bar (blows/stones fill it) -> QUAKE on tap C | THE BOARD: the stones standing (hero meter = stones/cap, a third each). Bar gone (gainTremor is a no-op) |
| stone life | crumbles in 4 s (arch 6 s), cracks the last second | STANDS until broken / room exit. hp 3 (4 with BEDROCK). Cracks by hp (3 states). Cap 3 (4 with FOURTH STONE), oldest crumbles over cap, per-world in co-op (partner is a body for the no-trap rule) |
| foes vs stone | walls just timed out | a foe pressed on a stone for 1.1 s costs it 1 hp; a foe hitting it at >=140 px/s (any charger/boss, measured from x-travel, no per-foe table) breaks it outright and is OPENED UP (stun 0.8 s, told by words). Shatter by her own third jab only if it hit nothing else |
| spender | tap C at full TREMOR = QUAKE | UP+C with >=2 stones up = TOPPLE: every stone falls outward as a rolling boulder (1.1x, knock), 2.5 s cd. Hold C rune-ward unchanged |
| third jab | full spin, shatters stone | STONE FIST: forward only, 1.2x (was 1.5x), recovery +0.06 s; KNOCKS A NORMAL FOE UP (hang: follow-ups +33%, one lift per 2 s); boss/mini only reel 0.3 s |
| dash strike | 1.4x, rolling stone | 1.3x, rider = rolling stone (lane C). Dodge (burrow/shrug) unchanged per Q5 table |
| safety | - | no stone within the gate/door/plate/lever radius (freeCell asks blockedAt); grid always restored to its own grid on clear/level change/death; death clears |
| handicap rows | flotilla 0.85/1.15, CAP_HERO 0.6, bzchief hp 0.69 / dmg 0.8 | all 1.0 / 1.0 |
| text | quake/tremor/4 s | hero card (new topple + stone fist rows), pick card, hint line, desc, trial yard (new THIRD station, TOPPLE station), passives BEDROCK/RUMBLE/WIDE QUAKE and perk HARD STONE reworded + rewired, skill descs |

## Rates
OWED to the STARTER-HEROES TUNE lane (coordinator 11-01: RAM). Handicap rows are now 1.0, so Chieftain/Battering Beast/Gorm/Admiral rows may read different from the old tuned numbers. Smoke only (n=1, L3, human): wood(Tusker) death, hornetsnest win, marsh(Frog) death - not rates.

## Checks
- tools/geomancer.mjs GREEN (updated: stones stand, clear restores grid, 3 levels end as they began).
- tools/geo-board.mjs NEW, GREEN: stands, gnaw, ram (+open), fist (only 3rd jab), topple, 1-stone no-op, room reset.
- Not run (RAM < 1500 MB): level-reach/stuck with stones, hero-trials, keys, textfit, mark-integrity, save migration, co-op stones, mash-gate, commit tests (COMMIT.geomancer.third changed). See "owed".

## Deferred (after demo)
AIMED PLACEMENT (hold X ghost stone, distance/height by hold) and removal of the 3-tier ladder (kept: shard/fault/pillar - the bot hands use it); shard as a skill; foe AI "shooters take cover behind stones / path around" (today foes just gnaw or ram); art; L25-L50 techniques; pillar/wall/arch/step collapse into 3 aim shapes; checkpoint-touch stone reset (death/room exit only).

## ART notes
Third-jab frames still the spin art - needs a forward stone-fist swing + stone sleeve; ghost-stone placement tell; 3-state crack art by hp (currently the old crack lines); topple trail; HUD meter is the old bar - wants 3 stone pips.

## Questions for Daniel (rec first)
1. TOPPLE on UP+C instead of tap C (tap C is the ward: a tap would fight the parry). REC yes (built).
2. Keep the 3-tier hold for the demo, ship aimed placement after? REC yes (built).
3. Bosses opened 0.8 s when they ram her stone: enough as the "answer to charging bosses"? REC yes, tune in STARTER-HEROES TUNE.
