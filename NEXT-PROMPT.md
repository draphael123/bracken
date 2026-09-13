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

## Open, in the order I would take them

1. **THE RAMP IS A SAWTOOTH.** `tools/curve.mjs` says stockade is a +27 wall after marsh, storm a +44 wall
   after moor, longwater 34 easier than crown, and LAMPLIT — the last level — is easier than the eleventh.
   The reef (46) is as light as the second level and sits thirteenth. Work already done: a placement helper
   found safe standing spots at reef `108,23 148,22 340,29 184,22 55,24 373,23 212,31` and lamplit
   `231,21 68,37 392,21 576,21 360,21 617,19 428,21`. The spire is packed vertically and needs a different
   finder (band by rows, not columns).
2. **PERFORMANCE.** The bot's worst frame: spore 28ms, storm 27ms, moor 20ms, spire 17ms, hanging 17ms.
   Those four cannot hold 60fps on a slow machine. Find what each is drawing per frame that it does not need to.
3. **A silver at 361,25 in Kingswood is outside the reach fill** (`node tools/reach.mjs kings`). It sits on
   open ground at row 25 with the floor at 26, so the pocket it is in must be walled off from the start.
4. **POSED HURT FRAMES** for the four most-seen creatures (sprig, shield, soldier, brute). They take a blow
   and keep their idle pose.
5. **THE FIRST NINETY SECONDS.** Rework the opening of BRACKEN WOOD: the bot needed lifting six times in it,
   at tiles 53, 92, 174, 255 and 339, and died eighteen times.
6. **MUSIC THAT RESPONDS** — a combat/explore split.
7. **A REASON TO REPLAY** — a seeded run, or NG+.
8. **THE GREAT FORGE** — the next level. `IDEAS-NEXT-LEVEL.md` has the pitch; section F has the template.
   Daniel has twice said "all but the new level", so do not start this without asking.

## Standing warnings

- **THE BUFFER IS 320x180** on the default 'close' camera. Lay every menu against that, measure text with
  `textW`/`fitText`, never `len * 6`.
- **A `//` comment in a patch string swallows the rest of the line.** Use `/* */`. `tools/comments.mjs` catches it.
- **Patch method:** python scripts with asserted exact-match `rep(a, b)` that write the file after every
  replacement, made idempotent before re-running. Large replacements go in a scratchpad `.py` written with the
  Write tool — bash heredocs break on some content.
- A new level must be added to `TIER`, `MEDALS` and a `NODES` list, or it will not appear on the map.
