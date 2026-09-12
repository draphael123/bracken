# BRACKEN — next session

Live: bracken-nine.vercel.app. Everything below is committed, pushed and deployed.

## Shipped this round (2026-09-12)

- **THE HURRICANE DECK** rebuilt to 760 columns with THE BREACH, UNDER HER, the flooded hold, THE WRECK
  ALONGSIDE, her powder store, storm clouds, lightning that says where it will strike, a properly told wave,
  and **THE CAPTAIN** (13 hand-drawn frames, five behaviours). The Drowned Bosun has been removed entirely -
  she has one boss.
- **THE HEAVY BLOW** for all three heroes on the attack key held, with two talent nodes apiece.
- **THE CURRENT** (`flow` on a pool) + **water with no bottom** drawn as its own thing; the Long Water's river
  runs, the reef's shelf sets you back, and THE SUNKEN CART is a dive with two air bells and THE OLD EEL in it.
- **THE FLOTILLA's three encounters** (the press gang, the choke, the rigging) out of the same five creatures.
- **HER PUMPS** amidships on the Hurricane Deck: three strikes and the hold goes down for twenty seconds.
- **THE BOSS RUSH**: nineteen fights, no portals, no new rooms - it loads the real level, drops you in the
  arena, strips the level to the fight and moves on when the creature is off the board. Practise one boss with
  F on its bestiary page. On the title once Highcrown has fallen (or `?rush=1`).
- **THE FEEL PASS**: apex hang + heavier fall, fast fall, coyote off movers, corner correction, weighted
  hitstop. See `ANALYSIS-FEEL.md`.
- Earlier: the sluice stair, the Herald's two dead attacks + three new layers, the Windcaller's two new tells,
  foul water drawn as poison, mast steps, the Flotilla's floating hands and sky-wall, the F/G slot bar, the map
  opening where you left it, mobile full screen.

## Open, in the order I would take it

1. **`ANALYSIS-FEEL.md`** — the three I would do: a **melee parry window** (turns blocking into a read), a
   **ledge mantle** (the last fairness gap in the jump), and **hurt poses for the eight commonest foes**.
2. **`ANALYSIS-WATER-LEVELS.md`** — still open: the reef's either-way stretch, and air as a planned resource
   rather than a timer.
3. **The Quartermaster** is bigger (1.25x) but not yet visually distinct — a red-and-gold coat and a taller
   plume in `src/redraw/pirates.js`, the way the Captain got one.
4. **Balance the rush ramp**: every boss is tuned for a player who arrives with that level's relics and a
   checkpoint thirty seconds back. Two passes of `tools/balance.mjs` and the bot sweep.

## The staples — run these after any level edit
```
node --check src/main.js && node --check src/level.js
node tools/comments.mjs && node tools/content-audit.mjs && node tools/audit.mjs && node tools/newlevel.mjs
node tools/reach.mjs && node tools/deadends.mjs && node tools/traps.mjs && node tools/quality.mjs
```

## Landmines that have bitten more than once
- A patch script that writes only at the end loses every edit when a later assert throws — write after each rep.
- **Never insert a line ending in a `//` comment in front of code that continues on the same line.**
- Re-running a patch script duplicates blocks (it has happened four times: `updateCaptain`, the Herald's modes,
  the boss dispatch, the heavy-blow block). Make the script idempotent before re-running.
- **Regex deletions eat more than the line**: removing the Drowned Bosun's boss-bar branch took the fallback
  and the whole bar draw with it. Delete by exact string, then `node --check`.
- `grow()` shifts coordinates; content added after a grow is in FINAL columns; new swings go on
  `F.R.moversExtra`; it does not remap custom fields (`wash`, `masts`, `storm2`).
- A boss dispatched below the 420 px range cull freezes in a wide arena. Bosses go above it.
- A cooldown that is never initialised and never ticked means `undefined <= 0` is false forever and the attack
  silently does not exist. It had happened to four attacks across two bosses.
- The harness: `BK.state = 'play'` after `BK.load(i)`; drive keys with real `KeyboardEvent`s ('x' attack,
  'z' jump); `BK.PROG.talents` is keyed by hero; `BK.rushStart(i)` runs one fight.
