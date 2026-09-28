# claude/hedgewarden2: THE HEDGE WARDEN, a bit harder, two new attacks, a longer lead-up

Daniel's playtest (2026-09-28) asked for three things: a bit harder, a few other attacks, and a longer section before him.
Backlog item 15 was already approved: the brazier is his only opening, he gets a THORN LASH, and his attacks do real damage.

## What changed

**Two new told attacks** (src/hedge-warden.js). Each one has a tell, a mark and an answer.
- **THE THORN LASH**, yellow `!`. The tell: his sword arm draws back and a thorn vine coils off the blade (new art frame 10).
  Then the vine cracks along the lawn in front of him, out to 150 px, which is three times his cut's reach. Answer: guard it, or jump it.
  Backing away no longer keeps you safe from him.
- **THE ROOTS**, red `!!`. The tell: he lifts the sword point-down and the lawn cracks in front of him (new frames 11 and 12).
  Then he drives the sword into the lawn and a root crawls along the floor at you. No shield turns it.
  Answer: jump it, or stand at a brazier. A root burns out when it reaches a brazier, so a brazier is safe ground.
  This is the attack that sends you to the braziers. In phase two the roots go out both ways.
- Both marks are hand rows in src/marks.js (BY_HAND). The table was regenerated with `node tools/tells.mjs --write`.
- His order is now 11 moves: 3 cuts, 2 lashes, 2 rushes, 2 thorns and 2 roots. It used to be 7 moves: 3 cuts, 2 rushes and 2 thorns.

**The brazier is his only opening.** A stump felled on the open lawn is now "green wood": no blow takes anything off it, it says
GREEN WOOD: FELL HIM BY THE FIRE, and it regrows. Only a stump burning at a brazier can have its root cut out.
Before this change, you could root out a lawn stump if you hit it fast enough.

**A bit harder:** his hp went from 420 to 486 (+16%). The value is `HEDGE.hp`, and main.js EHP reads it. The gaps between his attacks are unchanged.

**The section is longer. THE ROOTED GARDEN** (src/witchlight.js, section 5). The lead-up to his gate went from 50 to 74
columns. It is built around his roots and the braziers:
- **TAUGHT:** an empty lawn with a brazier at 262 and a low hedge at 271 that sends roots toward the brazier. A root does 6 there.
  The sign reads "THE GARDEN HEDGES PUT OUT ROOTS. JUMP THEM, OR STAND BY THE WITCH-FIRE."
- **DEVELOPED:** the tall hedge you walk under (278-287). A root comes down the tunnel at you, under a roof too low for a high
  jump. There is a brazier inside the tunnel at 281. The hedge-top imps and the apprentice are here.
- **Then:** the tall hedge you climb, with its silver and its armour elite (now at 300), and the topiary.
- **TWISTED:** THE WARDEN'S LAWN (307-320). A root knot in the middle sends roots out BOTH ways, to a brazier at each end
  (308 and 320), with topiary and an imp on it. It is his room in small. Then come the checkpoint at 321, the gate sign and him.
- Checkpoints are at 256, 290 and 321. There are 3 encounters (9 foes). The level has 66 creatures, 2.56 a screen.
- The rooted hedges and the braziers are data: `WL.FIRES`, `WL.ROOTS`, and `L.witch.fires` / `L.witch.roots`.
  The roots code is shared with his attack (`stepRoots` / `drawRoots` in hedge-warden.js). main.js keeps the live roots on `L.hedgeRoots`.

## THE COLUMN SHIFT (for claude/gargoyle4 and the integrator)

Every column from 299 on moved **+24**, and the level is 619 wide instead of 595.
- The Warden's room: 300-331 is now 324-355. The gate: 332 is now 356.
- The battlements: 333-532 are now 357-556.
- The stair's top: 533-594 is now 557-618. The Gargoyle's arena: 546-590 is now 570-614.
- Everything in `WL` moved with it: BATT, EXAM, ARENA, SLABS, WELLS, LIGHT, STEPS and MARKS.

The gargoyle section's code was renumbered **mechanically**: every integer literal of 299 or more had 24 added. Nothing else in it was touched.
If claude/gargoyle4 edits src/witchlight.js sections 6 or top, **take their version of those lines and add 24 to every column literal of 299 or more**.
Rows are all under 92, so any number of 299 or more is a column.
I fixed the gargoyle checks' hard-coded columns in the same way: tools/gargoyle-stomp.mjs lines 89, 92 and 112, and
tools/whelps.mjs lines 68, 83, 86 and 88. **Any new test on their branch that names a column past 298 needs +24.**

## Pilot (normal health, 1 seed, knight / warden / pyro; `node tools/hedge-warden-pilot.mjs 1 knight,warden,pyro`)

The pilot can now take a list of heroes. Its hitBy numbers are in health points, labelled by his move at the moment of the hit.
A root's bite is labelled `roots`.

