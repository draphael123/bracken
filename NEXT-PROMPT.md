# BRACKEN — next session

Live: bracken-nine.vercel.app. Everything here is committed, pushed and deployed.

## Done: THE HURRICANE DECK (level 14)

One ship, one storm. 384 columns, her own CC0 music, nine checkpoints, twenty-eight hands aboard, three
lanterns for the squire (they pay THE STORM LINE), lightning that takes the fore and main masts down one at a
time, and THE DROWNED BOSUN on the quarterdeck. She is on the map past the Flotilla and no longer hidden.
Measured: max-aggression TTK 79 s (the Quartermaster is 92 s); a bot that stands in his arena dies in 23 s.
All seven tools clean.

The one thing that is a reskin rather than bespoke: the Bosun is the BOSUN's sprite tinted, weeded and drawn
at 1.45x (`drownedFrom()` in main.js). It reads as "the same man, drowned", which is the fiction, but if you
want him hand-drawn that is a job in src/redraw/pirates.js in the idiom documented at the top of that file.

## Next, in the order I would take it

1. **The heavy attack** — see `ASSESSMENT-HEAVY-ATTACK.md`. The verdict: one new verb (hold X) for all three
   heroes, one 3-point talent per class, two chain talents, and re-measure every boss TTK afterwards.
2. **THE LONG WATER: 30-40 seconds longer**, platforming over rising water pillars (still open from before).
3. **The Tide Herald needs more going on** — one more concurrent layer, not more HP.
4. **THE WINDCALLER has one told attack** — `node tools/newlevel.mjs` says so and it is right; his kit is thin
   next to the later bosses.
5. Optional: bespoke art for the Drowned Bosun.

## The staples — run these after any level edit
```
node --check src/main.js && node --check src/level.js
node tools/comments.mjs && node tools/content-audit.mjs && node tools/audit.mjs && node tools/newlevel.mjs
node tools/reach.mjs && node tools/deadends.mjs && node tools/traps.mjs && node tools/quality.mjs
```
`tools/newlevel.mjs` now checks the things that bit us building her: the TIER table, unique music, creature
voices, a map node, a checkpoint before the boss, water laid on top of land, the boss on the **boss-death
list** (or the arena walls never open and the level never ends), the boss's branch on its own **health bar**
(or it is called HORNET QUEEN), the boss in **windingUp()** (or it winds up in silence), and whether the start
can reach more than a sliver of the level (her forecastle was a sealed box and every other tool passed it).

## Landmines that have bitten more than once
- A patch script that writes only at the end loses every edit when a later assert throws — write after each rep.
- Never put a `//` comment mid-line before more code (tools/comments.mjs catches it).
- Name clashes: `solidish`, `motes`, `raiseAlarm`, `balls` all collided with existing globals.
- `grow()` shifts coordinates: content added after a grow must be written in FINAL columns, and new swings go
  on `F.R.moversExtra`, not `F.movers`. `grow()` does NOT remap custom fields (`wash`, `masts`).
- The harness needs `BK.state = 'play'` after `BK.load(i)` or nothing updates, and there is no `BK.press`:
  drive the attack with `window.dispatchEvent(new KeyboardEvent('keydown', {key: 'x'}))`.
- An arena wider than about 40 tiles puts the boss off screen. Clamp anything that rides a wave to the player.
- quality.mjs is the honest mirror for a new level: match the neighbours' foes/100, signs, checks and worstGap.

## Verified this session
- The Sporewood **web cut works**: one slash takes the whole curtain (36 web tiles to 34, column cleared).
- Hold-on in the wash: a bot on a shroud takes nothing across 25 s of waves; on the open deck it loses ~16 a
  wave; parked on the stern edge through four waves it never went over the side.
