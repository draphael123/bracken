# BRACKEN — next session

Live: bracken-nine.vercel.app. Everything here is committed, pushed and deployed.

## Shipped this round (2026-09-12)

- **THE HURRICANE DECK** rebuilt to 760 columns (the longest level in the game) with THE BREACH, UNDER HER (a
  swim out under her keel with lightning on the surface), her flooded hold, THE WRECK ALONGSIDE with oil on the
  water, her powder store, storm clouds, a properly told wave, and **THE CAPTAIN** (13 hand-drawn frames; sabre
  run, brace of pistols, grapnel, powder keg, and he calls the sea and rides it). The DROWNED BOSUN is now the
  mid-level fight amidships.
- **THE HEAVY BLOW** on the attack key held, for all three heroes, with three new frames each and two talent
  nodes apiece (HEAVY BLOW/BELLOWS/OVERHEAD + SUNDER/SCORCHED EARTH/SHATTER).
- **THE LONG WATER** got the sluice stair: six stone piers riding up and down on the water (a new `vert` mover).
- **THE TIDE HERALD**: two of his six attacks had never fired (uninitialised cooldowns). Fixed, plus he calls
  his guard, his maelstrom stands spouts up inside itself, and he hurls the glaive and has to fetch it.
- **THE WINDCALLER**: two more told attacks (a thrown standing stone, a wall of hail with one gap).
- **FOUL WATER** draws its own surface (scum, slicks, gas, broken spars); masts are stepped into the deck; the
  Flotilla's floating hands, sky-wall backdrop, uncuttable stern ladder and empty gun deck are all fixed.
- **The talent tree** shows what is on F and G at all times; the map opens where you left it; mobile gets real
  full screen, landscape lock, no pinch-zoom and a TURN IT SIDEWAYS card.

## Open, in the order I would take it

1. **`ANALYSIS-WATER-LEVELS.md`** — the three I would do: a `flow` field on pools (a current: makes every pool
   in all four sea levels a decision), the Flotilla's three encounters out of its existing five foes, and one
   dive loop off the Long Water's ferry run.
2. **`DESIGN-BOSS-RUSH.md`** — no portals, no new rooms: load the real level, teleport into the arena,
   `bossStart()`, strip the level to the fight, and on death load the next. Half a day of plumbing, two passes
   of balance. "Practise this boss" falls out of it for free.
3. **Killing water still looks like swimming water** — deep pools that kill on contact need their own surface.
4. **The Quartermaster is bigger (1.25x) but not yet more distinct** — she wants a colour/silhouette pass in
   `src/redraw/pirates.js` (a red-and-gold coat, a taller plume) the way the Captain got one.

## The staples — run these after any level edit
```
node --check src/main.js && node --check src/level.js
node tools/comments.mjs && node tools/content-audit.mjs && node tools/audit.mjs && node tools/newlevel.mjs
node tools/reach.mjs && node tools/deadends.mjs && node tools/traps.mjs && node tools/quality.mjs
```

## Landmines that have bitten more than once
- A patch script that writes only at the end loses every edit when a later assert throws — write after each rep.
- **Never insert a line ending in a `//` comment in front of code that continues on the same line** — it
  swallows the rest, including a closing brace. `tools/comments.mjs` catches it; it cost an hour today.
- Re-running a patch script duplicates blocks: `updateCaptain`, the Herald's new modes and the boss dispatch
  line all ended up declared twice. Make the script idempotent before re-running it.
- `grow()` shifts coordinates: content added after a grow must be written in FINAL columns, new swings go on
  `F.R.moversExtra`, and it does NOT remap custom fields (`wash`, `masts`, `storm2`).
- A boss dispatched BELOW the 420 px range cull in `updateEnemies` freezes when the arena is wide. Bosses go
  above it.
- An arena wider than ~40 tiles puts the boss off screen; clamp anything that rides a wave to the player.
- A new boss needs: TIER, EHP/DMG/COLS, spawn case, AI, frames, `bigF`, death case + corpse, bestiary row, hurt
  voice, `windingUp()`, the **boss-death list**, and a branch on the **boss bar**. `tools/newlevel.mjs` checks
  the last four.
- The harness needs `BK.state = 'play'` after `BK.load(i)`; drive the attack with a real
  `new KeyboardEvent('keydown', {key:'x'})`, and `BK.PROG.talents` is keyed **by hero**.
