# BRACKEN — what is on the bench

Live: https://bracken-nine.vercel.app  ·  deploy: `vercel deploy --prod --yes` then `git push`
`RULES-LEVELS-AND-BOSSES.md` is the law. Section G is the playtest bot.

## Run this first

```
node --check src/main.js && node --check src/level.js
node tools/comments.mjs && node tools/audit.mjs && node tools/reach.mjs && node tools/quality.mjs
node tools/curve.mjs && node tools/content-audit.mjs && node tools/traps.mjs && node tools/deadends.mjs
```

then the bot, which is the one that sees art and crashes:

```
bracken-nine.vercel.app/?playtest=1        (or localhost:5860/?playtest=1)
```

If the BUGS column is not empty, do not ship.

## Open — Daniel's live playtest queue (2026-09-12, in the order he reported them)

**LEVEL DESIGN** (the big ones; each wants its own sitting)
1. **THE MARSH** — only ONE log section, and more lilypad jumping in the fog. The bot also needs lifting at
   marsh tiles 32 and 56 twice over, and dies more there than anywhere else in the game.
2. **THE STOCKADE** — good as it is, but it needs at least one PLATFORMING section, and GOBLIN KNIGHTS should
   start appearing here.
3. **THE SCREE PATH** — needs platforming sections too, and THE RAM LORD should change the path he runs once
   he enrages.
4. **THE FORGEMASTER AND THE GOBLIN QUEEN ARE BACK TO BACK.** There must be a minute or two of play between
   them. There is also a gate on the LEFT of that room that cannot be opened - find out whether it is meant
   to be openable or should not be drawn as a gate at all.
5. **A GAP BETWEEN THE CASTLE AREAS** — an `interiors` band stops short and leaves a purple void with a floor
   strip under it. (Screenshot: dark oak + purple, so Highcrown or Stormhold.)

6. **THE SHIPWRECK REEF wants more of itself** — Daniel: "more we can do with different routes, water jets
   that change speed, etc." The bones are there (`gusts` with `current: true`, `capped` pools, air bells);
   what it needs is a fork with two honest routes and jets that push at different strengths.
7. **THE QUEEN'S WALKWAY.** Daniel asked to get rid of it. READ THIS FIRST: it is not scenery. The row-14
   gallery is the ONLY way to damage her - `gqOpen = e => e.mode === 'pinned'` - and it is held up by three
   breakable `support` pillars; break one and that section falls, pins her, and takes 7% off her. Since the
   ward is now legible (she wears it, a turned blow says WARDED, and the first three turned blows say where
   the answer is) the walkway may now read as the answer rather than as clutter. Ask before deleting it; if
   he still wants it gone, the fight needs a different window or it becomes unwinnable.
8. **A WHITE BLOB FOLLOWS THE REAPER.** Reported four times with screenshots, on different levels, always a
   pale rectangle beside him. THE PASSING was drawing a WHITE silhouette of him and that was fixed and
   deployed - confirm with a hard refresh before chasing anything else. If it persists, it is not the ghost.

**FEEL AND FIGHT**
6. **TERRAIN CHANGES HIS SPEED.** Measured in the stockade: on a PLANK bridge he covers 0.92px a step, which
   is exactly right for 92px/s at the 60% world speed. On two different stretches of plain SOLID he covered
   1.25 and **5.75** px a step with the same `vx` of 92. So something other than `vx` is moving him -
   `P.driftAcc` (main.js ~3354) and `updateSlide` are the suspects, and the stockade has slides in it. Find
   out what is applying a drift outside a slide zone.
7. **THE RAMP IS STILL A SAWTOOTH** - stockade +27 after marsh, storm +44 after moor, longwater -34 after
   crown, and lamplit (the LAST level) easier than the eleventh.
8. Posed hurt frames for sprig, shield, soldier and brute.
9. Music that responds to combat; a reason to replay.

**ART**
10. The Owl Reeve is twice the size now but still "a little basic" - he wants a redraw, not a scale. That is
    eight frames of 64-wide pixel art and should be done properly.
11. Early-level music: every one of the sixteen levels DOES have its own track (I checked - `crown` is
    `highcrown`, nothing is shared), but seven of them are stock library tracks with stock names (theme,
    theme2, theme3, theme4, cave, town, adventure) and they sound it. New ones need new audio files -
    ElevenLabs `generate_music` is available if Daniel wants bespoke ones.
12. Verify the claim that every creature has its own voice: `SFX.dieOf(t)` coverage against the full
    creature list.

## Standing warnings

- **THE BUFFER IS 320x180** on the default 'close' camera. Lay every menu against that, measure text with
  `textW`/`fitText`, never `len * 6`.
- **A `//` comment in a patch string swallows the rest of the line.** Use `/* */`. `tools/comments.mjs` catches it.
- **Patch method:** python scripts with asserted exact-match `rep(a, b)` that write the file after every
  replacement, made idempotent before re-running. Large replacements go in a scratchpad `.py` written with the
  Write tool — bash heredocs break on some content.
- A new level must be added to `TIER`, `MEDALS` and a `NODES` list, or it will not appear on the map.
