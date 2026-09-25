# claude/duneworm: THE DUNE WORM, the Sunken Caravan's boss (lane report)

Lane on this PC, 2026-09-25. Branch `claude/duneworm` off master `97dc06f` (`git merge origin/master` again at the end: already up
to date). Pushed after every green commit. Nothing touches master, nothing is deployed, and the full `npm run check` was NOT run:
only the subsets below. Level editor and Boss Rush are parked: nothing was added to either (he is not in `RUSH`).

## Commits

| sha | what |
|---|---|
| `22a1e8c` | THE DUNE WORM: design, machine, wiring, arena, art, captures, checks, lab hands, pilot tool |
| (this commit) | the caravan's MEDALS with the boss in them, and this report |

## The design

`docs/briefs/dune-worm.md`, written from the desert notes (`.claude/briefs/sunken-caravan.md`, the arc brief, the amendments,
`docs/caravan-mechanics.md`) and AMENDED in two places, each marked there: the opening (was a wagon wreck, now THE ROLLED-OUT SHADE)
and phase two (the storm is his and his hollow's alone; the wreck-smashing is gone).

## His kit, as built (`src/dune-worm.js`, marks in `src/marks.js` BY_HAND)

| move | mode | mark | why that colour | tell | damage |
|---|---|---|---|---|---|
| THE RIPPLE -> THE BREACH | `rippleTell` | `!!` red | a column from under your feet: no shield faces down | a travelling hump with the mark over it, a low rumble (`wormRipple`), "THE SAND MOVES"; tracks 1.0 s, COMMITS (a rising, cracking dome on the locked spot), bursts 0.45 s later | 30, knocks you up |
| THE SPIT | `spitTell` | `!` yellow | grit thrown from the front: a shield takes grit | reared back, throat lit (own frame), a wet gurgle (`wormGurgle`), "HE RISES TO SPIT"; a fan of 7 clots landing 35-145 px in front | 9 a clot, blockable |
| THE LUNGE AND DIVE | `lungeTell` | `!!` red | his whole weight | he surfaces 140 px off you, coils low (own frame), a hiss (`wormHiss`), "HE COILS", his SHADOW (and a red ring) on the landing; only the head coming DOWN hurts | 30 |
| THE SWALLOW | `swallowTell` | `!!` red | it opens under you | a sinkhole ring widening under you, the mark, a sucking hiss (`wormSink`), "THE SAND GIVES WAY"; then it drags you to the mouth (the quicksand verb: jump); still in it when it closes, he bites | 32 |

All four are `...Tell` modes, in `windingUp()` (named there, and the generic Tell rule), each forced and landed in the page by the
new check. Every timer is a number at spawn (asserted in Node and in the page). The ripple leads and comes every other turn (E2);
the other three come in a fresh order each round on the world's dice, and he stays under 0.25-0.55 s. Longest untouchable stretch
2.0 s (A5); every untouchable stretch is followed by a touchable one (A6). Touching him never hurts. Health 1100 (scaled by the game).

## THE OPENING: THE ROLLED-OUT SHADE (A11)

THE HOLLOW WINCH (the level's F5 machine, second use) rolls a great awning out over the middle of the hollow (+14..+26, 5 rows up,
on posts). Stand under it, step off LATE: the breach comes up INTO the canvas - TANGLED (own frame, the striped cloth over his head),
2.5 s at double damage, a green ring - and the awning comes down onto him, so it has to be wound out again. The hollow's winch only
rolls OUT (a swing at him beside it must never take the trap in). It starts OUT: the sun sends you under it and the first ripple
teaches the rest; a sign on the rim says it, and a hint the first three times. Proved caused (`tools/boss-openings.mjs`): the same
breach in the open sand, or under the awning rolled IN, opens nothing.

## PHASE TWO (A10): THE STORM, in his hollow only

One sentence: *at half he calls the storm into his hollow - the sun goes in, the wind shoves you off your spot on a counted warning,
and every ripple brings a false one.* On `src/desert-rules.js`'s clock (calm 3.2 / WARN 1.4 / GUST 1.6 s), at 100 px/s (the
pyramid's is 150), brace with block. Told: a brown haze and blowing sand, a big arrow at the edge the wind comes from, "THE WIND"
and a count; the ripple, sinkhole and marks draw over it. It ends with him, and a death puts it away (you wake outside with the fight
reset). No storm anywhere else in the level. The spit, lunge and swallow are unchanged on purpose.

## Wiring (A8)

Spawn case `duneworm` (boss), EHP/DMG/COLS, `updateDuneWormBoss`, frames `dwFrame`/`DW_F`, his own draw (`drawDuneWormFx`, ripple,
sinkhole, lunge arc), death case ("THE SAND LIES STILL"), body (`DW_F.dead`), bestiary row, BEAST_SHORT, BOSS_FELL, hurt and death
voices, POISE/KNOCK skip, `bossOpen`, THREAT 6. Music: `boss2` (the greybox's). The level's gate across the hollow ends the level
AFTER his death (`L.gateAfterBoss`/`L.gateOpen`), walked to.

## Pilot numbers (boss lab, normal health, dice pinned per row, salts 1-3, all 7 heroes = 21 fights)

`node tools/duneworm-pilot.mjs` (committed code):

| | wins | median win | median fight | by hero |
|---|---|---|---|---|
| **THE DUNE WORM** | **17/21 (81%)** | **95 s** | **121 s** | knight 3/3, warden 2/3, pyro 3/3, paladin 2/3, pirate 3/3, reaper 1/3, geomancer 3/3 |
| THE UNDEAD ARCHMAGE (Falling Tower, same tool, `LEVEL=fallingtower`) | 5/21 (24%) | 60 s | 78 s | knight 0/3, warden 0/3, pyro 0/3, paladin 1/3, pirate 1/3, reaper 2/3, geomancer 1/3 |

Average 6.6 tangles a fight: the lab's hands play the opening as the room teaches it. Tuning path (all 21 fights each): hp 900 ->
86%/97 s; dice + harder blows 81%/81 s; hp 1100 76%/103 s; lunge from afar 90%/115 s; heavier blows 100%/118 s; 0.2 s reaction
100%/120 s; gust 100 -> **81%/95 s (kept)**; a 2.2 s tangle 86%/128 s (reverted). The bot's win rate swings ~10 points on the dice
alone, so it sits just above the 60-75% band, with fight lengths inside 90-150 s. He is deliberately easier than the tower's
finale (an arc opener: the curve steps down at an act boundary, RULES L) - but see question 2.

## F9: the walk (`node tools/caravan-walk.mjs knight,warden`, no god mode)

| hero | start -> yard | yard's door -> elite's gate | elite's gate -> INTO THE WORM'S HOLLOW |
|---|---|---|---|
| knight | ARRIVED 173 s, 0 deaths | ARRIVED 69 s, 0 deaths | ARRIVED 4 s, 0 deaths |
| warden | ARRIVED 180 s, 0 deaths | ARRIVED 83 s, 0 deaths | ARRIVED 4 s, 0 deaths |

The last leg now ends in his fight instead of at the gate (the tool was changed to say so). The one-pass play bot still stops at the
Traders' Yard (col 347, STUCK, odd), as before.

## INDEX (`tools/curve.mjs`)

caravan **61 -> 62** (threat 126 -> 121, kinds 5 -> 6: the worm is weighed at 6; the garrison sprinkler placed 50 foes, not 54,
because the hollow's layout changed). fallingtower 96 unchanged. MEDALS [300, 440, 660] -> **[410, 560, 780]** (old estimate + his
~110 s median fight): still an estimate, no timed human run.

## Captures

`docs/duneworm/sheet.png` (`node tools/duneworm-art.mjs`: 11 frames, the lunge body, the ripple) and 15 real-page shots
(`node tools/duneworm-shots.mjs`): 00-hollow, 01-wake, 02-ripple, 03-commit, 04-breach, 05-tangled, 06-winch, 07-spitTell, 08-spit,
09-lungeTell, 10-lunge, 11-swallow, 12-stormWarn, 13-stormGust, 14-dead. Found by looking: the ripple read as sand on sand (now
outlined, drawn bigger, the mark higher) and the storm's warning never showed in the first capture (a harness bug, fixed).

## Checks (subsets, NOT the suite)

Every keep-green check on `22a1e8c` passed: audit, content-audit, traps, killzones, collectables, spawns, deadends, floaters,
checkpoints, skins, dressing, signs, pixels, map-grammar, one-new-foe, threat-holes, elites, ambush-single, ambush-reach,
occluders, ground-depth, slopes, slopes-trace, tells, boss-openings, boss-fight-end (32 bosses now), arena-supplies, mini-names,
textfit, comments, syntax, homepaths, dangling-paths, **dune-worm (new, added to check.mjs)**, plus caravan, caravan-level and
newlevel ("caravan plugged in"). After the MEDALS change: content-audit, comments, syntax.

Re-runs: **dangling-paths** failed once only because `docs/briefs/dune-worm.md` was not yet committed; passed after the commit.
**newlevel** flagged the worm missing by name from windingUp()/the death list (they covered him generically); named, it passes.
New assertions proved red first on sabotaged code: the opening (always-caught worm: boss-openings and caravan fail), untouchable
under the sand, the dice order, the sun under the storm, the gate after his death.

## Questions for Daniel (with recommendations)

1. **PLAY HIM.** The bot beats him 81% (band 60-75%) with fights of ~95-120 s. *Recommendation:* play the hollow before any tuning;
   if he is easy, shorten the tangle (2.5 s -> 2 s) before adding health - the opening is the fight.
2. **The Falling Tower's boss measured 24% on the same tool** (5/21, median win 60 s). The worm opens an act, so a step down is
   pacing, but a 57-point gap between neighbours is large. *Recommendation:* treat that as a Falling Tower question (a separate
   lane), not a reason to make the worm harder.
3. **MUSIC.** He plays `boss2` (the Goblin Chieftain's too). Nothing downloaded. *Recommendation:* pick one CC0 desert/percussion
   boss track for him and one for the level (it still plays `musBeach`), together.
4. **The storm's strength** (100 px/s gust, brace with block) needs a hand's feel check: the pyromancer's and geomancer's block keys
   are not guards. *Recommendation:* keep; if it feels like a coin-flip, drop to 80.
5. **The camp's awning winch rolls in and out; the hollow's only rolls out.** *Recommendation:* keep the asymmetry (a trap you
   could accidentally roll in with a missed swing is a bad trap), and say it on the sign if playtest finds it confusing.
