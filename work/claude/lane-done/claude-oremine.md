# claude/oremine — lane report (2026-09-25)

Daniel's approved request: THE ORE ROAD should feel like a working goblin mine. The design is in
`docs/briefs/ore-road-mine-life.md`, written before any code. There is one commit per chunk, and every push was green on
the named subset. I did not touch master, did not deploy, did not run the full `npm run check`, and did not add anything
to the level editor or Boss Rush.

**The sentence (F8): THE ORE ROAD IS A WORKING MINE, AND YOU ARE THE INTERRUPTION.** You see the work, you hear the work,
and you watch it stop when a goblin sees you.

## Commits

| sha | chunk |
|---|---|
| `cfb786a` | the brief, `tools/oremine-shots.mjs`, and the *before* captures |
| `689e657` | 1. MORE ORE: seams in the rock faces, heaps, spills and a full cart, none over a hazard or a tell |
| `eb97ae4` | 2. GOBLINS AT WORK: five work loops with a told alert, and the new page check `tools/ore-work.mjs` |
| `4bc9f0d` | 3. MINE THEMING: furniture and landmarks, one set for every place |
| `66f7d80` | merge `origin/master` (97dc06f, the spider banking fix; no conflict) |
| (this commit) | the *after* captures, the walk tool (sets each hero), and this report |

## The mine's places, in route order (`MINE_PLACES` in `src/ore-road.js`; the check holds every place to its list)

1. **THE ORE YARD** (0–50): THE CRUSHER and its feed rail. A rock goblin pushes a full cart to the lip and tips it in. The spoil heap sits on the spoil bank.
2. **THE LOADING HOUSE** (51–67): the tool rack, the tally board on the loft, and a sapper hauling sacks.
3. **THE FIRST SPAN** (68–135): the pylons. Their goblins are lookouts and do not work. Ore has spilled off the skips.
4. **THE SORTING TOWER** (136–203): THE LIFT CAGE is cranked up to the middle deck. There is a sorting table with bins, an ore chute from the top deck to the bin, five timber sets (two lit), a full cart and heaps.
5. **THE TIPPLE HOUSE** (228–240): a sapper and a miner at work on the stage.
6. **THE COLLAPSED SPAN** (272–339): the overturned cart off its torn rail, and a sapper salvaging sacks.
7. **THE BRAKEMAN'S HUT** (340–352): the brakeman's hoist, a heavy cranking a cage up the pillar.
8. **THE WINCH HOUSE** (408–445): THE MINE OFFICE, with a lit window, a desk and ledger, and a tally board. There is also a tool rack, timber sets, and a rail-yard cart tipped onto the spoil.
9. **THE DRUM YARD** (446–475): a sorting table (the javelin) and a sapper's sacks.

Nothing is placed past column 475, so the Winchmaster's room is untouched. Nothing new is solid. The route, the
checkpoints and the kill zones did not move. There are 330 seams in the rock faces (4 ores × 4 shapes, a third of them
glint) and 19 floor ore props. Every choice is a hash of the tile's position, never a dice roll.

## The work loops, as built

Sixteen goblins already in the level now work. **No creature was added**, so the INDEX and the density stay the same.
The level's own three foes (tippler, sheargob, gaffer), the elite and the ambush crowd never work.

