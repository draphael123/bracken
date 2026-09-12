# BRACKEN — next session

Live: bracken-nine.vercel.app. Everything below is committed and deployed unless marked.

## Open, in Daniel's order

1. **Verify the web cut.** A slash should cut a whole T.WEB curtain (`cutWeb()` in main.js, called from the
   attack-hitbox loop next to `breakCrate`). In the test harness the attack never started (`BK.P.atk` stayed -1
   with both `BK.press('attack')` and holding `BK.keys.attack`), so the cut is **unverified** — check it by hand
   in Sporewood (the tunnels ~x174/180/188/195, the grove ~x81). Tunnel curtains are waist high so they can be
   vaulted even if the cut is broken; fire already burns them.
2. **THE LONG WATER: 30-40 seconds longer** — platforming over rising water pillars (Daniel's words).
3. **The Tide Herald needs more going on** — one more concurrent layer, not more HP.
4. **tools/newlevel.mjs** is half finished: check 7 still prints the old "shows 0 wind-ups" text (a `s.replace`
   without an assert silently failed), and the flotilla dead-end false positive (arena `y1` undefined in
   deadends' `inRoom`).
5. **Next level**: ideas are in `IDEAS-NEXT-LEVEL.md`.

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
- `grow()` shifts coordinates: content added after a grow must be written in FINAL columns.
- `F.movers.push` does not exist on a grown painter — push onto `F.R.moversExtra`.
- The test harness needs `BK.state = 'play'` after `BK.load(i)` or nothing updates.