| | knight | warden | pyro |
|---|---|---|---|
| BEFORE | win 32.6 s, took 18 (thorns 18) | **died** at 69 s, him at 27% (thorns 54, cut 21, rush 18, other 7) | win 68.6 s, took 85 (rush 64, cut 21) |
| AFTER  | win 44.7 s, took 30 (thorns 18, roots 12) | **died** at 91 s, him at 19% (thorns 45, cut 21, rush 18, roots 16) | win 51.7 s, took 34 (rush 18, roots 16) |

- Wins were 2 of 3 both times. The knight's fight took 37% longer and he took two thirds more damage.
- The warden bot got further before dying.
- The pyro's numbers swing with the random seed, so with one seed they don't show much.
- The bot never took a lash hit: it jumps or guards the lash on cue.
- Winning fights still run 45-52 s, under the old 90-150 s aim. The bot plays every tell perfectly.

## Checks run (all green on 4b61e11)

- witchlight: with new assertions for the lash, the roots, the garden, the marks and all five attacks told.
- boss-openings: with a new assertion that a lawn stump takes 0 and a burning one takes a blow twice over.
- boss-fight-end: it now holds his opening open with `burnT`, where it used to use `open`.
- whelps and gargoyle-stomp: after the column shift.
- gargoyle-smash, mini-walls, slopes-trace, architecture, checkpoints, skins, dangling-paths, npc-removal, elites, spawns,
  threat-holes, tells, signs, killzones, checkpoint-gaps, deadends, collectables, additional-areas(+runtime), class-spurs and
  one-new-foe: all green.
- Not in the suite, run by hand: queue-bosses (13 frames, anchor holds), witchlight-v2, curve and gargoyle-shots (images deleted).

**Proved failing on master first** (cd35d24, with the new tests copied in):
- Every new witchlight assertion failed there: the marks were blank, the lead-up was 50, there were no fires or roots, the lash and the roots were never struck, only 3 attacks were told, and the garden did nothing.
- The two exceptions are "a jump clears the lash" and "a shield turns it". They passed trivially because there was no lash to take damage from.
- On master the boss-openings lawn stump took 30.

Two old assertions assumed a lawn stump could be killed, and I changed them to kill a **burning** stump instead:
the gate check in witchlight.mjs, and boss-fight-end. That is the design change they now test. It does not weaken them.

## UNVERIFIED

- Nobody has played it with real keys. I only saw the garden and the new tells in two captured frames: the roots crawl, burn out at a brazier, and go both ways.
- The medal times (`MEDALS.witchlight` 300/450/680) were not raised for the 24 extra columns. They already predate the doubled battlements.
- I did not run the Gargoyle's own pilot (gargoyle-pilot.mjs). His fight code is unchanged; only his columns moved, and the stomp, smash and whelp checks are green.

## QUESTIONS FOR DANIEL (my recommendation first; the conservative option is what's built)

1. **The second new attack: THE ROOTS (built) or growing hedge walls?**
   I recommend the roots. They are a floor hazard you jump, they burn out at a brazier, so they push you to the fire (his opening), and the garden before him teaches them.
   Hedge walls that cut up his room would need new collision code and could trap a hero on the wrong side of a brazier.
2. **How hard: +16% hp only (built), or also shorter gaps between attacks (e.g. 1.3 s to 1.15 s)?**
   I recommend playing it first. The bot's wins still run under a minute, but the brazier-only opening and the two new attacks already add a lot for a human.
3. **The lash's reach: 150 px (built).** Its job is to stop you standing off him. I recommend keeping it.
   If it feels unfair from across the room, 120 px keeps its job.
4. **The garden's roots do 6 on the taught lawn and 8 after it; his own roots do 12.** I recommend keeping the garden roots gentle,
   since the garden teaches and he tests. Say if you want the garden to bite as hard as he does.
5. **"GREEN WOOD" on a lawn stump:** it shrugs every blow. I recommend keeping this as the approved "brazier is the only opening".
   The softer option is to let a lawn stump take a quarter: that keeps a slow way through for a player who never finds the fire.

## Merged gargoyle4

- I merged `origin/claude/gargoyle4` (0ff8752), and it merged cleanly with no conflicts.
  - Its changes don't name any level column: the numbers of 299 and up in them are pixel positions in its own test rooms, not level columns.
  - Its new `tools/gargoyle-playtest.mjs` finds the Gargoyle's slabs from the level itself, so it needed no +24.
  - `tools/check.mjs` keeps every name from both sides, including `gargoyle-playtest`.
  - `src/marks.js` keeps every row from both sides, and `node tools/tells.mjs --write` changed nothing.
- `MEDALS.witchlight` went from 300/450/680 to **312/468/707**, which is the old times multiplied by 619/595 (the new width over the old one).
- After the merge these checks were green:
  - gargoyle-playtest, gargoyle-stomp, gargoyle-smash, whelps, witchlight, boss-openings, boss-fight-end and tells;
  - the required checks: architecture, checkpoints, skins, dangling-paths, slopes-trace and npc-removal.
- boss-fight-end failed once when it ran alongside the full suite: the browser tab closed mid-run ("Inspected target navigated or closed"). Run again on its own, it passed 45 of 45.