| loop | who | what it does |
|---|---|---|
| PICK | 6 miners | round three's seam work (chips, a *tink* on the blow, carries the ore to a station), now held by the alert |
| CART | 2 rock goblins (the ore yard, the winch house) | pushes the cart along its rail, tips it (ore tumbles), pulls it back, fills it. Wheels rumble |
| SACK | 4 sappers (loading house, tipple house, collapsed span, drum yard) | stack to drop and back, with a thud |
| SORT | the sorting yard's rock goblin, the drum yard's javelin | flicks ore off the table into the bins |
| WINCH | 2 heavies (the lift cage, the brakeman's hoist) | cranks, and the cage runs up its hoist and down. The ratchet clicks |

There is a lantern on a gallows post over every workplace, and it gives light. The two miners with no seam on their floor
(the pylon's, the winch house's) stand guard.

**The alert.** While a goblin works, `oreWorkStep` owns it and its own update does not run, so no swing, throw, bomb or
bite can begin. Things a goblin works with are drawn, not movers. It notices you:
- by sight ahead of it (150 px, the same distance any goblin notices you);
- by ear behind it (56 px);
- when struck, or when a neighbour dies;
- when a working goblin within 110 px shouts.

The alert is told: the work drops (the sack falls, the cart stands, the cage runs down and bangs), the goblin gives the
startled jump, shouts **OI** (narration, not a `!`), and plays its notice sound. Then there is 0.6 s of startle before the
goblin fights on its own marks. It never goes back to work. A sapper killed before his alert drops no bomb. No new tells
exist, so `src/marks.js` needed no hand rows. `node tools/tells.mjs --write` changed nothing (line endings only, reverted).

## Winchmaster pilot (`tools/winchmaster-pilot.mjs`: bossLab, dice pinned per row, salted passes)

| | runs | wins | median win |
|---|---|---|---|
| before, 4 passes | 24 | 21 (88%) | 128.8 s |
| after, 4 passes | 24 | 20 (83%) | 117.5 s |
| before, 8 passes | 48 | 42 (88%) | 128.8 s |
| after, 8 passes | 48 | 43 (90%) | 117.5 s |

**He did not change. Only the dice stream moved, and I proved it rather than assumed it.**
- The pilot replays exactly. Re-running it on the untouched base, and again on base + master, reproduced every row.
- With only the work loops switched off (WORKS emptied), the pilot again reproduces every before row exactly. So the seams, the props, the lights, the sounds and the merge change nothing.
- The difference comes from two working goblins outside his west wall: the winch house's cart goblin and the drum yard's sapper, whom bossLab leaves alive. They no longer idle and mutter (idling rolls `Math.random`), so the pinned dice land differently.
- In both runs every point of damage came from him or the pit (`hitBy`), none from a bystander.
- 8 passes: 88% before, 90% after. Both are still above the 60–75% band, as they were before (not tuned; out of scope).

## INDEX (`tools/curve.mjs`)

oreroad: **114 before, 114 after.** cols 614, foes 73, thr/100 29.9, hazard 55, gap 37 — all unchanged. (Stormhold moved
112→116 from the master merge, not from this lane.)

## Walk (F9, `tools/oreroad-walk.mjs`: the play bot, no god mode, knight then warden)

The same before and after: **0 bugs, 0 deaths**. Both heroes stop where a plain run cannot board a moving skip:
- knight at 70/74–75, warden at 8/70;
- walked: knight 23%→24%, warden 19%→22%.

This is the bot's known limit (RULES M). `ore-ride` proves every line carries a hero.

One new ODD in the after run: `RUNTIMEFLOAT sapper floating @96,37`. That is the first pylon's lookout sapper, who does
not work. It looks like his own flee off the pylon edge caught mid-fall. The code he runs is unchanged by this lane, so I
think the dice brought it out this time, but I have not proved that.

The helper also had a bug: `BK.playtest`'s `heroes` option is read by nothing, so the first walk played only the
current hero. The tool now sets each hero itself.

## Captures (`docs/oremine/`, real page, 2x)

Fourteen route spots, before and after: `00-yard` … `13-drum-house`. The drum house is unchanged.

There are also five after-only at-work pictures, with the hero standing just behind a worker so the goblin keeps working:
`14-at-work-sorting-table`, `15-at-work-lift-cage`, `16-at-work-brake-hoist`, `17-at-work-rail-yard`, `18-mine-office`.

## Checks

The named subset was run at every chunk and after the merge: audit, traps, killzones, collectables, spawns, deadends,
floaters, checkpoints, skins, dressing, signs, pixels, map-grammar, one-new-foe, threat-holes, elites, ambush-single,
ambush-reach, occluders, ground-depth, ore-road, ore-ride, **ore-work (new, in the check list inside it)**, tells,
boss-openings, boss-fight-end, arena-supplies, textfit, comments, syntax, homepaths and dangling-paths. **All green after the
master merge.** Re-runs:
- `boss-fight-end` failed on the untouched batch17 baseline and at every chunk, always the same row: the Hanging Wood's mini spider, "the fight never started". It is green alone after merging master's 97dc06f (the dropping-spider fix).
- `dangling-paths` failed once, because `tools/ore-road.mjs` cited `tools/ore-work.mjs` before it was tracked. It was green once staged.

**New assertions, each proved red first.**
- `tools/ore-road.mjs`:
  - **Seams**: in rock, off spikes, out of his room.
  - **Variety**: 4 ores × 4 shapes, no pairing over 20%.
  - **Floor props and furniture** are clear by `mineBlocked`, the brief's "never over a hazard or a tell" as a rule. The first placement broke it ten times.
  - **WORKS rows**: every row found its goblin, and every rail, sack run, table, winch and cage shaft is on floor or in open air.
  - **The eye's rule.**
  - **Places**: every place has its landmarks, and no two are dressed alike.
- `tools/ore-work.mjs` (page), three promises:
  - **No blow before the alert and startle**, and no wind-up either. Red with the gate removed (throwTells un-alerted) and with a loop that hurts (420 early blows).
  - **Every loop returns to fighting when it sees the hero.** Red with `workSees` dead.
  - **Every loop visibly works.**
  - One honest caveat: removing the gate alone does not make the damage assertion fail, because a goblin still under its loop never finishes a blow. The stricter wind-up assertion is the one that catches that mutation.

## Questions for Daniel

1. **Is 56 px "hear behind" right?** It makes creeping up on a working goblin a real reward: you get the first cut before he alerts. *Recommend: keep it, and play it once. If sneaking feels cheap, raise it to ~90.*
2. **Should a goblin go back to work** if you leave and he loses you? Now he never does, which is simple and cannot be exploited. *Recommend: leave it.*
3. **The Winchmaster's band.** His pilot sits at 88–90%, above the 60–75% band both before and after. The group-B review's "0.5x except while jammed" would be the fix. *Recommend a separate lane. This lane was told not to change him and did not.*
4. **Workers outside the boss walls change his pilot's dice.** It is harmless, but it makes the pilot sensitive to the level. *Recommend: have bossLab clear the whole level's non-boss creatures, not only those within ~37 tiles, so his pilot measures only him. That is a change in `src/lab.js`, out of this lane.*
5. **The DRESS row for oreroad** (`src/level.js`) still sprinkles cairns in a mine. *Recommend swapping cairn for a mine piece in a small art pass.*
