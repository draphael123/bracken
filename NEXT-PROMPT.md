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

## Open — after the long playtest session of 2026-09-12

**THE ONE MEASUREMENT THAT SHOULD DRIVE THE NEXT SITTING.** I counted what each level is made of, and how
CONCENTRATED its roster is (top-3 creatures as a share of everything you fight):

    act 1 (wood..scree)        machines 2.3  kinds 10.7  hazards 0.3  top3 64%
    act 2 (hanging..crown)     machines 4.2  kinds 11.8  hazards 0.6  top3 60%
    act 3 (longwater..lamplit) machines 3.2  kinds  7.6  hazards 3.0  top3 72%

Act three's rosters have since been rebalanced in place (hurricane 14 kinds/51%, lamplit 11/51%, reef 11/45%,
flotilla 10/56%). The remaining structural problem is THE RAMP, which is still a sawtooth.

1. **THE RAMP.** `node tools/curve.mjs`: stockade +35 after marsh, storm +44 after moor, longwater -34 after
   crown, and lamplit - the LAST level - easier than the eleventh. Nothing else in the game is this wrong.
2. **TERRAIN CHANGES THE PLAYER'S SPEED.** Measured in the stockade: on a PLANK he covers 0.92px a step,
   which is exactly right for 92px/s at the 60% world speed. On two stretches of plain SOLID he covered 1.25
   and **5.75** px a step with the same `vx` of 92. Something other than `vx` is moving him: `P.driftAcc`
   (main.js, in updatePlayer) and `updateSlide` are the suspects, and the stockade has slides in it.
3. **THE FORGEMASTER AND THE GOBLIN QUEEN ARE BACK TO BACK** with an unopenable gate on the left of that
   room. There must be a minute or two of play between them.
4. **THE QUEEN'S WALKWAY.** Daniel asked to remove it. IT IS HER ONLY DAMAGE WINDOW - `gqOpen` is
   `mode === 'pinned'`, and the only thing that pins her is her own gallery, held up by three breakable
   `support` pillars. The ward is legible now (she wears it, a turned blow says WARDED, and the first three
   say where the answer is), so ask again before deleting: if it still goes, the fight needs a new window.
5. **THE HURRICANE** has its gunport doors; it still wants the lightning-platforming run and the poison
   crossing Daniel asked for.
6. **THE SPIRE AND THE SCREE PATH** have one machine each, and both want a platforming section.
7. **THE OWL REEVE** is twice the size but still wants a redraw rather than a scale - eight frames of 64-wide
   pixel art, done properly.
8. **Seven levels use stock library music** (theme, theme2, theme3, theme4, cave, town, adventure). Every
   level does have its OWN track - none are shared - but those seven sound generic. ElevenLabs
   `generate_music` is available if Daniel wants bespoke ones.
9. Posed hurt frames for sprig, shield, soldier, brute. Music that responds to combat. A reason to replay.

## Standing warnings

- **THE BUFFER IS 320x180** on the default 'close' camera. Lay every menu against that, measure text with
  `textW`/`fitText`, never `len * 6`.
- **A `//` comment in a patch string swallows the rest of the line.** Use `/* */`. `tools/comments.mjs` catches it.
- **Patch method:** python scripts with asserted exact-match `rep(a, b)` that write the file after every
  replacement, made idempotent before re-running. Large replacements go in a scratchpad `.py` written with the
  Write tool — bash heredocs break on some content.
- A new level must be added to `TIER`, `MEDALS` and a `NODES` list, or it will not appear on the map.
