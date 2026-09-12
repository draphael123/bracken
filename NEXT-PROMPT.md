# BRACKEN — next session

Live: bracken-nine.vercel.app. Everything here is committed and pushed.

## THE HURRICANE DECK (level 14) — in progress, this is the live job

Built and playable as a slice; **hidden from the map** (`hidden: true` on its LEVELS row) so it cannot break
progression. Load it in the harness with `BK.load(14); BK.state = 'play'`.

What exists: `theHurricane()` in src/level.js — one ship, W264 H34, forecastle / open waist / quarterdeck,
three masts whose shrouds are climbable NET every few strides, yards (ONEWAY) above the wash, a hold below the
deck with hatches down, the existing pirate crew aboard, sea underneath that eats you.
**THE WASH** is the rule: `L.wash = { y0, y1, x0, x1, every, tell, speed, dmg }` drives `updateWash` /
`drawWash` in main.js — wait → tell (a wall builds at the edge she is coming from, with a shout and a shake) →
run (it crosses the deck, damages and throws the player, and shoves the crew too). Holding a line means the
tile at the player's chest is NET or CLIMB.

### Finish it, in this order
1. **Verify hold-on actually saves you.** A bot standing on the open deck lost 32 HP over two washes; a bot sent
   up the shrouds lost the same, so either the held check is not firing or the damage came from the crew and the
   lookout. Test with the crew removed before touching the code.
2. **THE DROWNED BOSUN** — the boss, who comes over the rail *with* a wave: his arena is the quarterdeck at
   x 212-244, he should use the wash as his clock (attack while you must also hold on), and the wave itself
   should be the thing that resets the fight. Give him a wind-up per attack and a tell colour.
3. **Lightning takes the masts down one at a time** — a fallen mast is a new bridge and a lost route at once.
   The deck-fall code from the Quartermaster is the model.
4. **Her own CC0 music** (she borrows `flotilla` right now) + creature voices for the boss, a map node, and then
   drop `hidden: true`.
5. The wash needs its own sound: there is no `SFX.wave` (it falls back to `roar`).

## Older open items
- **Verify the web cut** in Sporewood: `cutWeb()` is called from the attack-hitbox loop next to `breakCrate`,
  but the harness never started an attack (`BK.P.atk` stayed -1), so it is unverified. Tunnel curtains are waist
  high so nothing can be sealed either way, and fire burns them.
- **THE LONG WATER: 30-40 seconds longer**, platforming over rising water pillars.
- **The Tide Herald needs more going on** — one more concurrent layer, not more HP.
- **tools/newlevel.mjs** half finished: check 7 still prints the old "shows 0 wind-ups" text, and the flotilla
  dead-end false positive (arena `y1` undefined in deadends' `inRoom`).

## The staples — run these after any level edit
```
node --check src/main.js && node --check src/level.js
node tools/comments.mjs && node tools/content-audit.mjs && node tools/audit.mjs
node tools/reach.mjs && node tools/deadends.mjs && node tools/traps.mjs && node tools/quality.mjs
```
A NEW LEVEL MUST BE ADDED TO THE `TIER` TABLE in main.js or its foes fight at wood strength.

## Landmines that have bitten more than once
- A patch script that writes only at the end loses every edit when a later assert throws — write after each rep.
- Never put a `//` comment mid-line before more code (tools/comments.mjs catches it).
- Name clashes: `solidish`, `motes`, `raiseAlarm`, `balls` all collided with existing globals.
- `grow()` shifts coordinates: content added after a grow must be written in FINAL columns, and new swings go on
  `F.R.moversExtra`, not `F.movers`.
- The harness needs `BK.state = 'play'` after `BK.load(i)` or nothing updates.
